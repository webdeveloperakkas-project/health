
(() => {
  /* =========================================================
     01. DOM HELPERS
     Purpose: Shortcuts for selecting one or many HTML elements.
     Section complete.
  ========================================================= */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  /* =========================================================
     02. ARTICLE DATA
     Purpose: Temporary sample articles shown on the public site.
     The future control panel will replace this local sample data.
     Section complete.
  ========================================================= */
  const posts = [
  {
    category:"health",title:"Small Daily Habits That Support a Healthier Life",postType:"latest",date:"November 19, 2026",read:"4 MIN READ",body:[
    "Good health is often supported by small choices repeated over time. A regular sleep schedule can help your body maintain a steady daily rhythm.",
    "Try to include a variety of vegetables, fruits and other nourishing foods in your meals. Drinking water throughout the day is a simple habit worth maintaining.",
    "Gentle movement, such as walking or stretching, can make an ordinary day more active. Choose activities that suit your ability and personal circumstances.",
    "Taking short breaks can also help you reset your attention. Make time to connect with family, friends or people you trust.",
    "Avoid trying to change every habit at once. Start with one realistic goal and give yourself time to practise it.",
    "Notice what works well for you and adjust your routine when needed. If you have a health concern, speak with a qualified healthcare professional.",
    "These everyday ideas are general information, not a personal treatment plan. Small, sustainable steps can be a useful starting point for wellbeing."
    ]
  },
  {
    category:"health",title:"A Simple Guide to Building a Balanced Daily Routine",postType:"popular",date:"November 18, 2026",read:"3 MIN READ",body:[
    "A balanced routine gives your day a helpful structure without making every hour feel fixed. Begin by choosing a regular time to wake up and prepare for sleep.",
    "Plan meals and keep a few simple, nourishing options available. Add movement in a way that feels comfortable and realistic.",
    "Make room for focused work as well as short pauses. A little preparation the night before can make the next morning feel calmer.",
    "Keep your goals flexible and review them from time to time. A routine should support your life, not become another source of pressure."
    ]
  },
  {
    category:"health",title:"Why Rest and Hydration Matter in Everyday Life",postType:"mostViewed",date:"November 17, 2026",read:"3 MIN READ",body:[
    "Rest and hydration are basic parts of everyday wellbeing. People have different needs, so pay attention to your own circumstances and routine.",
    "A calm bedtime environment and a consistent sleep schedule may make it easier to rest. Keep water available and drink regularly throughout the day.",
    "If tiredness or other symptoms continue or worry you, seek advice from a qualified healthcare professional rather than relying on general online tips."
    ]
  },
  {
    category:"technology",title:"Everyday AI Tools: A Friendly Starting Guide",postType:"latest",date:"November 19, 2026",read:"4 MIN READ",body:[
    "Artificial intelligence tools can help people explore ideas, organise information and complete some everyday digital tasks. You do not need to be a technical expert to begin learning about them.",
    "For example, an AI assistant can help you draft a checklist, explain an unfamiliar term or suggest a structure for a document. Clear instructions usually lead to more useful results.",
    "Always review important information before using it. AI systems can make mistakes, misunderstand a question or provide details that are out of date.",
    "Do not enter passwords, private financial information or sensitive personal details into tools unless you understand their privacy and security practices.",
    "Compare more than one source when a decision matters. For health, legal or financial questions, consult an appropriately qualified professional.",
    "Start with a simple, low-risk task and learn what the tool can and cannot do. Use technology as an assistant, not as a replacement for your own judgement.",
    "With thoughtful use, digital tools can save time while helping you stay in control of your work."
    ]
  },
  {
    category:"technology",title:"Simple Ways to Keep Your Online Accounts Safer",postType:"popular",date:"November 18, 2026",read:"3 MIN READ",body:[
    "A few careful habits can make your online accounts more secure. Use a different, strong password for each important service.",
    "Where available, turn on multi-factor authentication so a password alone is not enough to access your account. Keep your recovery email and phone number up to date.",
    "Be cautious with unexpected links and attachments, even when a message appears to come from someone you know. Check the website address before signing in.",
    "Keep your device and apps updated. If a message creates urgency or asks for money or login details, pause and verify it through an official channel."
    ]
  },
  {
    category:"technology",title:"Choosing Useful Apps Without Getting Overwhelmed",postType:"mostViewed",date:"November 17, 2026",read:"3 MIN READ",body:[
    "Before installing a new app, identify the task you want it to help with. A clear purpose makes it easier to compare options.",
    "Check who develops the app, what permissions it requests and how it handles personal information. Read recent reviews with a critical eye.",
    "Try the basic features before paying for a subscription. Remove apps you no longer use and review recurring charges periodically.",
    "The best tool is not always the one with the most features. Choose something reliable, understandable and suitable for your needs."
    ]
  },
  {
    category:"beauty",title:"A Simple, Thoughtful Approach to Daily Skincare",postType:"latest",date:"November 19, 2026",read:"4 MIN READ",body:[
    "A skincare routine does not need to contain many products to feel organised. Many basic routines focus on gentle cleansing, moisturising and sun protection.",
    "Choose products that suit your skin and introduce new items gradually. Using several new products at the same time can make it harder to identify what works for you.",
    "Read product labels and follow the directions provided by the manufacturer. A patch test may be useful when trying a new product, although it cannot guarantee that irritation will not occur.",
    "Sun protection is an important part of daytime care. Follow the product instructions and consider shade, clothing and other practical ways to reduce sun exposure.",
    "Avoid assuming that expensive products are automatically better. Simple, consistent care is often easier to maintain.",
    "If you experience persistent irritation, pain or a skin condition that concerns you, ask a qualified healthcare professional for advice.",
    "This guide is general educational information and is not a diagnosis or a personalised skincare recommendation."
    ]
  },
  {
    category:"beauty",title:"Understanding the Basics of Hair Care",postType:"popular",date:"November 18, 2026",read:"3 MIN READ",body:[
    "Hair needs can differ depending on hair type, styling habits and the environment. Start by noticing how your hair responds to your current routine.",
    "Use shampoo and conditioner according to their directions and avoid rough handling when hair is wet. Heat styling less often may help reduce avoidable damage.",
    "Choose a manageable routine instead of following every trend. If you notice sudden or persistent hair loss or scalp problems, seek professional advice."
    ]
  },
  {
    category:"beauty",title:"How to Read a Personal Care Product Label",postType:"mostViewed",date:"November 17, 2026",read:"3 MIN READ",body:[
    "Product labels can help you understand what an item is intended to do and how it should be used. Read the directions, warnings and ingredient list before use.",
    "Check the expiry information and store products as recommended. Be careful with claims that promise instant or guaranteed results.",
    "If you have allergies or sensitive skin, review ingredients carefully and ask a qualified professional when unsure. Stop using a product if it causes a concerning reaction."
    ]
  }
  ];
  /* =========================================================
     03. CATEGORY LABELS
     Purpose: Human-readable names for article categories.
     Section complete.
  ========================================================= */
  const categoryNames = {
    home:"Home",world:"World News",tips:"Daily Tips",technology:"Technology",sports:"Sports",health:"Health",beauty:"Beauty",travel:"Travel",finance:"Finance",lifestyle:"Lifestyle"
  };
  /* =========================================================
     04. LANGUAGE CONTENT
     Purpose: Translated interface labels for supported languages.
     Section complete.
  ========================================================= */
  const languageCopy = {
    en:{
      latest:"LATEST",categories:{
        home:"Home",world:"World News",tips:"Daily Tips",technology:"Technology",sports:"Sports",health:"Health",beauty:"Beauty",travel:"Travel",finance:"Finance",lifestyle:"Lifestyle"
      },stories:"LATEST STORIES",types:{
        latest:"Latest",popular:"Popular",mostViewed:"Most Viewed"
      },description:"Latest articles and useful information.",search:"Search articles...",sort:"NEWEST FIRST ↓",page:"Page",of:"of",articles:"Articles",empty:"No sample posts are available in this category yet. More articles will appear here as they are published.",about:"About",contact:"Contact",privacy:"Privacy",aboutTitle:"Clear information for a world of everyday questions.",aboutText:"Our articles are for general information and do not replace professional advice."
    },
    bn:{
      latest:"সর্বশেষ",categories:{
        home:"হোম",world:"বিশ্ব সংবাদ",tips:"দৈনন্দিন টিপস",technology:"প্রযুক্তি",sports:"খেলাধুলা",health:"স্বাস্থ্য",beauty:"সৌন্দর্য",travel:"ভ্রমণ",finance:"অর্থনীতি",lifestyle:"জীবনযাপন"
      },stories:"সর্বশেষ লেখা",types:{
        latest:"সর্বশেষ",popular:"জনপ্রিয়",mostViewed:"সর্বাধিক দেখা"
      },description:"সাম্প্রতিক প্রবন্ধ ও দরকারি তথ্য।",search:"প্রবন্ধ খুঁজুন...",sort:"নতুন লেখা আগে ↓",page:"পৃষ্ঠা",of:"এর",articles:"প্রবন্ধ",empty:"এই বিভাগে এখনো কোনো নমুনা প্রবন্ধ নেই। প্রকাশিত হলে নতুন প্রবন্ধ এখানে দেখা যাবে।",about:"আমাদের সম্পর্কে",contact:"যোগাযোগ",privacy:"গোপনীয়তা",aboutTitle:"প্রতিদিনের নানা প্রশ্নের জন্য সহজ ও নির্ভরযোগ্য তথ্য।",aboutText:"আমাদের প্রবন্ধ সাধারণ তথ্যের জন্য; এগুলো পেশাদার পরামর্শের বিকল্প নয়।"
    },
    hi:{
      latest:"ताज़ा",categories:{
        home:"होम",world:"विश्व समाचार",tips:"दैनिक सुझाव",technology:"प्रौद्योगिकी",sports:"खेल",health:"स्वास्थ्य",beauty:"सौंदर्य",travel:"यात्रा",finance:"वित्त",lifestyle:"जीवनशैली"
      },stories:"नवीनतम लेख",types:{
        latest:"नवीनतम",popular:"लोकप्रिय",mostViewed:"सबसे अधिक देखे गए"
      },description:"नए लेख और उपयोगी जानकारी।",search:"लेख खोजें...",sort:"नवीनतम पहले ↓",page:"पृष्ठ",of:"में से",articles:"लेख",empty:"इस श्रेणी में अभी कोई नमूना लेख उपलब्ध नहीं है।",about:"परिचय",contact:"संपर्क",privacy:"गोपनीयता",aboutTitle:"रोज़मर्रा के सवालों के लिए स्पष्ट और उपयोगी जानकारी।",aboutText:"हमारे लेख सामान्य जानकारी के लिए हैं और पेशेवर सलाह का विकल्प नहीं हैं।"
    },
    de:{
      latest:"AKTUELL",categories:{
        home:"Startseite",world:"Weltnachrichten",tips:"Alltagstipps",technology:"Technologie",sports:"Sport",health:"Gesundheit",beauty:"Schönheit",travel:"Reisen",finance:"Finanzen",lifestyle:"Lebensstil"
      },stories:"NEUESTE ARTIKEL",types:{
        latest:"Neueste",popular:"Beliebt",mostViewed:"Meistgesehen"
      },description:"Neueste Artikel und hilfreiche Informationen.",search:"Artikel suchen...",sort:"NEUESTE ZUERST ↓",page:"Seite",of:"von",articles:"Artikel",empty:"Für diese Kategorie sind noch keine Beispielartikel verfügbar.",about:"Über uns",contact:"Kontakt",privacy:"Datenschutz",aboutTitle:"Klare Informationen für die Fragen des Alltags.",aboutText:"Unsere Artikel dienen der allgemeinen Information und ersetzen keine professionelle Beratung."
    },
    fr:{
      latest:"À LA UNE",categories:{
        home:"Accueil",world:"Actualités",tips:"Conseils pratiques",technology:"Technologie",sports:"Sports",health:"Santé",beauty:"Beauté",travel:"Voyage",finance:"Finance",lifestyle:"Mode de vie"
      },stories:"DERNIERS ARTICLES",types:{
        latest:"Récent",popular:"Populaire",mostViewed:"Les plus vus"
      },description:"Articles récents et informations utiles.",search:"Rechercher des articles...",sort:"PLUS RÉCENT ↓",page:"Page",of:"sur",articles:"Articles",empty:"Aucun article exemple n'est encore disponible dans cette catégorie.",about:"À propos",contact:"Contact",privacy:"Confidentialité",aboutTitle:"Des informations claires pour les questions du quotidien.",aboutText:"Nos articles sont informatifs et ne remplacent pas un avis professionnel."
    },
    es:{
      latest:"ÚLTIMAS NOTICIAS",categories:{
        home:"Inicio",world:"Noticias mundiales",tips:"Consejos diarios",technology:"Tecnología",sports:"Deportes",health:"Salud",beauty:"Belleza",travel:"Viajes",finance:"Finanzas",lifestyle:"Estilo de vida"
      },stories:"ARTÍCULOS RECIENTES",types:{
        latest:"Recientes",popular:"Popular",mostViewed:"Más vistos"
      },description:"Artículos recientes e información útil.",search:"Buscar artículos...",sort:"MÁS RECIENTES ↓",page:"Página",of:"de",articles:"Artículos",empty:"Todavía no hay artículos de ejemplo en esta categoría.",about:"Acerca de",contact:"Contacto",privacy:"Privacidad",aboutTitle:"Información clara para las preguntas de cada día.",aboutText:"Nuestros artículos son informativos y no sustituyen el asesoramiento profesional."
    }
  };
  /* =========================================================
     05. LANGUAGE SWITCHING
     Purpose: Apply the selected language to interface controls.
     Section complete.
  ========================================================= */
  let activeLanguage = "en";
  function applyLanguage(language) {
    activeLanguage = languageCopy[language] ? language : "en";
    const t = languageCopy[activeLanguage];
    document.documentElement.lang = activeLanguage;
    Array.from(document.querySelectorAll(".category-tab, .sidebar-category")).forEach(button => {
      const label = t.categories[button.dataset.category];
      if (button.classList.contains("sidebar-category")) {
        const textNode = Array.from(button.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.nodeValue = label;
        else button.insertBefore(document.createTextNode(label), button.firstChild);
      } else {
        button.textContent = label;
      }
    });
    $("#siteSearch").placeholder = t.search;
    const tickerLabel = $(".ticker-label");
    if (tickerLabel) {
      const labelText = activeLanguage === "bn" ? "শিরোনাম" : t.latest;
      const dot = tickerLabel.querySelector(".ticker-dot");
      tickerLabel.textContent = labelText;
      if (dot) tickerLabel.prepend(dot);
    }
    $("#articleFeed .eyebrow").textContent = t.stories;
    Array.from(document.querySelectorAll(".post-type-option")).forEach(button => {
      button.textContent = t.types[button.dataset.postType];
    });
    $("#about h2").textContent = t.aboutTitle;
    $("#about p").textContent = t.aboutText;
    const links = $(".footer-links a");
    if (links[1]) links[1].textContent = t.about;
    if (links[2]) links[2].textContent = t.contact;
    if (links[3]) links[3].textContent = t.privacy;
    render();
  }
  /* =========================================================
     06. PAGE STATE
     Purpose: Remember selected category, post type, search and page.
     Section complete.
  ========================================================= */
  let activeCategory = "home";
  let currentPage = 1;
  let activePostType = "latest";
  const pageSize = 2;
  let searchTerm = "";
  const articleList = $("#articleList");
  const previousButton = $("#previousPage");
  const nextButton = $("#nextPage");
  /* =========================================================
     07. SAFE TEXT OUTPUT
     Purpose: Escape article text before inserting it into the page.
     Section complete.
  ========================================================= */
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }

  /* =========================================================
     08. ARTICLE RENDERING
     Purpose: Display posts matching the selected category and type.
     Section complete.
  ========================================================= */
  let showHomeFeed = false;
  let homeListType = "latest";
  let homeListIndex = 0;
  let homeCategoryIndex = 0;
  let homeListTimer = null;
  let homeCategoryTimer = null;

  const categoryImages = {
    health:"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=85",
    technology:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    beauty:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=85",
    world:"https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=85",
    tips:"https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85",
    sports:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85",
    travel:"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85",
    finance:"https://images.unsplash.com/photo-146 An?auto=format&fit=crop&w=1200&q=85",
    lifestyle:"https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85"
  };
  categoryImages.finance = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85";

  const homeSection = $("#homeSection");
  const articleSection = $("#articleFeed");
  const homeListPanel = $("#homeListPanel");
  const homeFeatured = $("#homeFeatured");
  const homeCategorySpotlight = $("#homeCategorySpotlight");
  const homeCategoryDots = $("#homeCategoryDots");
  const articleDialog = $("#articleDialog");
  const articleDialogContent = $("#articleDialogContent");

  function imageForPost(post) {
    return categoryImages[post.category] || categoryImages.lifestyle;
  }
  function sortedByDate(items) {
    return [...items].sort((a,b) => new Date(b.date) - new Date(a.date));
  }
  function articleSlug(post) {
    return String(post.title || "article").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }
  function articleShareUrl(post) {
    const url = new URL(window.location.href);
    url.searchParams.set("article", articleSlug(post));
    return url.toString();
  }
  function shareButtons(post) {
    return '<div class="home-share-row" aria-label="Share article">' +
      '<button type="button" data-share="facebook" data-post-index="' + posts.indexOf(post) + '" aria-label="Share on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg></button>' +
      '<button type="button" data-share="x" data-post-index="' + posts.indexOf(post) + '" aria-label="Share on X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h4.5l11.5 18h-4.5L4 3Zm0 18 6.8-8.1m2.4-2.8L20 3"/></svg></button>' +
      '<button type="button" data-share="whatsapp" data-post-index="' + posts.indexOf(post) + '" aria-label="Share on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.5 2.3 2.2 4 4.5 4.5l1-1 2 1c-.3 1.2-1.2 2-2.5 2-3.7-.3-6.7-3.3-7-7 0-1.3.8-2.2 2-2.5l1 2-1 1Z"/></svg></button>' +
      '<button type="button" data-share="copy" data-post-index="' + posts.indexOf(post) + '" aria-label="Copy article link"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 15 15 9"/><path d="M8 12H6a4 4 0 0 1 0-8h5a4 4 0 0 1 4 4v1"/><path d="M16 12h2a4 4 0 0 1 0 8h-5a4 4 0 0 1-4-4v-1"/></svg></button>' +
      '</div>';
  }
  function renderHomeList() {
    const featured = posts.find(post => post.featured) || sortedByDate(posts.filter(post => post.postType === "latest"))[0] || posts[0];
    const latestItems = sortedByDate(posts.filter(post => post.postType === "latest")).slice(0,10);
    const popularItems = [...posts].filter(post => post.postType === "popular")
      .sort((a,b) => (Number(b.views)||0) - (Number(a.views)||0) || new Date(b.date) - new Date(a.date)).slice(0,10);
    const items = homeListType === "popular" ? popularItems : latestItems;
    if (!items.length) {
      homeListPanel.innerHTML = '<div class="home-list-empty">' + (homeListType === "popular" ? "Popular stories will appear here soon." : "New stories will appear here as they are published.") + '</div>';
    } else {
      homeListPanel.innerHTML = items.map(post =>
        '<button class="home-list-item" type="button" data-open-post="' + posts.indexOf(post) + '">' +
          '<span class="home-list-thumb"><img src="' + imageForPost(post) + '" alt="" loading="lazy"></span>' +
          '<span class="home-list-copy"><span class="home-list-category">' + escapeHTML(categoryNames[post.category] || "Everyday Atlas") + '</span><strong>' + escapeHTML(post.title) + '</strong><time>' + escapeHTML(post.date) + (post.time ? " · " + escapeHTML(post.time) : "") + '</time></span>' +
        '</button>'
    }
    $$(".home-rail-tab").forEach(button => {
      const selected = button.dataset.homeList === homeListType;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    const viewAll = $("#homeViewAll");
    if (viewAll) viewAll.innerHTML = (activeLanguage === "bn" ? "আরও বিস্তারিত" : activeLanguage === "hi" ? "और अधिक जानें" : activeLanguage === "de" ? "Mehr erfahren" : activeLanguage === "fr" ? "En savoir plus" : activeLanguage === "es" ? "Ver más" : "More Details") + ' <span>→</span>';
  }
    function renderHomeFeatured() {
    const post = posts.find(item => item.featured) || sortedByDate(posts.filter(item => item.postType === "latest"))[0] || posts[0];
    if (!post) {
      homeFeatured.innerHTML = '<div class="home-feature-empty">Your main featured story will appear here.</div>';
      return;
    }
    const excerpt = (post.excerpt || (post.body || []).slice(0,2).join(" ")).slice(0,260);
    const index = posts.indexOf(post);
    homeFeatured.innerHTML =
      '<div class="home-feature-image"><img src="' + imageForPost(post) + '" alt="' + escapeHTML(post.title) + '" fetchpriority="high"><span class="home-feature-tag">MAIN FEATURED</span></div>' +
      '<div class="home-feature-content"><span class="home-feature-category">' + escapeHTML(categoryNames[post.category] || "FEATURED STORY") + '</span>' +
      '<h1>' + escapeHTML(post.title) + '</h1>' +
      '<div class="home-feature-meta"><time>' + escapeHTML(post.date) + '</time>' + (post.time ? '<span>·</span><span>' + escapeHTML(post.time) + '</span>' : '') + '<span>·</span><span>' + escapeHTML(post.read || "4 MIN READ") + '</span></div>' +
      shareButtons(post) +
      '<p>' + escapeHTML(excerpt) + '</p>' +
      '<button class="home-read-button" type="button" data-open-post="' + index + '">Read Full Article <span>→</span></button></div>';
  }
  function renderHomeCategory() {
    const items = Object.keys(categoryNames).filter(key => key !== "home").map(category => {
      const post = sortedByDate(posts.filter(item => item.category === category))[0];
      return post ? {category,post} : null;
    }).filter(Boolean);
    if (!items.length) {
      homeCategorySpotlight.innerHTML = '<div class="home-category-empty">Category stories will appear here.</div>';
      homeCategoryDots.innerHTML = "";
      return;
    }
    homeCategoryIndex = homeCategoryIndex % items.length;
    const item = items[homeCategoryIndex];
    const postIndex = posts.indexOf(item.post);
    homeCategorySpotlight.innerHTML =
      '<button class="home-category-card" type="button" data-open-post="' + postIndex + '">' +
        '<span class="home-category-image"><img src="' + imageForPost(item.post) + '" alt="" loading="lazy"></span>' +
        '<span class="home-category-label">' + escapeHTML(categoryNames[item.category]) + ' · LATEST</span>' +
        '<strong>' + escapeHTML(item.post.title) + '</strong>' +
        '<span class="home-category-date">' + escapeHTML(item.post.date) + '</span>' +
      '</button>';
    homeCategoryDots.innerHTML = items.map((entry,index) =>
      '<button type="button" class="' + (index === homeCategoryIndex ? "active" : "") + '" data-category-slide="' + index + '" aria-label="Show ' + escapeHTML(categoryNames[entry.category]) + '"></button>'
    ).join("");
  }
  function openArticleDetail(post) {
    if (!post) return;
    const paragraphs = (post.body || []).map(line => "<p>" + escapeHTML(line) + "</p>").join("");
    articleDialogContent.innerHTML =
      '<div class="article-detail-meta">' + escapeHTML(categoryNames[post.category] || "Everyday Atlas") + ' · ' + escapeHTML(post.date) + (post.time ? ' · ' + escapeHTML(post.time) : '') + '</div>' +
      '<h1 id="articleDialogTitle">' + escapeHTML(post.title) + '</h1>' +
      '<img class="article-detail-image" src="' + imageForPost(post) + '" alt="' + escapeHTML(post.title) + '">' +
      shareButtons(post) + '<div class="article-detail-body">' + paragraphs + '</div>';
    if (typeof articleDialog.showModal === "function") articleDialog.showModal();
    else articleDialog.setAttribute("open","");
  }
  function render() {
    const isHomeLanding = activeCategory === "home" && !searchTerm && !showHomeFeed;
    homeSection.hidden = !isHomeLanding;
    articleSection.hidden = isHomeLanding;
    const categoryPosts = posts
      .filter(post => (activeCategory === "home" || post.category === activeCategory) && post.postType === activePostType)
      .filter(post => !searchTerm || (post.title + " " + post.body.join(" ")).toLowerCase().includes(searchTerm));
    const totalPages = Math.max(1, Math.ceil(categoryPosts.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visiblePosts = categoryPosts.slice(start, start + pageSize);
    const t = languageCopy[activeLanguage];
    $("#activeCategoryTitle").textContent = t.categories[activeCategory] || "Home";
    $("#feedDescription").textContent = searchTerm
      ? "Search results in " + (t.categories[activeCategory] || "this category") + "."
      : t.description;

    if (isHomeLanding) {
      renderHomeFeatured();
      renderHomeList();
      renderHomeCategory();
      return;
    }
    if (!visiblePosts.length) {
      articleList.innerHTML = '<div class="empty-state">' + escapeHTML(t.empty) + '</div>';
    } else {
      articleList.innerHTML = visiblePosts.map((post,index) => {
        const body = post.body.map(line => "<p>" + escapeHTML(line) + "</p>").join("");
        const card = '<article class="post-card"><div class="post-topline"><span class="post-category">' + escapeHTML((categoryNames[post.category] || "").toUpperCase()) + '</span><time class="post-date">' + escapeHTML(post.date) + '</time></div><h3>' + escapeHTML(post.title) + '</h3><div class="post-body">' + body + '</div><div class="post-readtime">' + escapeHTML(post.read) + ' · EVERYDAY ATLAS</div></article>';
        return card + (index === 0 && visiblePosts.length > 1 ? '<div class="inline-ad" aria-label="Advertisement placement"><strong>ADVERTISEMENT</strong><span>In-article ad space</span></div>' : "");
      }).join("");
    }
    $("#pageStatus").textContent = t.page + " " + currentPage + " " + t.of + " " + totalPages;
    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
  }

  $$(".home-rail-tab").forEach(button => button.addEventListener("click", () => {
    homeListType = button.dataset.homeList;
    homeListIndex = 0;
    renderHomeList();
  }));
  $("#homeViewAll").addEventListener("click", () => {
    activeCategory = "home";
    activePostType = homeListType === "popular" ? "popular" : "latest";
    showHomeFeed = true;
    currentPage = 1;
    $(".post-type-option").forEach(option => {
      const selected = option.dataset.postType === activePostType;
      option.classList.toggle("active", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    render();
    $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
  });
  $("#homeCategoryPrev").addEventListener("click", () => {
    const total = $$("#homeCategoryDots button").length;
    if (!total) return;
    homeCategoryIndex = (homeCategoryIndex - 1 + total) % total;
    renderHomeCategory();
  });
  $("#homeCategoryNext").addEventListener("click", () => {
    const total = $$("#homeCategoryDots button").length;
    if (!total) return;
    homeCategoryIndex = (homeCategoryIndex + 1) % total;
    renderHomeCategory();
  });
  homeCategoryDots.addEventListener("click", event => {
    const dot = event.target.closest("[data-category-slide]");
    if (!dot) return;
    homeCategoryIndex = Number(dot.dataset.categorySlide) || 0;
    renderHomeCategory();
  });
  document.addEventListener("click", event => {
    const openButton = event.target.closest("[data-open-post]");
    if (openButton) {
      const post = posts[Number(openButton.dataset.openPost)];
      if (post) openArticleDetail(post);
    }
    const shareButton = event.target.closest("[data-share]");
    if (shareButton) {
      const post = posts[Number(shareButton.dataset.postIndex)];
      if (!post) return;
      const url = articleShareUrl(post);
      const text = encodeURIComponent(post.title + " — Everyday Atlas");
      const target = shareButton.dataset.share;
      if (target === "facebook") window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),"_blank","noopener,noreferrer");
      else if (target === "x") window.open("https://twitter.com/intent/tweet?text=" + text + "&url=" + encodeURIComponent(url),"_blank","noopener,noreferrer");
      else if (target === "whatsapp") window.open("https://wa.me/?text=" + text + "%20" + encodeURIComponent(url),"_blank","noopener,noreferrer");
      else if (target === "copy" && navigator.clipboard) navigator.clipboard.writeText(url).then(() => { shareButton.classList.add("copied"); shareButton.setAttribute("aria-label","Link copied"); }).catch(() => {});
    }
  });
  $("#articleDialogClose").addEventListener("click", () => articleDialog.close());
  articleDialog.addEventListener("click", event => {
    if (event.target === articleDialog) articleDialog.close();
  });
  
  /* =========================================================
     09. CATEGORY NAVIGATION
     Purpose: Change category and reset the post-type filter.
     Section complete.
  ========================================================= */
  Array.from(document.querySelectorAll(".category-tab, .sidebar-category")).forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      showHomeFeed = false;
      activePostType = "latest";
      Array.from(document.querySelectorAll(".post-type-option")).forEach(option => { const selected = option.dataset.postType === activePostType; option.classList.toggle("active", selected); option.setAttribute("aria-pressed", String(selected)); });
      currentPage = 1;
      searchTerm = "";
      const searchInput = $("#siteSearch");
      if (searchInput) searchInput.value = "";
      Array.from(document.querySelectorAll(".category-tab, .sidebar-category")).forEach(card => {
        const selected = card.dataset.category === activeCategory;
        card.classList.toggle("active", selected);
        card.setAttribute("aria-pressed", String(selected));
      });
      const menu = $("#mainNav");
      const toggle = $("#menuToggle");
      if (menu) menu.classList.remove("open");
      document.body.classList.remove("menu-open");
      if (toggle) { toggle.setAttribute("aria-expanded","false"); toggle.setAttribute("aria-label","Open categories"); }
      render();
      // Keep the reader at the exact same scroll position when switching categories.
    });
  });

  /* =========================================================
     10. LATEST / POPULAR / MOST VIEWED SWITCHER
     Purpose: Filter the current category by the selected post type.
     Section complete.
  ========================================================= */
  Array.from(document.querySelectorAll(".post-type-option")).forEach(button => {
    button.addEventListener("click", () => {
      activePostType = button.dataset.postType;
      currentPage = 1;
      Array.from(document.querySelectorAll(".post-type-option")).forEach(option => { const selected = option === button; option.classList.toggle("active", selected); option.setAttribute("aria-pressed", String(selected)); });
      render();
    });
  });

  /* =========================================================
     11. MOBILE MENU
     Purpose: Open/close the mobile category menu and dismiss it
     when the user taps outside the menu or presses Escape.
     Section complete.
  ========================================================= */
  const menu = $("#mainNav");
  const menuToggle = $("#menuToggle");
  const menuClose = $("#menuClose");
  const closeCategoryMenu = () => {
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open categories");
  };
  menuToggle.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close categories" : "Open categories");
  });
  menuClose.addEventListener("click", closeCategoryMenu);
  document.addEventListener("click", event => {
    if (menu.classList.contains("open") && !menu.contains(event.target) && !menuToggle.contains(event.target)) {
      closeCategoryMenu();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCategoryMenu();
  });

  /* =========================================================
     12. ARTICLE PAGINATION
     Purpose: Move between pages of articles in the active filter.
     Section complete.
  ========================================================= */
  previousButton.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; render(); $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"}); }
  });
  nextButton.addEventListener("click", () => {
    currentPage++;
    render();
    $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
  });

  /* =========================================================
     13. ARTICLE SEARCH
     Purpose: Search article titles and body text in the active view.
     Section complete.
  ========================================================= */
  const searchForm = $("#searchForm");
  const searchToggle = $("#searchToggle");
  const searchInput = $("#siteSearch");
  searchToggle.addEventListener("click", () => {
    searchForm.classList.add("search-open");
    searchToggle.setAttribute("aria-expanded", "true");
    searchInput.focus();
  });
  document.addEventListener("click", event => {
    if (searchForm.classList.contains("search-open") && !searchForm.contains(event.target)) {
      searchForm.classList.remove("search-open");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && searchForm.classList.contains("search-open")) {
      searchForm.classList.remove("search-open");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });
  $("#searchForm").addEventListener("submit", event => {
    event.preventDefault();
    searchTerm = ($("#siteSearch").value || "").trim().toLowerCase();
    showHomeFeed = true;
    currentPage = 1;
    render();
    $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
    searchForm.classList.remove("search-open");
    searchToggle.setAttribute("aria-expanded", "false");
  });

  /* =========================================================
     14. LANGUAGE PREFERENCE
     Purpose: Save and restore the visitor's selected interface language.
     Section complete.
  ========================================================= */
  $("#languageSelect").addEventListener("change", event => {
    try { localStorage.setItem("ea-language", event.target.value); } catch (_) {}
    applyLanguage(event.target.value);
  });
  try {
    const savedLanguage = localStorage.getItem("ea-language");
    if (savedLanguage && $("#languageSelect").querySelector('option[value="' + savedLanguage + '"]')) $("#languageSelect").value = savedLanguage;
  } catch (_) {}

  /* =========================================================
     15. PAGE INITIALIZATION
     Purpose: Set the footer year and render the initial language/feed.
     Section complete.
  ========================================================= */
  $("#year").textContent = new Date().getFullYear();
  applyLanguage($("#languageSelect").value || "en");
  const requestedArticle = new URLSearchParams(window.location.search).get("article");
  if (requestedArticle) {
    const requestedPost = posts.find(post => articleSlug(post) === requestedArticle);
    if (requestedPost) openArticleDetail(requestedPost);
  }
  homeCategoryTimer = window.setInterval(() => {
    if (activeCategory === "home" && !showHomeFeed && !document.hidden) {
      const total = $("#homeCategoryDots button").length;
      if (total > 1) { homeCategoryIndex = (homeCategoryIndex + 1) % total; renderHomeCategory(); }
    }
  }, 5000);

  /* =========================================================
     16. FOOTER POLICY MODAL
     Purpose: Open, navigate and close the site's information panel.
     Section complete.
  ========================================================= */
  const policyOverlay = $("#policyOverlay");
  const policyClose = $("#policyClose");
  let previousPolicyFocus = null;
  function closePolicyModal() {
    if (!policyOverlay) return;
    policyOverlay.classList.remove("open");
    policyOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("policy-open");
    if (previousPolicyFocus) previousPolicyFocus.focus();
  }
  Array.from(document.querySelectorAll("[data-policy]")).forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const targetId = link.dataset.policy;
      const target = document.getElementById(targetId);
      previousPolicyFocus = link;
      policyOverlay.classList.add("open");
      policyOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("policy-open");
      if (target) target.scrollIntoView({behavior:"auto", block:"start"});
      policyClose.focus();
    });
  });
  if (policyClose) policyClose.addEventListener("click", closePolicyModal);
  if (policyOverlay) policyOverlay.addEventListener("click", event => {
    if (event.target === policyOverlay) closePolicyModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && policyOverlay && policyOverlay.classList.contains("open")) closePolicyModal();
  });
})();
