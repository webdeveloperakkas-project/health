
/* =========================================================
   GLOBAL SCOPE 24 CMS
   Supabase-backed content workflow and permanent media storage.
========================================================= */
(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const STORAGE_KEY = "everyday-atlas-cms-posts-v1";
  const MEDIA_BUCKET = "everyday-atlas-media";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_I_vdOiwMc4XowqUG8HLP8w_h-GnwbvY";
  const db = () => window.EA_SUPABASE;
  const categories = {world:"World News",tips:"Daily Tips",technology:"Science & Technology",sports:"Sports",entertainment:"Entertainment",lifestyle:"Lifestyle",travel:"Travel",finance:"Finance",biography:"Biography",hospitals:"Hospitals (legacy)"};
  const categoryPathSlugs = {technology:"technology"};
  const placementLabels = {latest:"Latest",popular:"Popular",trending:"Trending",myChoice:"Favorites"};
  function placementsFor(post){ const values=Array.isArray(post.postTypes)?post.postTypes:(post.postType?[post.postType]:["latest"]); return [...new Set(values.filter(value=>placementLabels[value]))]; }
  const languages = {bn:"বাংলা",en:"English",hi:"हिन्दी"};
  const editorialLanguages = ["bn","en","hi"];
  const blankTranslation = () => ({title:"",content_html:""});
  function emptyTranslations(){return {bn:blankTranslation(),en:blankTranslation(),hi:blankTranslation()};}
  function normalizeTranslations(row){
    const saved=row?.translations&&typeof row.translations==="object"&&!Array.isArray(row.translations)?row.translations:{};
    const result=emptyTranslations();
    editorialLanguages.forEach(language=>{
      const item=saved[language]&&typeof saved[language]==="object"?saved[language]:{};
      result[language]={title:String(item.title||""),content_html:String(item.content_html||""),excerpt:String(item.excerpt||""),person_name:String(item.person_name||"")};
    });
    const legacyLanguage=editorialLanguages.includes(row?.language)?row.language:"en";
    if(!result[legacyLanguage].title)result[legacyLanguage].title=String(row?.title||"");
    if(!result[legacyLanguage].content_html)result[legacyLanguage].content_html=String(row?.content_html||"");
    if(!result[legacyLanguage].excerpt)result[legacyLanguage].excerpt=String(row?.excerpt||"");
    return result;
  }
  function makePostSlug(value){return String(value||"").normalize("NFC").toLowerCase().trim().replace(/[^\p{L}\p{M}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"")||"article";}
  function updatePostUrlPreview(){const selected=[...document.querySelectorAll('input[name="postLanguage"]:checked')].map(input=>input.value);const titleByLanguage={bn:$("#postTitle")?.value||"",en:$("#postTitleEn")?.value||"",hi:$("#postTitleHi")?.value||""};const title=(selected.map(language=>titleByLanguage[language]).find(value=>value.trim())||titleByLanguage.bn||titleByLanguage.en||titleByLanguage.hi),category=$("#postCategory")?.value||"",subcategory=$("#postSubcategory")?.value||"";const slug=makePostSlug(title);if($("#postSlugPreview"))$("#postSlugPreview").value=title.trim()?slug:"";const categoryPath=categoryPathSlugs[category]||makePostSlug(categories[category]||category);const parts=[categoryPath,subcategory?makePostSlug(subcategory):"",slug].filter(Boolean);if($("#postUrlPreview"))$("#postUrlPreview").textContent=title.trim()?"/health/"+parts.join("/")+"/":"URL preview will appear after you enter a title.";}

  let posts = [];
  let editingId = null;
  let coverData = "";
  let coverProvider = "";
  let currentKeywords = [];
  let translationDrafts = emptyTranslations();
  let activeEditorLanguage = "bn";
  let cloudReady = false;
  let cloudLoading = false;

  function loadLocalPosts(){
    try { const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(saved)?saved:[]; }
    catch(error){ return []; }
  }
  function fromDatabase(row){
    return {id:row.id,title:row.title,content:row.content_html||"",translations:normalizeTranslations(row),postLanguages:Array.isArray(row.post_languages)&&row.post_languages.length?row.post_languages:[row.language||"en"],category:["beauty","health","tips"].includes(row.category)?"lifestyle":row.category,
      subcategory:row.subcategory||(row.category==="tips"?"daily-tips":row.category==="health"?"health":row.category==="beauty"?"beauty-care":""),
      biographyPersonType:row.biography_person_type||"",biographyPersonName:row.biography_person_name||"",biographyCountry:row.biography_country||"",language:row.language||"en",postTypes:Array.isArray(row.post_types)?row.post_types:["latest"],
      postType:(row.post_types||["latest"])[0],featuredStories:!!row.featured_stories,featured:!!row.featured_stories,
      status:row.status||"draft",scheduledAt:row.scheduled_at||"",excerpt:row.excerpt||"",metaTitle:row.meta_title||"",metaDescription:row.meta_description||"",focusKeyword:row.focus_keyword||"",keywords:row.related_keywords||row.keywords||[],videoUrl:row.video_url||"",
      cover:row.cover_url||"",views:Number(row.views)||0,createdAt:row.created_at,updatedAt:row.updated_at,publishedAt:row.published_at,sitemapSubmitted:!!row.sitemap_submitted,sitemapSubmittedAt:row.sitemap_submitted_at||null};
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
    const status=$("#cloudinaryStatus");if(status){status.textContent=ready?"Cloudinary is configured and available. Choose Cloudinary or Supabase below the Cover Image uploader.":"Cloudinary is not configured. Select Supabase for cover-image uploads.";status.classList.toggle("is-ready",ready);}
  }
  $("#saveCloudinarySettings").addEventListener("click",()=>{
    const cloudName=$("#cloudinaryCloudName").value.trim(),uploadPreset=$("#cloudinaryUploadPreset").value.trim();
    if(!/^[a-z0-9-]+$/i.test(cloudName)||!uploadPreset)return showToast("Enter a valid Cloudinary cloud name and unsigned upload preset.");
    localStorage.setItem("global-scope24-cloudinary",JSON.stringify({cloudName,uploadPreset}));updateCloudinaryStatus();showToast("Cloudinary settings saved in this browser.");
  });
  updateCloudinaryStatus();
  async function uploadDataImage(dataUrl,postId,provider="") {
    if(!/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(dataUrl))return dataUrl;
    const config=cloudinarySettings();
    const blob=await (await fetch(dataUrl)).blob();
    const selectedProvider=provider||(config.cloudName&&config.uploadPreset?"cloudinary":"supabase");
    if(selectedProvider==="cloudinary"){
      if(!config.cloudName||!config.uploadPreset) throw new Error("Cloudinary is selected, but its Cloud Name or Unsigned Upload Preset is missing. Check Cloudinary Settings.");
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
    const uploaded=new Map();
    async function replaceEmbeddedImages(html){
      let content=String(html||"");
      const dataUrls=[...new Set(content.match(/data:image\/(?:png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+/gi)||[])];
      for(const dataUrl of dataUrls){
        if(!uploaded.has(dataUrl))uploaded.set(dataUrl,await uploadDataImage(dataUrl,post.id));
        content=content.split(dataUrl).join(uploaded.get(dataUrl));
      }
      return content;
    }
    const translations={...(post.translations||{})};
    for(const language of editorialLanguages){
      if(translations[language])translations[language]={...translations[language],content_html:await replaceEmbeddedImages(translations[language].content_html)};
    }
    const content=await replaceEmbeddedImages(post.content||"");
    const cover=post.cover?await uploadDataImage(post.cover,post.id,post.coverProvider||""):"";
    return {...post,content,translations,cover};
  }
  async function savePostToCloud(post){
    const prepared=await preparePostMedia(post);
    const row={id:prepared.id,title:prepared.title,content_html:prepared.content,category:prepared.category,
      subcategory:prepared.subcategory||"",biography_person_type:prepared.biographyPersonType||null,biography_person_name:prepared.biographyPersonName||null,biography_country:prepared.biographyCountry||null,language:prepared.language||"bn",translations:prepared.translations||{},post_languages:prepared.postLanguages||[prepared.language||"bn"],post_types:prepared.postTypes||["latest"],
      featured_stories:!!prepared.featuredStories,status:prepared.status,scheduled_at:prepared.scheduledAt||null,excerpt:prepared.excerpt||"",
      meta_title:prepared.metaTitle||"",meta_description:prepared.metaDescription||"",focus_keyword:prepared.focusKeyword||"",related_keywords:prepared.keywords||[],
      keywords:prepared.keywords||[],video_url:prepared.videoUrl||"",cover_url:prepared.cover||"",
      views:Number(prepared.views)||0,created_at:prepared.createdAt,updated_at:prepared.updatedAt,published_at:prepared.publishedAt||null,
      sitemap_submitted:!!prepared.sitemapSubmitted,sitemap_submitted_at:prepared.sitemapSubmittedAt||null};
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

    // Compact category totals: count every saved post, regardless of status.
    const categoryGrid=$("#categoryStatsGrid");
    if(categoryGrid){
      const dashboardCategories=["world","technology","biography","sports","entertainment","lifestyle","travel","finance"];
      categoryGrid.innerHTML=dashboardCategories.map(key=>{
        const count=posts.filter(post=>post.category===key).length;
        return '<article class="category-stat-card"><span>'+categories[key]+'</span><strong>'+count.toLocaleString()+'</strong></article>';
      }).join("");
    }
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
  function postRows(items, options={}){
    if(!items.length) return '<div class="empty-table">No posts yet. Create your first article to get started.</div>';
    const mainSliderIds = latestPublishedByCategory();
    return '<table><thead><tr>'+(options.selectable?'<th><input type="checkbox" id="draftSelectAll" aria-label="Select all drafts"></th>':'')+'<th>Article</th><th>Category</th><th>Placement</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead><tbody>'+items.map(post=>{
      const date=new Date(post.updatedAt||post.createdAt).toLocaleDateString();
      const autoMain = mainSliderIds.has(post.id) ? ' · <span class="main-slider-badge">Main Home Page</span>' : '';
      const placementText = placementsFor(post).map(value=>placementLabels[value]).join(", ") || "—";
      const selector=options.selectable?'<td><input type="checkbox" class="draft-row-select" data-draft-select="'+safe(post.id)+'" aria-label="Select '+safe(post.title||"post")+'"></td>':'';
      const languageText=(post.postLanguages||[post.language||"en"]).map(code=>languages[code]||code).join(" + ");
      const menu='<button type="button" class="view-details-btn" data-view-details="'+safe(post.id)+'">View Details</button>';
      return '<tr>'+selector+'<td class="table-title"><strong>'+safe(post.title||"Untitled")+'</strong><small>'+safe(date)+' · '+safe(languageText)+'</small></td><td>'+safe(categories[post.category]||post.category)+(post.subcategory?' · '+safe(post.subcategory):'')+'</td><td>'+safe(placementText)+((post.featuredStories ?? post.featured)?" · Featured Stories":"")+autoMain+'</td><td><span class="status-badge '+safe(post.status)+'">'+safe(post.status)+'</span></td><td>'+Number(post.views||0).toLocaleString()+'</td><td><div class="row-actions">'+menu+'</div></td></tr>';
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
    $("#allDrafts").innerHTML=drafts.length ? postRows(drafts,{selectable:true}) : '<div class="empty-table">No drafts yet. Save an article as Draft and it will appear here.</div>';
    renderSeoList();
  }

  /* Secure publishing and manual sitemap approval. GitHub credentials stay in the Edge Function. */
  async function invokePublishFunction(postIds, action="publish", include){
    const {data:{session},error:sessionError}=await db().auth.getSession();
    if(sessionError||!session?.access_token)throw new Error("Your admin session expired. Please sign in again.");
    const response=await fetch("https://oxxnjxrunvhrfwxdvbsr.supabase.co/functions/v1/publish-post",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token,"apikey":SUPABASE_PUBLISHABLE_KEY},
      body:JSON.stringify({action,postIds,include})
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.success)throw new Error(result.error||"The publishing service could not complete the request.");
    return result;
  }
  async function refreshPostRows(){
    const {data,error}=await db().from("posts").select("*").order("updated_at",{ascending:false});
    if(error)throw error;
    posts=(data||[]).map(fromDatabase);renderLists();
  }
  async function publishPosts(ids){
    const unique=[...new Set(ids||[])];
    if(!unique.length)return showToast("Select at least one draft to publish.");
    const button=$("#publishSelectedBtn");if(button)button.disabled=true;
    try{
      for(let i=0;i<unique.length;i+=25){
        await invokePublishFunction(unique.slice(i,i+25));
      }
      await refreshPostRows();
      showToast(unique.length+" post(s) published. Sitemap was not changed.");
      openView("posts");
    }catch(error){showToast("Publishing stopped: "+(error.message||"Unknown error."));await refreshPostRows().catch(()=>{});}
    finally{if(button)button.disabled=false;}
  }
  function renderSeoList(){
    const host=$("#seoPostList");if(!host)return;
    const published=posts.filter(post=>post.status==="published").sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
    if(!published.length){host.innerHTML='<div class="empty-table">No published posts are available for sitemap approval.</div>';return;}
    host.innerHTML='<table><thead><tr><th>Select</th><th>Article</th><th>Sitemap status</th><th>Last updated</th></tr></thead><tbody>'+published.map(post=>{
      const submitted=!!post.sitemapSubmitted;
      const needsReview=submitted&&post.sitemapSubmittedAt&&new Date(post.updatedAt)>new Date(post.sitemapSubmittedAt);
      const label=needsReview?"Update Required":submitted?"Submitted":"Not Submitted";
      const badge=needsReview?"warning":submitted?"success":"muted";
      return '<tr><td><input type="checkbox" data-sitemap-select="'+safe(post.id)+'" aria-label="Select '+safe(post.title)+'"></td><td class="table-title"><strong>'+safe(post.title)+'</strong><small>'+safe(categories[post.category]||post.category)+'</small></td><td><span class="seo-status '+badge+'">'+label+'</span></td><td>'+safe(new Date(post.updatedAt||post.createdAt).toLocaleDateString())+'</td></tr>';
    }).join("")+'</tbody></table>';
  }
  async function updateSitemapSelection(include){
    const ids=[...$("#seoPostList").querySelectorAll("[data-sitemap-select]:checked")].map(input=>input.dataset.sitemapSelect);
    if(!ids.length)return showToast("Select at least one published post.");
    const action=include?"add to":"remove from";
    if(!window.confirm("Confirm "+action+" sitemap for "+ids.length+" selected post(s)?"))return;
    try{
      for(let i=0;i<ids.length;i+=25)await invokePublishFunction(ids.slice(i,i+25),"update_sitemap",include);
      await refreshPostRows();
      showToast("Sitemap updated. Search engines will decide when to crawl the URLs.");
    }catch(error){showToast("Sitemap update failed: "+(error.message||"Unknown error."));}
  }

  /* View navigation */
  function openView(view){
    document.querySelectorAll(".view-panel").forEach(panel=>panel.classList.toggle("active",panel.id===view+"View"));
    document.querySelectorAll(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
    $("#pageTitle").textContent={dashboard:"Dashboard",posts:"All Posts",drafts:"My Drafts",scheduled:"Scheduled Posts",seo:"SEO & Marketing",editor:editingId?"Edit Post":"Write a Post",headlines:"All Headlines",headlineEditor:editingHeadlineId?"Edit Headline":"Write a Headline"}[view]||"Dashboard";
    if(view!=="editor") renderLists();
  }
  document.querySelectorAll(".nav-item").forEach(button=>button.addEventListener("click",()=>openView(button.dataset.view)));
  document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>openView(button.dataset.open)));
  $("#newPostBtn").addEventListener("click",()=>newPost());
  $("#postSearch").addEventListener("input",renderLists);
  $("#draftSearch").addEventListener("input",renderLists);
  $("#allDrafts").addEventListener("change",event=>{
    if(event.target.id==="draftSelectAll"){
      $("#allDrafts").querySelectorAll("[data-draft-select]").forEach(input=>input.checked=event.target.checked);
    }
  });
  $("#publishSelectedBtn").addEventListener("click",()=>{
    const ids=[...$("#allDrafts").querySelectorAll("[data-draft-select]:checked")].map(input=>input.dataset.draftSelect);
    publishPosts(ids);
  });
  $("#publishAllBtn").addEventListener("click",()=>{
    const ids=posts.filter(post=>post.status==="draft").map(post=>post.id);
    if(ids.length&&window.confirm("Publish all "+ids.length+" drafts? Only these drafts will be published."))publishPosts(ids);
  });
  $("#seoAddSelectedBtn").addEventListener("click",()=>updateSitemapSelection(true));
  $("#seoRemoveSelectedBtn").addEventListener("click",()=>updateSitemapSelection(false));

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
    updateArticleTextSize();
  }
  $("#visualModeBtn").addEventListener("click",()=>setEditorMode("visual"));
  $("#htmlModeBtn").addEventListener("click",()=>setEditorMode("html"));
  function captureActiveTranslation(){
    if(!translationDrafts[activeEditorLanguage])translationDrafts[activeEditorLanguage]=blankTranslation();
    translationDrafts[activeEditorLanguage].content_html=cleanArticleHTML();
  }
  function activateArticleLanguage(language){
    if(!editorialLanguages.includes(language)||language===activeEditorLanguage)return;
    captureActiveTranslation();
    activeEditorLanguage=language;
    const next=translationDrafts[language]||blankTranslation();
    $("#articleEditor").innerHTML=next.content_html||"<p></p>";
    $("#articleHtmlEditor").value=next.content_html||"";
    selectedInlineFigure=null;
    $("#inlineImagePanel").classList.remove("is-visible");
    document.querySelectorAll("[data-article-language]").forEach(button=>{
      const active=button.dataset.articleLanguage===language;
      button.classList.toggle("active",active);
      button.setAttribute("aria-selected",String(active));
    });
    setEditorMode("visual");
    updateArticleTextSize();
    $("#articleEditor").setAttribute("data-placeholder",language==="bn"?"বাংলা আর্টিকেল এখানে লিখুন...":language==="en"?"Write the English article here...":"यहाँ हिंदी लेख लिखें...");
  }
  document.querySelectorAll("[data-article-language]").forEach(button=>{
    button.addEventListener("click",()=>activateArticleLanguage(button.dataset.articleLanguage));
  });
  $("#formatHtmlBtn").addEventListener("click",()=>{$("#articleHtmlEditor").value=formatHTMLSource($("#articleHtmlEditor").value);showToast("HTML code formatted.");});

  /* Live estimate of article text only (UTF-8); media files and HTML markup are excluded. */
  function updateArticleTextSize(){
    const source=editorMode==="html"?$("#articleHtmlEditor").value:$("#articleEditor").innerHTML;
    const textOnly=document.createElement("div");
    textOnly.innerHTML=source;
    textOnly.querySelectorAll("img,svg,video,iframe,audio,source,track,script,style,.cms-resize-handle").forEach(node=>node.remove());
    const plainText=(textOnly.textContent||"").replace(/\u00a0/g," ").replace(/\s+/g," ").trim();
    const byteSize=new TextEncoder().encode(plainText).length;
    const kb=(byteSize/1024).toFixed(2);
    $("#articleTextSizeValue").textContent=kb+" KB";
    $("#articleTextSizeDetail").textContent=byteSize.toLocaleString()+" bytes · Images excluded";
  }
  $("#articleEditor").addEventListener("input",updateArticleTextSize);
  $("#articleHtmlEditor").addEventListener("input",updateArticleTextSize);
  const articleTextSizeObserver=new MutationObserver(updateArticleTextSize);
  articleTextSizeObserver.observe($("#articleEditor"),{childList:true,subtree:true,characterData:true});

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
    readImage(file,data=>{coverData=data;coverProvider=document.querySelector('input[name="coverStorageProvider"]:checked')?.value||"cloudinary";renderCoverPreview();showToast("Cover image selected. It will upload to "+(coverProvider==="cloudinary"?"Cloudinary":"Supabase Storage")+" when you save the post.");});
  });
  $("#coverImageUrlBtn").addEventListener("click",()=>{
    const url=window.prompt("Paste a public cover image URL (https://...)");
    if(!url)return;
    if(!/^https:\/\//i.test(url))return showToast("Please use a public HTTPS image URL.");
    coverData=url.trim();coverProvider="";$("#coverUpload").value="";renderCoverPreview();showToast("Cover image URL added.");
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
    const biographyFields=$("#biographyFields");if(biographyFields)biographyFields.hidden=category!=="biography";
    ["#biographyPersonNameBn","#biographyPersonNameEn","#biographyPersonNameHi","#biographyPersonType","#biographyCountry"].forEach(selector=>{const field=$(selector);if(field)field.required=false;});
    const options=category==="sports"?[["cricket","Cricket"],["football","Football"],["tennis","Tennis"],["basketball","Basketball"],["other-sports","Other"]]:category==="entertainment"?[["cinema","Cinema"],["bollywood","Bollywood"],["south-cinema","South Indian Cinema"],["music","Music"],["hollywood","Hollywood"],["television","Television"],["serial","TV Serials"],["folk-art","Folk Culture"]]:category==="world"?[["bangladesh","Bangladesh"],["india","India"],["pakistan","Pakistan"],["asia","Asia"],["europe","Europe"],["middle-east","Middle East"]]:category==="lifestyle"?[["daily-tips","Daily Tips"],["health","Health"],["beauty-care","Beauty Care"]]:[];
    const select=$("#postSubcategory"),previous=select.value;$("#categorySubcategoryField").hidden=!options.length;select.required=!!options.length;
    select.innerHTML='<option value="">Select a subcategory</option>'+options.map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join("");
    select.value=options.some(([value])=>value===previous)?previous:"";
  }
  function syncScheduleFields(){ const field=$("#scheduledPublishFields"); if(field) field.hidden=$("#postStatus").value!=="scheduled"; }
  function syncSaveButtonLabel(){ const button=$("#savePostBtn"); if(!button)return; const labels={draft:"Save as Draft",published:"Publish Immediately",scheduled:"Schedule Publishing"}; button.textContent=labels[$("#postStatus").value]||"Save as Draft"; }
  function toLocalDateTime(value){ if(!value) return ""; const date=new Date(value); if(Number.isNaN(date.getTime())) return {date:"",time:""}; const local=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16); return {date:local.slice(0,10),time:local.slice(11,16)}; }
  function setScheduleInputs(value){ const parts=toLocalDateTime(value); $("#scheduledPublishDate").value=parts.date; $("#scheduledPublishTime").value=parts.time; }
  function getScheduleInputValue(){ const date=$("#scheduledPublishDate").value; const time=$("#scheduledPublishTime").value; return date&&time?date+"T"+time:""; }
  $("#postStatus").addEventListener("change",()=>{syncScheduleFields();syncSaveButtonLabel();});
  $("#postCategory").addEventListener("change",syncCategorySubcategory);
  $("#postCategory").addEventListener("change",updatePostUrlPreview);
  $("#postSubcategory").addEventListener("change",updatePostUrlPreview);
  ["#postTitle","#postTitleEn","#postTitleHi"].forEach(selector=>$(selector).addEventListener("input",updatePostUrlPreview));
  document.querySelectorAll('input[name="postLanguage"]').forEach(input=>input.addEventListener("change",updatePostUrlPreview));
  function resetForm(){
    $("#postForm").reset(); $("#postStatus").disabled=false; translationDrafts=emptyTranslations(); activeEditorLanguage="bn"; document.querySelectorAll("[data-article-language]").forEach(button=>{const active=button.dataset.articleLanguage==="bn";button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active));}); syncCategorySubcategory(); updatePostUrlPreview(); syncScheduleFields(); syncSaveButtonLabel(); $("#articleEditor").innerHTML="<p></p>"; $("#articleHtmlEditor").value=""; $("#articleEditor").setAttribute("data-placeholder","বাংলা আর্টিকেল এখানে লিখুন..."); setEditorMode("visual"); $("#cardSummary").value=""; $("#metaTitle").value=""; $("#metaDescription").value=""; $("#focusKeyword").value=""; updateMetaDescriptionCount(); selectedInlineFigure=null; $("#inlineImagePanel").classList.remove("is-visible");
    currentKeywords=[]; renderKeywordChips();
    coverData=""; coverProvider=""; $("#coverUpload").value=""; document.querySelector('input[name="coverStorageProvider"][value="cloudinary"]').checked=true; renderCoverPreview(); $("#deleteCurrentBtn").hidden=true;
    $("#editorStatusText").textContent="Draft"; $("#editorStatusDot").parentElement.classList.remove("live");
  }
  function newPost(){
    editingId=null; resetForm(); openView("editor"); $("#pageTitle").textContent="Write a Post"; $("#postTitle").focus();
  }
  function editPost(postId){
    const post=posts.find(item=>item.id===postId); if(!post) return;
    editingId=postId; resetForm();
    translationDrafts=emptyTranslations();
    const savedTranslations=post.translations||emptyTranslations();
    editorialLanguages.forEach(language=>{translationDrafts[language]={...blankTranslation(),...(savedTranslations[language]||{})};});
    const legacyLanguage=editorialLanguages.includes(post.language)?post.language:"en";
    if(!translationDrafts[legacyLanguage].title&&post.title)translationDrafts[legacyLanguage].title=post.title;
    if(!translationDrafts[legacyLanguage].content_html&&post.content)translationDrafts[legacyLanguage].content_html=post.content;
    $("#postTitle").value=translationDrafts.bn.title||"";
    $("#postTitleEn").value=translationDrafts.en.title||"";
    $("#postTitleHi").value=translationDrafts.hi.title||"";
    const storedLanguages=Array.isArray(post.postLanguages)&&post.postLanguages.length?post.postLanguages:[legacyLanguage];
    document.querySelectorAll('input[name="postLanguage"]').forEach(input=>{input.checked=storedLanguages.includes(input.value);});
    activeEditorLanguage=storedLanguages.includes("bn")?"bn":(editorialLanguages.includes(storedLanguages[0])?storedLanguages[0]:"en");
    document.querySelectorAll("[data-article-language]").forEach(button=>{const active=button.dataset.articleLanguage===activeEditorLanguage;button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active));});
    const initialContent=translationDrafts[activeEditorLanguage].content_html||"";
    $("#articleEditor").innerHTML=initialContent||"<p></p>"; $("#articleHtmlEditor").value=initialContent; $("#articleEditor").setAttribute("data-placeholder",activeEditorLanguage==="bn"?"বাংলা আর্টিকেল এখানে লিখুন...":activeEditorLanguage==="en"?"Write the English article here...":"यहाँ हिंदी लेख लिखें..."); setEditorMode("visual"); $("#cardSummary").value=post.excerpt||""; $("#metaTitle").value=post.metaTitle||""; $("#metaDescription").value=post.metaDescription||""; $("#focusKeyword").value=post.focusKeyword||""; updateMetaDescriptionCount(); selectedInlineFigure=null; $("#inlineImagePanel").classList.remove("is-visible");
    $("#postCategory").value=post.category||"world"; syncCategorySubcategory(); $("#postSubcategory").value=post.subcategory||""; $("#biographyPersonNameBn").value=post.translations?.bn?.person_name||((post.language||"bn")==="bn"?post.biographyPersonName||"":""); $("#biographyPersonNameEn").value=post.translations?.en?.person_name||((post.language||"bn")==="en"?post.biographyPersonName||"":""); $("#biographyPersonNameHi").value=post.translations?.hi?.person_name||((post.language||"bn")==="hi"?post.biographyPersonName||"":""); $("#biographyPersonType").value=post.biographyPersonType||""; $("#biographyCountry").value=post.biographyCountry||""; updatePostUrlPreview();
    const selectedPlacements=placementsFor(post); document.querySelectorAll('input[name="postPlacement"]').forEach(input=>{input.checked=selectedPlacements.includes(input.value);}); if(!$("#postStatus").querySelector('option[value="published"]'))$("#postStatus").insertAdjacentHTML("beforeend",'<option value="published">Published</option>'); $("#postStatus").value=post.status==="scheduled"?"scheduled":post.status==="published"?"published":"draft"; $("#postStatus").disabled=false; setScheduleInputs(post.scheduledAt); syncScheduleFields(); syncSaveButtonLabel(); $("#postFeaturedStories").checked=!!(post.featuredStories ?? post.featured);
    currentKeywords=Array.isArray(post.keywords)?post.keywords.filter(value=>typeof value==="string").slice(0,12):[]; renderKeywordChips();
    $("#videoUrl").value=post.videoUrl||""; coverData=post.cover||""; coverProvider=""; renderCoverPreview();
    
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
    const details=event.target.closest("[data-view-details]");
    const edit=event.target.closest("[data-edit]"); const del=event.target.closest("[data-delete]");
    if(details) editPost(details.dataset.viewDetails);
    if(edit) editPost(edit.dataset.edit);
    if(del) deletePost(del.dataset.delete);
  });
  $("#deleteCurrentBtn").addEventListener("click",()=>editingId&&deletePost(editingId));

  $("#postForm").addEventListener("submit",async event=>{
    event.preventDefault();
    captureActiveTranslation();
    const selectedLanguages=[...document.querySelectorAll('input[name="postLanguage"]:checked')].map(input=>input.value);
    if(!selectedLanguages.length)return showToast("Select at least one post language.");
    const titleFields={bn:$("#postTitle").value.trim(),en:$("#postTitleEn").value.trim(),hi:$("#postTitleHi").value.trim()};
    const translations={};
    for(const language of selectedLanguages){
      const title=titleFields[language]||"";
      const content=translationDrafts[language]?.content_html||"";
      if(!title)return showToast("Add the "+languages[language]+" post title before saving.");
      if(!plainText(content))return showToast("Write the full "+languages[language]+" article before saving.");
      translations[language]={title,content_html:content};
    }
    const primaryLanguage=selectedLanguages.includes("bn")?"bn":selectedLanguages[0];
    const title=translations[primaryLanguage].title;
    const content=translations[primaryLanguage].content_html;
     editorialLanguages.forEach(language=>{translations[language]={...(translations[language]||blankTranslation()),person_name:biographyNames[language]||""};});
    updatePostUrlPreview();
    const existing=posts.find(item=>item.id===editingId);
    const selectedPostTypes=Array.from(document.querySelectorAll('input[name="postPlacement"]:checked')).map(input=>input.value);
    if(!selectedPostTypes.length) return showToast("Select at least one post placement: Latest, Popular, Trending or Favorites.");
    const selectingMyChoice=selectedPostTypes.includes("myChoice");
    const alreadyMyChoice=posts.filter(item=>item.id!==editingId && (Array.isArray(item.postTypes)?item.postTypes.includes("myChoice"):item.postType==="myChoice")).length;
    if(selectingMyChoice && alreadyMyChoice>=4) return showToast("Favorites can contain up to 4 selected items.");
    const selectingFeaturedStories=$("#postFeaturedStories").checked;
    const alreadyFeaturedStories=posts.filter(item=>item.id!==editingId && (item.featuredStories ?? item.featured)).length;
    if(selectingFeaturedStories && alreadyFeaturedStories>=20) return showToast("Featured Stories can contain up to 20 selected posts.");
    const biographyNames={bn:$("#biographyPersonNameBn").value.trim(),en:$("#biographyPersonNameEn").value.trim(),hi:$("#biographyPersonNameHi").value.trim()};
     if($("#postCategory").value==="biography"&&(!biographyNames[primaryLanguage]||!$("#biographyPersonType").value||!$("#biographyCountry").value))return showToast("For Biography posts, enter the Person Name in the primary language, Person Type and Country of Origin.");
    const now=new Date().toISOString();
    const selectedStatus=$("#postStatus").value;
    const scheduledValue=getScheduleInputValue();
    if(selectedStatus==="scheduled" && (!scheduledValue || new Date(scheduledValue).getTime()<=Date.now())) return showToast("Choose a future date and time for scheduled publishing.");
    const scheduledAt=selectedStatus==="scheduled"?new Date(scheduledValue).toISOString():null;
    const post={
      id:editingId||id(),title,content,translations,postLanguages:selectedLanguages,excerpt:$("#cardSummary").value.trim(),metaTitle:$("#metaTitle").value.trim(),metaDescription:$("#metaDescription").value.trim(),focusKeyword:$("#focusKeyword").value.trim(),category:$("#postCategory").value,biographyPersonName:biographyNames[primaryLanguage],biographyPersonType:$("#biographyPersonType").value,biographyCountry:$("#biographyCountry").value,subcategory:["sports","entertainment","world","lifestyle"].includes($("#postCategory").value)?$("#postSubcategory").value:"",language:primaryLanguage,
      postTypes:selectedPostTypes,postType:selectedPostTypes[0],featuredStories:selectingFeaturedStories,featured:selectingFeaturedStories,status:selectedStatus,scheduledAt,keywords:[...currentKeywords],
      videoUrl:$("#videoUrl").value.trim(),cover:coverData,coverProvider:coverProvider||document.querySelector('input[name="coverStorageProvider"]:checked')?.value||"cloudinary",views:existing?Number(existing.views)||0:0,
      createdAt:existing?existing.createdAt:now,updatedAt:now,publishedAt:selectedStatus==="published"?(existing&&existing.publishedAt||now):null,
      sitemapSubmitted:existing?!!existing.sitemapSubmitted:false,sitemapSubmittedAt:existing?.sitemapSubmittedAt||null
    };
    const saveButton=$("#savePostBtn");
    saveButton.disabled=true;saveButton.textContent="Saving to Supabase…";
    try{
      if(!cloudReady) throw new Error("Supabase is not connected yet. Please reload the Admin Panel.");
      const savedPost=await savePostToCloud(post);
      const previous=posts.findIndex(item=>item.id===savedPost.id);
      if(previous>=0) posts[previous]=savedPost; else posts.unshift(savedPost);
      if(savedPost.status==="published"){
        await invokePublishFunction([savedPost.id]);
      }
    }catch(error){
      showToast("Could not save post: "+(error.message||"Database or image upload error."));
      return;
    }finally{saveButton.disabled=false;syncSaveButtonLabel();}
    editingId=post.id; $("#deleteCurrentBtn").hidden=false;
    $("#editorStatusText").textContent=post.status==="published"?"Published":"Draft";
    $("#editorStatusDot").parentElement.classList.toggle("live",post.status==="published");
    renderLists();
    if(post.status==="draft"){ openView("drafts"); showToast("Draft saved securely to Supabase."); }
    else if(post.status==="scheduled"){ openView("scheduled"); showToast("Scheduled post saved. It will publish automatically when the scheduler runs."); }
    else { openView("posts"); showToast("Published article and its HTML page were updated. Sitemap approval remains separate."); }
    $("#pageTitle").textContent=post.status==="published"?"All Posts":post.status==="scheduled"?"Scheduled Posts":"My Drafts";
  });

  /* Article preview */
  function previewHTML(){
    captureActiveTranslation();
    const titleField={bn:"#postTitle",en:"#postTitleEn",hi:"#postTitleHi"}[activeEditorLanguage];
    const title=safe($(titleField).value||"Untitled article");
    const category=safe(categories[$("#postCategory").value]);
    const subcategory=["sports","entertainment","world","lifestyle"].includes($("#postCategory").value)?safe($("#postSubcategory").selectedOptions[0]?.textContent||""):"";
    const body=translationDrafts[activeEditorLanguage]?.content_html||cleanArticleHTML();
    const cover=coverData?'<img src="'+coverData+'" alt="Article cover">':"";
    const keywords=currentKeywords.length?'<div class="article-keywords">'+currentKeywords.map(word=>'<span>#'+safe(word.replace(/\s+/g,""))+'</span>').join("")+'</div>':"";
    const video=$("#videoUrl").value.trim();
    const videoLink=video?'<p><a href="'+safe(video)+'" target="_blank" rel="noopener">Watch featured video ↗</a></p>':"";
    return cover+'<div class="meta">'+category+(subcategory?' · '+subcategory:'')+' · '+safe(languages[activeEditorLanguage])+'</div><h1>'+title+'</h1>'+body+videoLink+keywords;
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
