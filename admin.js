
/* =========================================================
   GLOBAL SCOPE 24 CMS
   Local prototype for content workflow and editor interactions.
   Supabase authentication, database and permanent media storage
   will be connected after the project credentials are supplied.
========================================================= */
(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const STORAGE_KEY = "everyday-atlas-cms-posts-v1";
  const categories = {world:"World News",tips:"Daily Tips",technology:"Technology",sports:"Sports",entertainment:"Entertainment",health:"Health",lifestyle:"Lifestyle",travel:"Travel",finance:"Finance",hospitals:"Hospitals (legacy)"};
  const placementLabels = {latest:"Latest",popular:"Popular",myChoice:"Favorites"};
  function placementsFor(post){ const values=Array.isArray(post.postTypes)?post.postTypes:(post.postType?[post.postType]:["latest"]); return [...new Set(values.filter(value=>placementLabels[value]))]; }
  const languages = {en:"English",bn:"বাংলা",hi:"हिन्दी",de:"Deutsch",fr:"Français",es:"Español"};
  let posts = loadPosts();
  let editingId = null;
  let coverData = "";
  let currentKeywords = [];

  function loadPosts(){
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); if(!Array.isArray(saved))return []; let changed=false; saved.forEach(post=>{if(post&&post.category==="beauty"){post.category="lifestyle";changed=true;}}); if(changed)localStorage.setItem(STORAGE_KEY,JSON.stringify(saved)); return saved; }
    catch(error){ return []; }
  }
  function persist(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); return true; }
    catch(error){ showToast("Browser storage is full. Remove large images and try again."); return false; }
  }
  function id(){ return "ea-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7); }
  function safe(value){ return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char])); }
  function plainText(html){ const node=document.createElement("div"); node.innerHTML=html; return (node.textContent||"").trim(); }
  function showToast(message){ const toast=$("#toast"); toast.textContent=message; toast.classList.add("show"); window.clearTimeout(showToast.timer); showToast.timer=window.setTimeout(()=>toast.classList.remove("show"),2600); }

  /* Dashboard and post tables */
  function renderStats(){
    $("#statTotal").textContent=posts.length;
    $("#statPublished").textContent=posts.filter(post=>post.status==="published").length;
    $("#statDrafts").textContent=posts.filter(post=>post.status==="draft").length;
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
    const recent=[...posts].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,5);
    $("#recentPosts").innerHTML=postRows(recent);
    const query=($("#postSearch").value||"").trim().toLowerCase();
    const published=[...posts].filter(post=>post.status==="published"&&(!query||(post.title+" "+plainText(post.content)).toLowerCase().includes(query))).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
    $("#allPosts").innerHTML=published.length ? postRows(published) : '<div class="empty-table">No published posts yet. Published articles will appear here.</div>';
    const draftQuery=($("#draftSearch")?.value||"").trim().toLowerCase();
    const drafts=[...posts].filter(post=>post.status==="draft"&&(!draftQuery||(post.title+" "+plainText(post.content)).toLowerCase().includes(draftQuery))).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
    $("#allDrafts").innerHTML=drafts.length ? postRows(drafts) : '<div class="empty-table">No drafts yet. Articles saved as draft will appear here.</div>';
  }

  /* View navigation */
  function openView(view){
    document.querySelectorAll(".view-panel").forEach(panel=>panel.classList.toggle("active",panel.id===view+"View"));
    document.querySelectorAll(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
    $("#pageTitle").textContent={dashboard:"Dashboard",posts:"All Posts",drafts:"All Drafts",editor:editingId?"Edit Post":"Write a Post",headlines:"All Headlines",headlineEditor:editingHeadlineId?"Edit Headline":"Write a Headline"}[view]||"Dashboard";
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
    if(!file||!file.type.startsWith("image/")) return showToast("Please choose an image file.");
    if(file.size>2*1024*1024) return showToast("For this local preview, each image must be under 2 MB.");
    const reader=new FileReader();
    reader.onload=()=>callback(String(reader.result));
    reader.onerror=()=>showToast("Could not read this image.");
    reader.readAsDataURL(file);
  }
  $("#imageBtn").addEventListener("click",()=>$("#imageUpload").click());
  $("#imageUpload").addEventListener("change",event=>{
    Array.from(event.target.files||[]).forEach(file=>readImage(file,data=>{
      $("#articleEditor").focus(); document.execCommand("insertHTML",false,'<p><img src="'+data+'" alt="'+safe(file.name)+'"></p>');
    }));
    event.target.value="";
  });
  $("#coverUpload").addEventListener("change",event=>{
    const file=event.target.files[0]; if(!file) return;
    readImage(file,data=>{coverData=data;$("#coverPreview").innerHTML='<img src="'+data+'" alt="Cover preview">';});
  });
  $("#videoBtn").addEventListener("click",()=>{
    const url=window.prompt("Paste a YouTube or Vimeo video URL");
    if(!url) return;
    if(!/^https?:\/\//i.test(url)) return showToast("Please enter a valid video URL.");
    $("#articleEditor").focus();
    document.execCommand("insertHTML",false,'<p><a href="'+safe(url)+'" target="_blank" rel="noopener">Watch the video ↗</a></p>');
  });
  $("#postExcerpt").addEventListener("input",()=>$("#excerptCount").textContent=$("#postExcerpt").value.length);
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

  /* Form state and CRUD */
  function syncCategorySubcategory(){
    const category=$("#postCategory").value;
    const options=category==="sports"?[["cricket","Cricket"],["football","Football"],["tennis","Tennis"],["basketball","Basketball"],["other-sports","Other"]]:category==="entertainment"?[["cinema","Cinema"],["bollywood","Bollywood"],["south-cinema","South Indian Cinema"],["music","Music"],["hollywood","Hollywood"],["television","Television"],["serial","TV Serials"],["folk-art","Folk Culture"]]:category==="world"?[["bangladesh","Bangladesh"],["india","India"],["pakistan","Pakistan"],["asia","Asia"],["europe","Europe"],["middle-east","Middle East"]]:category==="lifestyle"?[["beauty-care","Beauty Care"]]:[];
    const select=$("#postSubcategory"),previous=select.value;$("#categorySubcategoryField").hidden=!options.length;select.required=!!options.length;
    select.innerHTML='<option value="">Select a subcategory</option>'+options.map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join("");
    select.value=options.some(([value])=>value===previous)?previous:"";
  }
  $("#postCategory").addEventListener("change",syncCategorySubcategory);
  function resetForm(){
    $("#postForm").reset(); syncCategorySubcategory(); $("#articleEditor").innerHTML="<p></p>"; $("#excerptCount").textContent="0";
    currentKeywords=[]; renderKeywordChips();
    coverData=""; $("#coverPreview").textContent="No cover selected"; $("#deleteCurrentBtn").hidden=true;
    $("#editorStatusText").textContent="Draft"; $("#editorStatusDot").parentElement.classList.remove("live");
  }
  function newPost(){
    editingId=null; resetForm(); openView("editor"); $("#pageTitle").textContent="Write a Post"; $("#postTitle").focus();
  }
  function editPost(postId){
    const post=posts.find(item=>item.id===postId); if(!post) return;
    editingId=postId; resetForm();
    $("#postTitle").value=post.title||""; $("#articleEditor").innerHTML=post.content||"<p></p>";
    $("#postCategory").value=post.category||"health"; syncCategorySubcategory(); $("#postSubcategory").value=post.subcategory||""; $("#postLanguage").value=post.language||"en";
    const selectedPlacements=placementsFor(post); document.querySelectorAll('input[name="postPlacement"]').forEach(input=>{input.checked=selectedPlacements.includes(input.value);}); $("#postStatus").value=post.status||"draft"; $("#postFeaturedStories").checked=!!(post.featuredStories ?? post.featured);
    $("#postExcerpt").value=post.excerpt||""; $("#excerptCount").textContent=($("#postExcerpt").value).length;
    currentKeywords=Array.isArray(post.keywords)?post.keywords.filter(value=>typeof value==="string").slice(0,12):[]; renderKeywordChips();
    $("#videoUrl").value=post.videoUrl||""; coverData=post.cover||"";
    if(coverData) $("#coverPreview").innerHTML='<img src="'+coverData+'" alt="Cover preview">';
    $("#deleteCurrentBtn").hidden=false;
    $("#editorStatusText").textContent=post.status==="published"?"Published":"Draft";
    if(post.status==="published") $("#editorStatusDot").parentElement.classList.add("live");
    openView("editor"); $("#pageTitle").textContent="Edit Post";
  }
  function deletePost(postId){
    const post=posts.find(item=>item.id===postId); if(!post) return;
    if(!window.confirm('Delete "'+(post.title||"Untitled")+'"? This cannot be undone.')) return;
    posts=posts.filter(item=>item.id!==postId); persist();
    if(editingId===postId){editingId=null;resetForm();openView("posts");}
    renderLists(); showToast("Post deleted from this browser.");
  }
  document.addEventListener("click",event=>{
    const edit=event.target.closest("[data-edit]"); const del=event.target.closest("[data-delete]");
    if(edit) editPost(edit.dataset.edit);
    if(del) deletePost(del.dataset.delete);
  });
  $("#deleteCurrentBtn").addEventListener("click",()=>editingId&&deletePost(editingId));

  $("#postForm").addEventListener("submit",event=>{
    event.preventDefault();
    const title=$("#postTitle").value.trim(); const content=$("#articleEditor").innerHTML.trim();
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
    const post={
      id:editingId||id(),title,content,category:$("#postCategory").value,subcategory:["sports","entertainment","world","lifestyle"].includes($("#postCategory").value)?$("#postSubcategory").value:"",language:$("#postLanguage").value,
      postTypes:selectedPostTypes,postType:selectedPostTypes[0],featuredStories:selectingFeaturedStories,featured:selectingFeaturedStories,status:$("#postStatus").value,excerpt:$("#postExcerpt").value.trim(),keywords:[...currentKeywords],
      videoUrl:$("#videoUrl").value.trim(),cover:coverData,views:existing?Number(existing.views)||0:0,
      createdAt:existing?existing.createdAt:now,updatedAt:now,publishedAt:$("#postStatus").value==="published"?(existing&&existing.publishedAt||now):null
    };
    const previous=posts.findIndex(item=>item.id===post.id);
    if(previous>=0) posts[previous]=post; else posts.unshift(post);
    if(!persist()) return;
    editingId=post.id; $("#deleteCurrentBtn").hidden=false;
    $("#editorStatusText").textContent=post.status==="published"?"Published":"Draft";
    $("#editorStatusDot").parentElement.classList.toggle("live",post.status==="published");
    renderLists(); showToast(post.status==="published"?"Saved as published in local preview.":"Draft saved in this browser.");
    $("#pageTitle").textContent="Edit Post";
  });

  /* Article preview */
  function previewHTML(){
    const title=safe($("#postTitle").value||"Untitled article");
    const category=safe(categories[$("#postCategory").value]);
    const subcategory=["sports","entertainment","world","lifestyle"].includes($("#postCategory").value)?safe($("#postSubcategory").selectedOptions[0]?.textContent||""):"";
    const body=$("#articleEditor").innerHTML;
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
  function loadHeadlines() {
    try {
      const saved = JSON.parse(localStorage.getItem(HEADLINE_STORAGE_KEY) || "null");
      if (Array.isArray(saved)) return saved;
      const oldLines = JSON.parse(localStorage.getItem(TICKER_STORAGE_KEY) || "[]");
      return (Array.isArray(oldLines) ? oldLines : []).map((text,index)=>({id:"headline-"+index,text:String(text)}));
    } catch (_) { return []; }
  }
  let headlines = loadHeadlines();
  function persistHeadlines() {
    try {
      localStorage.setItem(HEADLINE_STORAGE_KEY, JSON.stringify(headlines));
      localStorage.setItem(TICKER_STORAGE_KEY, JSON.stringify(headlines.map(item=>item.text).filter(Boolean)));
      return true;
    } catch (_) { showToast("Could not save headlines in this browser."); return false; }
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
  $("#headlineForm").addEventListener("submit",event=>{
    event.preventDefault();
    const value=$("#headlineText").value.trim();
    if(!value) return showToast("Please write a headline.");
    if(editingHeadlineId) {
      const item=headlines.find(entry=>entry.id===editingHeadlineId);
      if(item) item.text=value;
    } else headlines.push({id:"headline-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),text:value});
    if(!persistHeadlines()) return;
    renderHeadlines(); showToast("Headline saved in this browser."); openView("headlines");
  });
  $("#allHeadlines").addEventListener("click",event=>{
    const edit=event.target.closest("[data-edit-headline]");
    const del=event.target.closest("[data-delete-headline]");
    if(edit) editHeadline(edit.dataset.editHeadline);
    if(del) {
      const id=del.dataset.deleteHeadline;
      headlines=headlines.filter(item=>item.id!==id);
      persistHeadlines(); renderHeadlines(); showToast("Headline deleted.");
    }
  });

  /* Initial state */
  renderLists();
  renderHeadlines();
  openView("dashboard");
})();
