/* =========================================================
   EVERYDAY ATLAS CMS
   Local prototype for content workflow and editor interactions.
   Supabase authentication, database and permanent media storage
   will be connected after the project credentials are supplied.
========================================================= */
(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const STORAGE_KEY = "everyday-atlas-cms-posts-v1";
  const categories = {world:"World News",tips:"Daily Tips",technology:"Technology",sports:"Sports",health:"Health",beauty:"Beauty",travel:"Travel",finance:"Finance",lifestyle:"Lifestyle",hospitals:"Hospitals (legacy)"};
  const languages = {en:"English",bn:"বাংলা",hi:"हिन्दी",de:"Deutsch",fr:"Français",es:"Español"};
  let posts = loadPosts();
  let editingId = null;
  let coverData = "";

  function loadPosts(){
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(saved) ? saved : []; }
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
  function postRows(items){
    if(!items.length) return '<div class="empty-table">No posts yet. Create your first article to get started.</div>';
    return '<table><thead><tr><th>Article</th><th>Category</th><th>Placement</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead><tbody>'+items.map(post=>{
      const date=new Date(post.updatedAt||post.createdAt).toLocaleDateString();
      return '<tr><td class="table-title"><strong>'+safe(post.title||"Untitled")+'</strong><small>'+safe(date)+' · '+safe(languages[post.language]||"English")+'</small></td><td>'+safe(categories[post.category]||post.category)+'</td><td>'+safe(post.postType==="popular"?"Popular":"Latest")+'</td><td><span class="status-badge '+safe(post.status)+'">'+safe(post.status)+'</span></td><td>'+Number(post.views||0).toLocaleString()+'</td><td><div class="row-actions"><button class="small-btn" data-edit="'+safe(post.id)+'">Edit</button><button class="small-btn delete" data-delete="'+safe(post.id)+'">Delete</button></div></td></tr>';
    }).join("")+'</tbody></table>';
  }
  function renderLists(){
    renderStats();
    const recent=[...posts].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,5);
    $("#recentPosts").innerHTML=postRows(recent);
    const query=($("#postSearch").value||"").trim().toLowerCase();
    const status=$("#statusFilter").value;
    const filtered=[...posts].filter(post=>(status==="all"||post.status===status)&&(!query||(post.title+" "+plainText(post.content)).toLowerCase().includes(query))).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
    $("#allPosts").innerHTML=postRows(filtered);
  }

  /* View navigation */
  function openView(view){
    document.querySelectorAll(".view-panel").forEach(panel=>panel.classList.toggle("active",panel.id===view+"View"));
    document.querySelectorAll(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
    $("#pageTitle").textContent={dashboard:"Dashboard",posts:"All Posts",editor:editingId?"Edit Post":"Write a Post"}[view]||"Dashboard";
    if(view!=="editor") renderLists();
  }
  document.querySelectorAll(".nav-item").forEach(button=>button.addEventListener("click",()=>openView(button.dataset.view)));
  document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>openView(button.dataset.open)));
  $("#newPostBtn").addEventListener("click",()=>newPost());
  $("#postSearch").addEventListener("input",renderLists);
  $("#statusFilter").addEventListener("change",renderLists);

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

  /* Form state and CRUD */
  function resetForm(){
    $("#postForm").reset(); $("#articleEditor").innerHTML="<p></p>"; $("#excerptCount").textContent="0";
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
    $("#postCategory").value=post.category||"health"; $("#postLanguage").value=post.language||"en";
    $("#postType").value=post.postType||"latest"; $("#postStatus").value=post.status||"draft";
    $("#postExcerpt").value=post.excerpt||""; $("#excerptCount").textContent=($("#postExcerpt").value).length;
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
    const now=new Date().toISOString();
    const post={
      id:editingId||id(),title,content,category:$("#postCategory").value,language:$("#postLanguage").value,
      postType:$("#postType").value,status:$("#postStatus").value,excerpt:$("#postExcerpt").value.trim(),
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
    const body=$("#articleEditor").innerHTML;
    const cover=coverData?'<img src="'+coverData+'" alt="Article cover">':"";
    const video=$("#videoUrl").value.trim();
    const videoLink=video?'<p><a href="'+safe(video)+'" target="_blank" rel="noopener">Watch featured video ↗</a></p>':"";
    return cover+'<div class="meta">'+category+' · '+safe(languages[$("#postLanguage").value])+'</div><h1>'+title+'</h1>'+body+videoLink;
  }
  $("#previewBtn").addEventListener("click",()=>{$("#previewContent").innerHTML=previewHTML();$("#previewDialog").showModal();});
  $("#closePreview").addEventListener("click",()=>$("#previewDialog").close());
  $("#previewDialog").addEventListener("click",event=>{if(event.target===$("#previewDialog")) $("#previewDialog").close();});

  /* Initial state */
  renderLists();
  openView("dashboard");
})();