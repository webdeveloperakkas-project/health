
/* =========================================================
   GLOBAL SCOPE 24 CMS
   Supabase-backed content workflow and permanent media storage.
========================================================= */
(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const STORAGE_KEY = "everyday-atlas-cms-posts-v1";
  const MEDIA_BUCKET = "everyday-atlas-media";
  const db = () => window.EA_SUPABASE;
  const categories = {world:"World News",tips:"Daily Tips",technology:"Technology",sports:"Sports",entertainment:"Entertainment",health:"Health",lifestyle:"Lifestyle",travel:"Travel",finance:"Finance",hospitals:"Hospitals (legacy)"};
  const placementLabels = {latest:"Latest",popular:"Popular",myChoice:"Favorites"};
  function placementsFor(post){ const values=Array.isArray(post.postTypes)?post.postTypes:(post.postType?[post.postType]:["latest"]); return [...new Set(values.filter(value=>placementLabels[value]))]; }
  const languages = {en:"English",bn:"বাংলা",hi:"हिन्दी",de:"Deutsch",fr:"Français",es:"Español"};
  let posts = [];
  let editingId = null;
  let coverData = "";
  let currentKeywords = [];
  let cloudReady = false;
  let cloudLoading = false;

  function loadLocalPosts(){
    try { const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(saved)?saved:[]; }
    catch(error){ return []; }
  }
  function fromDatabase(row){
    return {id:row.id,title:row.title,content:row.content_html||"",category:row.category==="beauty"?"lifestyle":row.category,
      subcategory:row.subcategory||"",language:row.language||"en",postTypes:Array.isArray(row.post_types)?row.post_types:["latest"],
      postType:(row.post_types||["latest"])[0],featuredStories:!!row.featured_stories,featured:!!row.featured_stories,
      status:row.status||"draft",scheduledAt:row.scheduled_at||"",excerpt:row.excerpt||"",metaTitle:row.meta_title||"",metaDescription:row.meta_description||"",focusKeyword:row.focus_keyword||"",keywords:row.related_keywords||row.keywords||[],videoUrl:row.video_url||"",
      cover:row.cover_url||"",views:Number(row.views)||0,createdAt:row.created_at,updatedAt:row.updated_at,publishedAt:row.published_at};
  }
  function cloudinarySettings(){
    const defaults={cloudName:"r2lo6mql",uploadPreset:"global_scope24_upload"};
    try{
      const saved=JSON.parse(localStorage.getItem("global-scope24-cloudinary")||"{}");
      return {cloudName:String(saved?.cloudName||defaults.cloudName),uploadPreset:String(saved?.uploadPreset||defaults.uploadPreset)};
    }catch(_){return defaults;}
  }
  function updateCloudinaryStatus(){
    const config=cloudinarySettings(),ready=!!(config.cloudName&&config.uploadPreset);
    if($("#cloudinaryCloudName"))$("#cloudinaryCloudName").value=config.cloudName||"";
    if($("#cloudinaryUploadPreset"))$("#cloudinaryUploadPreset").value=config.uploadPreset||"";
    const status=$("#cloudinaryStatus");if(status){status.textContent=ready?"Cloudinary is ready. New images will upload to your Cloudinary account.":"Cloudinary is not configured. Images will use Supabase Storage.";status.classList.toggle("is-ready",ready);}
  }
  $("#saveCloudinarySettings").addEventListener("click",()=>{
    const cloudName=$("#cloudinaryCloudName").value.trim(),uploadPreset=$("#cloudinaryUploadPreset").value.trim();
    if(!/^[a-z0-9-]+$/i.test(cloudName)||!uploadPreset)return showToast("Enter a valid Cloudinary cloud name and unsigned upload preset.");
    localStorage.setItem("global-scope24-cloudinary",JSON.stringify({cloudName,uploadPreset}));updateCloudinaryStatus();showToast("Cloudinary settings saved in this browser.");
  });
  updateCloudinaryStatus();
  async function uploadDataImage(dataUrl,postId){
    if(!/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(dataUrl))return dataUrl;
    const config=cloudinarySettings();
    const blob=await (await fetch(dataUrl)).blob();
    if(config.cloudName&&config.uploadPreset){
      const form=new FormData();
      form.append("file",blob);form.append("upload_preset",config.uploadPreset);form.append("asset_folder","global-scope-24/articles/"+postId);
      const response=await fetch("https://api.cloudinary.com/v1_1/"+encodeURIComponent(config.cloudName)+"/image/upload",{method:"POST",body:form});
      const result=await response.json();
      if(!response.ok||!result.secure_url)throw new Error(result.error?.message||"Cloudinary image upload failed.");
      return result.secure_url;
    }
    const extension=(blob.type.split("/")[1]||"jpg").replace("jpeg","jpg").replace("svg+xml","svg");
    const filePath="articles/"+postId+"/"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9)+"."+extension;
    const {error}=await db().storage.from(MEDIA_BUCKET).upload(filePath,blob,{contentType:blob.type,upsert:false});
    if(error)throw new Error("Image upload failed: "+error.message);
    const {data}=db().storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
    if(!data?.publicUrl)throw new Error("Could not create a public image URL from Supabase Storage.");
    return data.publicUrl;
  }
  async function preparePostMedia(post){
    let content=post.content||"";
    const dataUrls=[...new Set(content.match(/data:image\/(?:png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+/gi)||[])];
    for(const dataUrl of dataUrls) content=content.split(dataUrl).join(await uploadDataImage(dataUrl,post.id));
    const cover=post.cover?await uploadDataImage(post.cover,post.id):"";
    return {...post,content,cover};
  }
  async function savePostToCloud(post){
    const prepared=await preparePostMedia(post);
    const row={id:prepared.id,title:prepared.title,content_html:prepared.content,category:prepared.category,
      subcategory:prepared.subcategory||"",language:prepared.language||"en",post_types:prepared.postTypes||["latest"],
      featured_stories:!!prepared.featuredStories,status:prepared.status,scheduled_at:prepared.scheduledAt||null,excerpt:prepared.excerpt||"",
      meta_title:prepared.metaTitle||"",meta_description:prepared.metaDescription||"",focus_keyword:prepared.focusKeyword||"",related_keywords:prepared.keywords||[],
      keywords:prepared.keywords||[],video_url:prepared.videoUrl||"",cover_url:prepared.cover||"",
      views:Number(prepared.views)||0,created_at:prepared.createdAt,updated_at:prepared.updatedAt,published_at:prepared.publishedAt||null};
    const {error}=await db().from("posts").upsert(row,{onConflict:"id"});
    if(error) throw error;
    return prepared;
  }
  async function initializeCloud(){
    if(cloudLoading||cloudReady) return;
    cloudLoading=true;
    try{
      if(!db()) throw new Error("Supabase client is not available. Please reload the Admin Panel.");
      const {data:adminAllowed,error:adminCheckError}=await db().rpc("is_admin");
      if(adminCheckError||adminAllowed!==true) throw new Error("Please sign in with the authorised administrator account to load the CMS.");
      const [{data:postRows,error:postError},{data:headlineRows,error:headlineError}]=await Promise.all([
        db().from("posts").select("*").order("updated_at",{ascending:false}),
        db().from("headlines").select("*").order("sort_order",{ascending:true})
      ]);
      if(postError) throw postError;
      if(headlineError) throw headlineError;
      const localPosts=loadLocalPosts();
      let localHeadlines=[];
      try{
        const saved=JSON.parse(localStorage.getItem("everyday-atlas-headlines-v1")||"null");
        if(Array.isArray(saved)) localHeadlines=saved;
        else localHeadlines=(JSON.parse(localStorage.getItem("everyday-atlas-homepage-ticker-v1")||"[]")||[]).map((text,index)=>({id:"headline-"+index,text:String(text)}));
      }catch(_){}
      const remotePostIds=new Set((postRows||[]).map(row=>String(row.id)));
      const remoteHeadlineIds=new Set((headlineRows||[]).map(row=>String(row.id)));
      const postsToMigrate=localPosts.filter(item=>item&&item.id&&!remotePostIds.has(String(item.id)));
      const headlinesToMigrate=localHeadlines.filter((item,index)=>!remoteHeadlineIds.has(String(item.id||("headline-"+index))));
      if(postsToMigrate.length||headlinesToMigrate.length){
        if(window.confirm("We found posts or headlines saved in this browser that are not yet in Supabase. Would you like to transfer them so they can appear on every device? Your browser copies will remain unchanged.")){
          showToast("Transferring your existing content to Supabase…");
          for(const oldPost of postsToMigrate){
            const stamp=new Date().toISOString();
            const migrated={...oldPost,category:oldPost.category==="beauty"?"lifestyle":oldPost.category,
              postTypes:Array.isArray(oldPost.postTypes)?oldPost.postTypes:(oldPost.postType?[oldPost.postType]:["latest"]),
              createdAt:oldPost.createdAt||stamp,updatedAt:oldPost.updatedAt||stamp};
            await savePostToCloud(migrated);
          }
          for(let index=0;index<localHeadlines.length;index++){
            const item=localHeadlines[index],headlineId=String(item.id||("headline-"+index));
            if(remoteHeadlineIds.has(headlineId)) continue;
            const {error}=await db().from("headlines").upsert({id:headlineId,text:String(item.text||""),sort_order:index,is_active:true},{onConflict:"id"});
            if(error) throw error;
          }
          showToast("Your existing content has been transferred to Supabase.");
        }
      }
      const {data:finalPosts,error:finalPostError}=await db().from("posts").select("*").order("updated_at",{ascending:false});
      if(finalPostError) throw finalPostError;
      const {data:finalHeadlines,error:finalHeadlineError}=await db().from("headlines").select("*").order("sort_order",{ascending:true});
      if(finalHeadlineError) throw finalHeadlineError;
      posts=(finalPosts||[]).map(fromDatabase);
      headlines=(finalHeadlines||[]).map(row=>({id:row.id,text:row.text}));
      cloudReady=true;
      renderLists();renderHeadlines();openView("dashboard");
      const notice=document.querySelector(".notice");
      if(notice) notice.innerHTML="<strong>Connected:</strong> Posts, headlines and images are now stored in Supabase and shared across devices.";
    }catch(error){
      console.error("Supabase CMS load failed:",error);
      showToast("Could not load Supabase content: "+(error.message||"Please check the database setup."));
      renderLists();renderHeadlines();openView("dashboard");
    }finally{
      cloudLoading=false;
    }
  }
  function id(){ return "ea-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7); }
  function safe(value){ return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char])); }
  function plainText(html){ const node=document.createElement("div"); node.innerHTML=html; return (node.textContent||"").trim(); }
  function showToast(message){ const toast=$("#toast"); toast.textContent=message; toast.classList.add("show"); window.clearTimeout(showToast.timer); showToast.timer=window.setTimeout(()=>toast.classList.remove("show"),2600); }

  /* Dashboard and post tables */
  function renderStats(){
    $("#statTotal").textContent=posts.length;
    $("#statPublished").textContent=posts.filter(post=>post.status==="published").length;
    $("#statDrafts").textContent=posts.filter(post=>post.status==="draft").length; const scheduledStat=$("#statScheduled"); if(scheduledStat) scheduledStat.textContent=posts.filter(post=>post.status==="scheduled").length;
    $("#statViews").textContent=posts.reduce((sum,post)=>sum+(Number(post.views)||0),0).toLocaleString();
  }
  function latestPublishedByCategory(){
    const latest = new Map();
    posts.filter(post=>post.status==="published" && post.category).forEach(post=>{
      const stamp = new Date(post.publishedAt || post.createdAt || post.updatedAt || 0).getTime() || 0;
      const current = latest.get(post.category);
      if(!current || stamp > current.stamp) latest.set(post.category,{id:post.id,stamp});
    });
    return new Set([...latest.values()].map(item=>item.id));
  }
  function postRows(items){
    if(!items.length) return '<div class="empty-table">No posts yet. Create your first article to get started.</div>';
    const mainSliderIds = latestPublishedByCategory();
    return '<table><thead><tr><th>Article</th><th>Category</th><th>Placement</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead><tbody>'+items.map(post=>{
      const date=new Date(post.updatedAt||post.createdAt).toLocaleDateString();
      const autoMain = mainSliderIds.has(post.id) ? ' · <span class="main-slider-badge">Main Home Page</span>' : '';
      const placementText = placementsFor(post).map(value=>placementLabels[value]).join(", ") || "—";
      return '<tr><td class="table-title"><strong>'+safe(post.title||"Untitled")+'</strong><small>'+safe(date)+' · '+safe(languages[post.language]||"English")+'</small></td><td>'+safe(categories[post.category]||post.category)+(post.subcategory?' · '+safe(post.subcategory):'')+'</td><td>'+safe(placementText)+((post.featuredStories ?? post.featured)?" · Featured Stories":"")+autoMain+'</td><td><span class="status-badge '+safe(post.status)+'">'+safe(post.status)+'</span></td><td>'+Number(post.views||0).toLocaleString()+'</td><td><div class="row-actions"><button class="small-btn" data-edit="'+safe(post.id)+'">Edit</button><button class="small-btn delete" data-delete="'+safe(post.id)+'">Delete</button></div></td></tr>';
    }).join("")+'</tbody></table>';
  }
  function renderLists(){
    renderStats();
    const recent=[...posts].filter(post=>post.status==="published").sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,5);
    $("#recentPosts").innerHTML=recent.length ? postRows(recent) : '<div class="empty-table">No published posts yet. Your published articles will appear here.</div>';
    const query=($("#postSearch").value||"").trim().toLowerCase();
    const published=[...posts].filter(post=>post.status==="published"&&(!query||(post.title+" "+plainText(post.content)).toLowerCase().includes(query))).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
    $("#allPosts").innerHTML=published.length ? postRows(published) : '<div class="empty-table">No published posts yet. Published articles will appear here.</div>';
    const scheduled=[...posts].filter(post=>post.status==="scheduled").sort((a,b)=>new Date(a.scheduledAt)-new Date(b.scheduledAt));
    const scheduledBox=$("#allScheduled"); if(scheduledBox) scheduledBox.innerHTML=scheduled.length?postRows(scheduled):'<div class="empty-table">No scheduled posts yet.</div>';
    const draftQuery=($("#draftSearch")?.value||"").trim().toLowerCase();
    const drafts=[...posts].filter(post=>post.status==="draft"&&(!draftQuery||(post.title+" "+plainText(post.content)).toLowerCase().includes(draftQuery))).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
    $("#allDrafts").innerHTML=drafts.length ? postRows(drafts) : '<div class="empty-table">No drafts yet. Save an article as Draft and it will appear here.</div>';
  }

  /* View navigation */
  function openView(view){
    document.querySelectorAll(".view-panel").forEach(panel=>panel.classList.toggle("active",panel.id===view+"View"));
    document.querySelectorAll(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
    $("#pageTitle").textContent={dashboard:"Dashboard",posts:"All Posts",drafts:"My Drafts",scheduled:"Scheduled Posts",editor:editingId?"Edit Post":"Write a Post",headlines:"All Headlines",headlineEditor:editingHeadlineId?"Edit Headline":"Write a Headline"}[view]||"Dashboard";
    if(view!=="editor") renderLists();
  }
  document.querySelectorAll(".nav-item").forEach(button=>button.addEventListener("click",()=>openView(button.dataset.view)));
  document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>openView(button.dataset.open)));
  $("#newPostBtn").addEventListener("click",()=>newPost());
  $("#postSearch").addEventListener("input",renderLists);
  $("#draftSearch").addEventListener("input",renderLists);

  /* Rich text editor toolbar */
  document.querySelectorAll("[data-command]").forEach(button=>button.addEventListener("click",()=>{
    $("#articleEditor").focus();
    document.execCommand(button.dataset.command,false,button.dataset.value||null);
  }));
  $("#linkBtn").addEventListener("click",()=>{
    const url=window.prompt("Enter the full link URL (https://...)");
    if(url && /^https?:\/\//i.test(url)){ $("#articleEditor").focus(); document.execCommand("createLink",false,url); }
    else if(url) showToast("Please enter a valid http or https link.");
  });
  function readImage(file,callback){
    const allowedTypes=["image/jpeg","image/png","image/webp","image/gif","image/svg+xml"];
    const extension=(file?.name||"").split(".").pop().toLowerCase();
    const allowedExtensions=["jpg","jpeg","png","webp","gif","svg"];
    if(!file||(!allowedTypes.includes(file.type)&&!allowedExtensions.includes(extension))){
      return showToast("Supported formats: JPG, PNG, WebP, GIF and SVG icons.");
    }
    if(file.size>5*1024*1024) return showToast("Each image must be 5 MB or smaller.");
    const reader=new FileReader();
    if(file.type==="image/svg+xml"||extension==="svg"){
      reader.onload=()=>{
        const raw=String(reader.result||"");
        const sanitized=window.DOMPurify?DOMPurify.sanitize(raw,{USE_PROFILES:{svg:true,svgFilters:true}}):"";
        if(!/<svg[\s>]/i.test(sanitized)) return showToast("This SVG is invalid or could not be safely cleaned.");
        const bytes=new TextEncoder().encode(sanitized);
        let binary="";
        bytes.forEach(byte=>{binary+=String.fromCharCode(byte);});
        callback("data:image/svg+xml;base64,"+btoa(binary));
      };
      reader.readAsText(file);
    }else{
      reader.onload=()=>callback(String(reader.result));
      reader.readAsDataURL(file);
    }
    reader.onerror=()=>showToast("Could not read this image.");
  }
  $("#imageBtn").addEventListener("click",()=>$("#imageUpload").click());
  let selectedInlineFigure=null;
  let editorMode="visual";
  function visualArticleHTML(){
    const clone=$("#articleEditor").cloneNode(true);
    clone.querySelectorAll(".cms-resize-handle").forEach(node=>node.remove());
    clone.querySelectorAll("figure.cms-image-frame").forEach(node=>{node.classList.remove("cms-image-frame","cms-image-active");node.removeAttribute("draggable");});
    const raw=clone.innerHTML.trim();
    return window.DOMPurify?DOMPurify.sanitize(raw,{USE_PROFILES:{html:true},ADD_ATTR:["target","style","width","height","loading"]}):raw;
  }
  function cleanArticleHTML(){
    const raw=editorMode==="html"?$("#articleHtmlEditor").value:visualArticleHTML();
    return window.DOMPurify?DOMPurify.sanitize(raw,{USE_PROFILES:{html:true},ADD_ATTR:["target","style","width","height","loading"]}):raw;
  }
  function formatHTMLSource(source){
    const tokens=String(source||"").match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+/g)||[];
    const voidTags=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
    const preserveTags=new Set(["pre","textarea","script","style"]);
    const lines=[];let depth=0,preserveDepth=0;
    for(const token of tokens){
      if(!token.trim()&&!preserveDepth)continue;
      const closing=/^<\//.test(token);
      const opening=/^<[a-zA-Z]/.test(token);
      const tag=(token.match(/^<\/?\s*([a-zA-Z0-9-]+)/)||[])[1]?.toLowerCase()||"";
      const selfClosing=/\/>$/.test(token)||voidTags.has(tag);
      if(closing){if(preserveTags.has(tag))preserveDepth=Math.max(0,preserveDepth-1);depth=Math.max(0,depth-1);lines.push("  ".repeat(depth)+token.trim());continue;}
      if(opening){
        lines.push("  ".repeat(depth)+token.trim());
        if(!selfClosing){depth++;if(preserveTags.has(tag))preserveDepth++;}
        continue;
      }
      const text=preserveDepth?token.replace(/^\n+|\n+$/g,""):token.trim();
      if(text)lines.push("  ".repeat(depth)+text);
    }
    return lines.join("\n");
  }
  function setEditorMode(mode){
    const htmlMode=mode==="html";
    if(htmlMode&&editorMode!=="html")$("#articleHtmlEditor").value=formatHTMLSource(visualArticleHTML());
    if(!htmlMode&&editorMode==="html")$("#articleEditor").innerHTML=$("#articleHtmlEditor").value||"<p></p>";
    editorMode=htmlMode?"html":"visual";
    $("#articleEditor").hidden=htmlMode;$("#articleHtmlEditor").hidden=!htmlMode;$("#visualToolbar").hidden=htmlMode;
    $("#visualModeBtn").classList.toggle("active",!htmlMode);$("#htmlModeBtn").classList.toggle("active",htmlMode);
    $("#visualModeBtn").setAttribute("aria-pressed",String(!htmlMode));$("#htmlModeBtn").setAttribute("aria-pressed",String(htmlMode));
  }
  $("#visualModeBtn").addEventListener("click",()=>setEditorMode("visual"));
  $("#htmlModeBtn").addEventListener("click",()=>setEditorMode("html"));
  $("#formatHtmlBtn").addEventListener("click",()=>{$("#articleHtmlEditor").value=formatHTMLSource($("#articleHtmlEditor").value);showToast("HTML code formatted.");});
  $("#imageUrlBtn").addEventListener("click",()=>{
    const url=window.prompt("Paste a public image URL (https://...)");
    if(!url)return;
    if(!/^https:\/\//i.test(url))return showToast("Please use a public HTTPS image URL.");
    const snippet='<figure style="width:100%;margin:18px auto"><img src="'+safe(url)+'" alt="" style="display:block;width:100%;height:auto"></figure><p></p>';
    if(editorMode==="html")$("#articleHtmlEditor").value+="\\n"+snippet;
    else{$("#articleEditor").focus();document.execCommand("insertHTML",false,snippet);}
  });
  function addResizeHandles(figure){
    figure.querySelectorAll(".cms-resize-handle").forEach(node=>node.remove());
    ["nw","ne","sw","se","e","w"].forEach(direction=>{
      const handle=document.createElement("span");handle.className="cms-resize-handle handle-"+direction;handle.dataset.direction=direction;handle.contentEditable="false";figure.appendChild(handle);
    });
  }
  function selectInlineImage(image){
    if(selectedInlineFigure)selectedInlineFigure.classList.remove("cms-image-active");
    selectedInlineFigure=image.closest("figure");
    if(!selectedInlineFigure){
      selectedInlineFigure=document.createElement("figure");
      image.parentNode.insertBefore(selectedInlineFigure,image);
      selectedInlineFigure.appendChild(image);
    }
    selectedInlineFigure.classList.add("cms-image-frame","cms-image-active");
    selectedInlineFigure.draggable=true;addResizeHandles(selectedInlineFigure);
    const width=Number(selectedInlineFigure.dataset.width||100);
    $("#inlineImageWidth").value=width;$("#inlineImageWidthValue").textContent=width+"%";
    $("#inlineImageCaption").value=selectedInlineFigure.querySelector("figcaption")?.textContent||"";
    $("#inlineImageCaptionPosition").value=selectedInlineFigure.dataset.captionPosition||"center";
    $("#inlineImagePanel").classList.add("is-visible");
  }
  $("#articleEditor").addEventListener("click",event=>{
    const image=event.target.closest("img");if(image&&$("#articleEditor").contains(image))selectInlineImage(image);
  });
  $("#articleEditor").addEventListener("pointerdown",event=>{
    const handle=event.target.closest(".cms-resize-handle");if(!handle)return;
    event.preventDefault();event.stopPropagation();
    const figure=handle.closest("figure"),startX=event.clientX,startWidth=figure.getBoundingClientRect().width,parentWidth=figure.parentElement.getBoundingClientRect().width;
    const direction=handle.dataset.direction;
    function move(e){let delta=e.clientX-startX;if(direction.includes("w"))delta=-delta;const width=Math.max(80,Math.min(parentWidth,startWidth+delta));figure.style.width=width+"px";figure.dataset.width=Math.round(width/parentWidth*100);$("#inlineImageWidth").value=figure.dataset.width;$("#inlineImageWidthValue").textContent=figure.dataset.width+"%";}
    function stop(){document.removeEventListener("pointermove",move);document.removeEventListener("pointerup",stop);}
    document.addEventListener("pointermove",move);document.addEventListener("pointerup",stop,{once:true});
  });
  function applyInlineImageControls(){
    if(!selectedInlineFigure)return;
    const width=Number($("#inlineImageWidth").value);selectedInlineFigure.dataset.width=width;selectedInlineFigure.style.width=width+"%";$("#inlineImageWidthValue").textContent=width+"%";
    const text=$("#inlineImageCaption").value.trim();let caption=selectedInlineFigure.querySelector("figcaption");
    if(text){if(!caption){caption=document.createElement("figcaption");selectedInlineFigure.appendChild(caption);}caption.textContent=text;const pos=$("#inlineImageCaptionPosition").value;selectedInlineFigure.dataset.captionPosition=pos;caption.style.cssText="position:absolute;left:0;right:0;"+(pos==="top"?"top:0":pos==="bottom"?"bottom:0":"top:50%;transform:translateY(-50%)")+";padding:12px;background:rgba(0,0,0,.58);color:#fff;text-align:center;font-weight:800;";}
    else if(caption)caption.remove();
  }
  $("#inlineImageWidth").addEventListener("input",applyInlineImageControls);
  $("#inlineImageCaption").addEventListener("input",applyInlineImageControls);
  $("#inlineImageCaptionPosition").addEventListener("change",applyInlineImageControls);
  $("#deleteInlineImageBtn").addEventListener("click",()=>{
    if(!selectedInlineFigure){showToast("First click an image inside the article.");return;}
    selectedInlineFigure.remove();
    selectedInlineFigure=null;
    $("#inlineImagePanel").classList.remove("is-visible");
    showToast("Article image deleted.");
  });
  $("#inlineImagePanel").addEventListener("click",event=>{
    const button=event.target.closest("[data-image-align]");
    if(!button)return;
    if(!selectedInlineFigure){showToast("First click an image inside the article.");return;}
    const align=button.dataset.imageAlign;
    let width=Number(selectedInlineFigure.dataset.width||100);
    // A full-width image cannot visibly move left or right, so make it narrower on first alignment.
    if(width>=100){width=70;selectedInlineFigure.dataset.width="70";selectedInlineFigure.style.width="70%";$("#inlineImageWidth").value=70;$("#inlineImageWidthValue").textContent="70%";}
    selectedInlineFigure.dataset.align=align;
    selectedInlineFigure.style.display="block";
    selectedInlineFigure.style.maxWidth="100%";
    selectedInlineFigure.style.margin=align==="left"?"18px auto 18px 0":align==="right"?"18px 0 18px auto":"18px auto";
    selectedInlineFigure.style.float="none";
    showToast("Image aligned "+align+".");
  });
  let draggedImage=null;
  $("#articleEditor").addEventListener("dragstart",event=>{const figure=event.target.closest("figure.cms-image-frame");if(figure)draggedImage=figure;});
  $("#articleEditor").addEventListener("dragover",event=>{if(draggedImage)event.preventDefault();});
  $("#articleEditor").addEventListener("drop",event=>{
    if(!draggedImage)return;event.preventDefault();const target=event.target.closest("figure");
    if(target&&target!==draggedImage){const rect=target.getBoundingClientRect();target.parentNode.insertBefore(draggedImage,event.clientY<rect.top+rect.height/2?target:target.nextSibling);}
    else {
      const block=event.target.closest("p,h2,h3,ul,ol,blockquote");
      if(block&&$("#articleEditor").contains(block)){const rect=block.getBoundingClientRect();block.parentNode.insertBefore(draggedImage,event.clientY<rect.top+rect.height/2?block:block.nextSibling);}
      else if(event.target===$("#articleEditor"))$("#articleEditor").appendChild(draggedImage);
    }
    draggedImage=null;
  });
  $("#imageUpload").addEventListener("change",event=>{
    Array.from(event.target.files||[]).forEach(file=>readImage(file,data=>{
      $("#articleEditor").focus();document.execCommand("insertHTML",false,'<figure class="cms-image-frame" data-width="100" style="width:100%;position:relative;margin:18px auto"><img src="'+data+'" alt="'+safe(file.name)+'" style="display:block;width:100%;height:auto"></figure><p></p>');
      const img=Array.from($("#articleEditor").querySelectorAll("img")).pop();if(img)selectInlineImage(img);
    }));
    event.target.value="";
  });
  function renderCoverPreview(){
    const host=$("#coverImagePreview");
    if(!host) return;
    host.innerHTML=coverData
      ? '<img src="'+coverData+'" alt="Selected cover image"><button type="button" class="cover-remove-btn" id="removeCoverImage">Remove</button>'
      : '<span class="cover-empty">No cover image selected</span>';
  }
  $("#coverUpload").addEventListener("change",event=>{
    const file=event.target.files[0]; if(!file) return;
    readImage(file,data=>{coverData=data;renderCoverPreview();showToast("Cover image selected.");});
  });
  $("#coverImageUrlBtn").addEventListener("click",()=>{
    const url=window.prompt("Paste a public cover image URL (https://...)");
    if(!url)return;
    if(!/^https:\/\//i.test(url))return showToast("Please use a public HTTPS image URL.");
    coverData=url.trim();$("#coverUpload").value="";renderCoverPreview();showToast("Cover image URL added.");
  });
  $("#coverImagePreview").addEventListener("click",event=>{
    if(event.target.closest("#removeCoverImage")){coverData="";$("#coverUpload").value="";renderCoverPreview();}
  });
  renderCoverPreview();
  $("#videoBtn").addEventListener("click",()=>{
    const url=window.prompt("Paste a YouTube or Vimeo video URL");
    if(!url) return;
    if(!/^https?:\/\//i.test(url)) return showToast("Please enter a valid video URL.");
    $("#articleEditor").focus();
    document.execCommand("insertHTML",false,'<p><a href="'+safe(url)+'" target="_blank" rel="noopener">Watch the video ↗</a></p>');
  });
  function renderKeywordChips(){
    const host=$("#keywordChips");
    if(!host) return;
    host.innerHTML=currentKeywords.map((word,index)=>'<span class="keyword-chip">'+safe(word)+'<button type="button" data-remove-keyword="'+index+'" aria-label="Remove '+safe(word)+'">×</button></span>').join("");
  }
  function addKeywords(raw){
    String(raw||"").split(",").map(value=>value.trim().replace(/^#+/,"")).filter(Boolean).forEach(value=>{
      if(!currentKeywords.some(item=>item.toLowerCase()===value.toLowerCase()) && currentKeywords.length<12) currentKeywords.push(value.slice(0,50));
    });
    renderKeywordChips();
  }
  $("#postKeywordInput").addEventListener("keydown",event=>{
    if(event.key==="Enter" || event.key===","){
      event.preventDefault();
      addKeywords($("#postKeywordInput").value);
      $("#postKeywordInput").value="";
    } else if(event.key==="Backspace" && !$("#postKeywordInput").value && currentKeywords.length){
      currentKeywords.pop(); renderKeywordChips();
    }
  });
  $("#postKeywordInput").addEventListener("blur",()=>{
    if($("#postKeywordInput").value.trim()){addKeywords($("#postKeywordInput").value);$("#postKeywordInput").value="";}
  });
  $("#keywordChips").addEventListener("click",event=>{
    const remove=event.target.closest("[data-remove-keyword]");
    if(remove){currentKeywords.splice(Number(remove.dataset.removeKeyword),1);renderKeywordChips();}
  });

  function updateMetaDescriptionCount(){const field=$("#metaDescription"),count=$("#metaDescriptionCount");if(field&&count)count.textContent=field.value.length+" / 160 recommended characters";}
  $("#metaDescription").addEventListener("input",updateMetaDescriptionCount);

  /* Form state and CRUD */
  function syncCategorySubcategory(){
    const category=$("#postCategory").value;
    const options=category==="sports"?[["cricket","Cricket"],["football","Football"],["tennis","Tennis"],["basketball","Basketball"],["other-sports","Other"]]:category==="entertainment"?[["cinema","Cinema"],["bollywood","Bollywood"],["south-cinema","South Indian Cinema"],["music","Music"],["hollywood","Hollywood"],["television","Television"],["serial","TV Serials"],["folk-art","Folk Culture"]]:category==="world"?[["bangladesh","Bangladesh"],["india","India"],["pakistan","Pakistan"],["asia","Asia"],["europe","Europe"],["middle-east","Middle East"]]:category==="lifestyle"?[["beauty-care","Beauty Care"]]:[];
    const select=$("#postSubcategory"),previous=select.value;$("#categorySubcategoryField").hidden=!options.length;select.required=!!options.length;
    select.innerHTML='<option value="">Select a subcategory</option>'+options.map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join("");
    select.value=options.some(([value])=>value===previous)?previous:"";
  }
  function syncScheduleFields(){ const field=$("#scheduledPublishFields"); if(field) field.hidden=$("#postStatus").value!=="scheduled"; }
  function toLocalDateTime(value){ if(!value) return ""; const date=new Date(value); if(Number.isNaN(date.getTime())) return {date:"",time:""}; const local=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16); return {date:local.slice(0,10),time:local.slice(11,16)}; }
  function setScheduleInputs(value){ const parts=toLocalDateTime(value); $("#scheduledPublishDate").value=parts.date; $("#scheduledPublishTime").value=parts.time; }
  function getScheduleInputValue(){ const date=$("#scheduledPublishDate").value; const time=$("#scheduledPublishTime").value; return date&&time?date+"T"+time:""; }
  $("#postStatus").addEventListener("change",syncScheduleFields);
  $("#postCategory").addEventListener("change",syncCategorySubcategory);
  function resetForm(){
    $("#postForm").reset(); syncCategorySubcategory(); syncScheduleFields(); $("#articleEditor").innerHTML="<p></p>"; $("#articleHtmlEditor").value=""; setEditorMode("visual"); $("#cardSummary").value=""; $("#metaTitle").value=""; $("#metaDescription").value=""; $("#focusKeyword").value=""; updateMetaDescriptionCount(); selectedInlineFigure=null; $("#inlineImagePanel").classList.remove("is-visible");
    currentKeywords=[]; renderKeywordChips();
    coverData=""; $("#coverUpload").value=""; renderCoverPreview(); $("#deleteCurrentBtn").hidden=true;
    $("#editorStatusText").textContent="Draft"; $("#editorStatusDot").parentElement.classList.remove("live");
  }
  function newPost(){
    editingId=null; resetForm(); openView("editor"); $("#pageTitle").textContent="Write a Post"; $("#postTitle").focus();
  }
  function editPost(postId){
    const post=posts.find(item=>item.id===postId); if(!post) return;
    editingId=postId; resetForm();
    $("#postTitle").value=post.title||""; $("#articleEditor").innerHTML=post.content||"<p></p>"; $("#articleHtmlEditor").value=post.content||""; setEditorMode("visual"); $("#cardSummary").value=post.excerpt||""; $("#metaTitle").value=post.metaTitle||""; $("#metaDescription").value=post.metaDescription||""; $("#focusKeyword").value=post.focusKeyword||""; updateMetaDescriptionCount(); selectedInlineFigure=null; $("#inlineImagePanel").classList.remove("is-visible");
    $("#postCategory").value=post.category||"health"; syncCategorySubcategory(); $("#postSubcategory").value=post.subcategory||""; $("#postLanguage").value=post.language||"en";
    const selectedPlacements=placementsFor(post); document.querySelectorAll('input[name="postPlacement"]').forEach(input=>{input.checked=selectedPlacements.includes(input.value);}); $("#postStatus").value=post.status||"draft"; setScheduleInputs(post.scheduledAt); syncScheduleFields(); $("#postFeaturedStories").checked=!!(post.featuredStories ?? post.featured);
    currentKeywords=Array.isArray(post.keywords)?post.keywords.filter(value=>typeof value==="string").slice(0,12):[]; renderKeywordChips();
    $("#videoUrl").value=post.videoUrl||""; coverData=post.cover||""; renderCoverPreview();
    
    $("#deleteCurrentBtn").hidden=false;
    $("#editorStatusText").textContent=post.status==="published"?"Published":post.status==="scheduled"?"Scheduled":"Draft";
    if(post.status==="published") $("#editorStatusDot").parentElement.classList.add("live");
    openView("editor"); $("#pageTitle").textContent="Edit Post";
  }
  function deletePost(postId){
    const post=posts.find(item=>item.id===postId); if(!post) return;
    if(!window.confirm('Delete "'+(post.title||"Untitled")+'"? This cannot be undone.')) return;
    posts=posts.filter(item=>item.id!==postId);
    (async()=>{try{const {error}=await db().from("posts").delete().eq("id",postId);if(error)throw error;
      if(editingId===postId){editingId=null;resetForm();openView("posts");}
      renderLists();showToast("Post deleted from Supabase.");}
      catch(error){showToast("Could not delete post: "+(error.message||"Database error."));await initializeCloud();}})();
  }
  document.addEventListener("click",event=>{
    const edit=event.target.closest("[data-edit]"); const del=event.target.closest("[data-delete]");
    if(edit) editPost(edit.dataset.edit);
    if(del) deletePost(del.dataset.delete);
  });
  $("#deleteCurrentBtn").addEventListener("click",()=>editingId&&deletePost(editingId));

  $("#postForm").addEventListener("submit",async event=>{
    event.preventDefault();
    const title=$("#postTitle").value.trim(); const content=cleanArticleHTML();
    if(!title) return showToast("Please add an article title.");
    if(!plainText(content)) return showToast("Please write the article content.");
    const existing=posts.find(item=>item.id===editingId);
    const selectedPostTypes=Array.from(document.querySelectorAll('input[name="postPlacement"]:checked')).map(input=>input.value);
    if(!selectedPostTypes.length) return showToast("Select at least one post placement: Latest, Popular or Favorites.");
    const selectingMyChoice=selectedPostTypes.includes("myChoice");
    const alreadyMyChoice=posts.filter(item=>item.id!==editingId && (Array.isArray(item.postTypes)?item.postTypes.includes("myChoice"):item.postType==="myChoice")).length;
    if(selectingMyChoice && alreadyMyChoice>=4) return showToast("Favorites can contain up to 4 selected items.");
    const selectingFeaturedStories=$("#postFeaturedStories").checked;
    const alreadyFeaturedStories=posts.filter(item=>item.id!==editingId && (item.featuredStories ?? item.featured)).length;
    if(selectingFeaturedStories && alreadyFeaturedStories>=20) return showToast("Featured Stories can contain up to 20 selected posts.");
    const now=new Date().toISOString();
    const selectedStatus=$("#postStatus").value;
    const scheduledValue=getScheduleInputValue();
    if(selectedStatus==="scheduled" && (!scheduledValue || new Date(scheduledValue).getTime()<=Date.now())) return showToast("Choose a future date and time for scheduled publishing.");
    const scheduledAt=selectedStatus==="scheduled"?new Date(scheduledValue).toISOString():null;
    const post={
      id:editingId||id(),title,content,excerpt:$("#cardSummary").value.trim(),metaTitle:$("#metaTitle").value.trim(),metaDescription:$("#metaDescription").value.trim(),focusKeyword:$("#focusKeyword").value.trim(),category:$("#postCategory").value,subcategory:["sports","entertainment","world","lifestyle"].includes($("#postCategory").value)?$("#postSubcategory").value:"",language:$("#postLanguage").value,
      postTypes:selectedPostTypes,postType:selectedPostTypes[0],featuredStories:selectingFeaturedStories,featured:selectingFeaturedStories,status:selectedStatus,scheduledAt,keywords:[...currentKeywords],
      videoUrl:$("#videoUrl").value.trim(),cover:coverData,views:existing?Number(existing.views)||0:0,
      createdAt:existing?existing.createdAt:now,updatedAt:now,publishedAt:selectedStatus==="published"?(existing&&existing.publishedAt||now):null
    };
    const saveButton=$("#savePostBtn");
    saveButton.disabled=true;saveButton.textContent="Saving to Supabase…";
    try{
      if(!cloudReady) throw new Error("Supabase is not connected yet. Please reload the Admin Panel.");
      const savedPost=await savePostToCloud(post);
      const previous=posts.findIndex(item=>item.id===savedPost.id);
      if(previous>=0) posts[previous]=savedPost; else posts.unshift(savedPost);
    }catch(error){
      showToast("Could not save post: "+(error.message||"Database or image upload error."));
      return;
    }finally{saveButton.disabled=false;saveButton.textContent="Save post";}
    editingId=post.id; $("#deleteCurrentBtn").hidden=false;
    $("#editorStatusText").textContent=post.status==="published"?"Published":"Draft";
    $("#editorStatusDot").parentElement.classList.toggle("live",post.status==="published");
    renderLists();
    if(post.status==="draft"){ openView("drafts"); showToast("Draft saved securely to Supabase."); }
    else if(post.status==="scheduled"){ openView("scheduled"); showToast("Scheduled post saved. It will publish automatically when the scheduler runs."); }
    else { openView("posts"); showToast("Article published successfully. It is now available across devices."); }
    $("#pageTitle").textContent=post.status==="published"?"All Posts":post.status==="scheduled"?"Scheduled Posts":"My Drafts";
  });

  /* Article preview */
  function previewHTML(){
    const title=safe($("#postTitle").value||"Untitled article");
    const category=safe(categories[$("#postCategory").value]);
    const subcategory=["sports","entertainment","world","lifestyle"].includes($("#postCategory").value)?safe($("#postSubcategory").selectedOptions[0]?.textContent||""):"";
    const body=cleanArticleHTML();
    const cover=coverData?'<img src="'+coverData+'" alt="Article cover">':"";
    const keywords=currentKeywords.length?'<div class="article-keywords">'+currentKeywords.map(word=>'<span>#'+safe(word.replace(/\s+/g,""))+'</span>').join("")+'</div>':"";
    const video=$("#videoUrl").value.trim();
    const videoLink=video?'<p><a href="'+safe(video)+'" target="_blank" rel="noopener">Watch featured video ↗</a></p>':"";
    return cover+'<div class="meta">'+category+(subcategory?' · '+subcategory:'')+' · '+safe(languages[$("#postLanguage").value])+'</div><h1>'+title+'</h1>'+body+videoLink+keywords;
  }
  $("#previewBtn").addEventListener("click",()=>{$("#previewContent").innerHTML=previewHTML();$("#previewDialog").showModal();});
  $("#closePreview").addEventListener("click",()=>$("#previewDialog").close());
  $("#previewDialog").addEventListener("click",event=>{if(event.target===$("#previewDialog")) $("#previewDialog").close();});

  /* Headline management: local CMS list drives the public scrolling ticker. */
  const TICKER_STORAGE_KEY = "everyday-atlas-homepage-ticker-v1";
  const HEADLINE_STORAGE_KEY = "everyday-atlas-headlines-v1";
  let editingHeadlineId = null;
  function loadHeadlines() { return []; }
  let headlines = loadHeadlines();
  async function saveHeadlineToCloud(item,index){
    const {error}=await db().from("headlines").upsert({id:item.id,text:item.text,sort_order:index,is_active:true},{onConflict:"id"});
    if(error) throw error;
  }
  function renderHeadlines() {
    const host=$("#allHeadlines");
    if(!host) return;
    host.innerHTML=headlines.length ? '<div class="headline-table">'+headlines.map((item,index)=>'<div class="headline-row"><span class="headline-order">'+(index+1)+'</span><strong>'+safe(item.text)+'</strong><span class="headline-actions"><button type="button" class="small-btn" data-edit-headline="'+safe(item.id)+'">Edit</button><button type="button" class="small-btn delete" data-delete-headline="'+safe(item.id)+'">Delete</button></span></div>').join("")+'</div>' : '<div class="empty-table">No headlines yet. Write your first headline.</div>';
  }
  function newHeadline() {
    editingHeadlineId=null; $("#headlineForm").reset(); $("#headlineFormTitle").textContent="Write a Headline";
    openView("headlineEditor"); $("#headlineText").focus();
  }
  function editHeadline(id) {
    const item=headlines.find(entry=>entry.id===id); if(!item) return;
    editingHeadlineId=id; $("#headlineText").value=item.text; $("#headlineFormTitle").textContent="Edit Headline";
    openView("headlineEditor"); $("#headlineText").focus();
  }
  $("#newHeadlineBtn").addEventListener("click",newHeadline);
  $("#cancelHeadlineBtn").addEventListener("click",()=>openView("headlines"));
  $("#headlineForm").addEventListener("submit",async event=>{
    event.preventDefault();
    const value=$("#headlineText").value.trim();
    if(!value) return showToast("Please write a headline.");
    if(editingHeadlineId) {
      const item=headlines.find(entry=>entry.id===editingHeadlineId);
      if(item) item.text=value;
    } else headlines.push({id:"headline-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),text:value});
    try{
      const item=headlines.find(entry=>entry.id===editingHeadlineId)||headlines[headlines.length-1];
      await saveHeadlineToCloud(item,Math.max(0,headlines.indexOf(item)));
      renderHeadlines();showToast("Headline saved to Supabase.");openView("headlines");
    }catch(error){showToast("Could not save headline: "+(error.message||"Database error."));}
  });
  $("#allHeadlines").addEventListener("click",event=>{
    const edit=event.target.closest("[data-edit-headline]");
    const del=event.target.closest("[data-delete-headline]");
    if(edit) editHeadline(edit.dataset.editHeadline);
    if(del) {
      const id=del.dataset.deleteHeadline;
      headlines=headlines.filter(item=>item.id!==id);
      (async()=>{try{const {error}=await db().from("headlines").delete().eq("id",id);if(error)throw error;renderHeadlines();showToast("Headline deleted from Supabase.");}
        catch(error){showToast("Could not delete headline: "+(error.message||"Database error."));await initializeCloud();}})();
    }
  });

  /* Load shared data after administrator authentication. */
  window.addEventListener("ea-admin-authenticated",initializeCloud);
  initializeCloud();
})();
