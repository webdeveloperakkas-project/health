(() => {
  /* =========================================================
     01. DOM HELPERS
     Purpose: Shortcuts for selecting one or many HTML elements.
     Section complete.
  ========================================================= */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  /* Apply the scrolling headline saved from the local CMS. */
  const TICKER_STORAGE_KEY = "everyday-atlas-homepage-ticker-v1";
  const DEFAULT_TICKER_LINES = ["আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।","চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি।","ও মা, ফাগুনে তোর আমের বনে ঘ্রাণে পাগল করে","মরি হায়, হায় রে","ও মা, অঘ্রাণে তোর ভরা ক্ষেতে কী দেখেছি মধুর হাসি"];
  function renderHomepageTicker() {
    const track = $(".ticker-track");
    if (!track) return;
    let lines = DEFAULT_TICKER_LINES;
    try {
      const saved = JSON.parse(localStorage.getItem(TICKER_STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.some(line => String(line).trim())) lines = saved.map(line => String(line).trim()).filter(Boolean);
    } catch (_) {}
    const repeated = [...lines, ...lines];
    track.innerHTML = repeated.map(line => "<span>" + String(line).replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char])) + "</span>").join("");
  }
  renderHomepageTicker();
  /* =========================================================
     02. ARTICLE DATA
     Purpose: Temporary sample articles shown on the public site.
     The future control panel will replace this local sample data.
     Section complete.
  ========================================================= */
  let posts = [
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
  // Published CMS entries from this browser's local preview storage.
  // The production database connection will replace this local-only bridge.
  try {
    const cmsPosts = JSON.parse(localStorage.getItem("everyday-atlas-cms-posts-v1") || "[]");
    if (Array.isArray(cmsPosts)) {
      const publicCmsPosts = cmsPosts.filter(item => item && item.status === "published").map(item => {
        const plain = String(item.content || "").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
        const dateValue = item.publishedAt || item.createdAt || item.updatedAt || new Date().toISOString();
        return {cmsId:item.id,category:item.category,subcategory:item.subcategory||"",title:item.title,postType:item.postType || "latest",postTypes:Array.isArray(item.postTypes)?item.postTypes:(item.postType?[item.postType]:["latest"]),featuredStories:!!(item.featuredStories ?? item.featured),publishedTimestamp:new Date(dateValue).getTime(),date:new Date(dateValue).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),read:"",excerpt:item.excerpt || plain.slice(0,260),body:plain ? [plain] : [],contentHtml:item.content || "",cover:item.cover || "",videoUrl:item.videoUrl || "",views:Number(item.views)||0};
      });
      posts = posts.filter(item => !item.cmsId).concat(publicCmsPosts, posts.filter(item => item.cmsId));
    }
  } catch(error) { /* Keep the built-in sample stories available. */ }

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
  const extendedUiCopy = {
    en:{featuredStories:"Featured Stories",featuredDescription:"A collection of editor-selected stories and in-depth reviews.",featuredMore:"Read More Featured Stories",explore:"EXPLORE CATEGORIES",latest:"Latest",popular:"Popular",more:"More Details",emptyLatest:"New stories will appear here as they are published.",emptyPopular:"Popular stories will appear here soon.",main:"MAIN HOME PAGE",read:"Read Full Article",categoryHighlights:"Category Highlights",explore:"EXPLORE",ad:"ADVERTISEMENT",adSense:"AdSense",adResponsive:"Responsive advertisement placement",stories:"LATEST STORIES",previous:"Previous",next:"Next",categories:"Categories",about:"About Us",contact:"Contact",privacy:"Privacy Policy",editorial:"Editorial Policy",terms:"Terms of Use",disclaimer:"Disclaimer",cookies:"Cookie Policy"},
    bn:{featuredStories:"ফিচার্ড পোস্ট",featuredDescription:"সম্পাদক বা অ্যাডমিনের নির্বাচিত গুরুত্বপূর্ণ পোস্ট ও বিস্তারিত রিভিউ।",featuredMore:"আরও বিস্তারিত পড়ুন",explore:"ক্যাটাগরি দেখুন",latest:"সর্বশেষ",popular:"জনপ্রিয়",more:"আরও বিস্তারিত",emptyLatest:"নতুন পোস্ট প্রকাশিত হলে এখানে দেখা যাবে।",emptyPopular:"জনপ্রিয় পোস্ট শিগগিরই এখানে দেখা যাবে।",main:"মূল হোমপেজ",read:"সম্পূর্ণ লেখা পড়ুন",categoryHighlights:"ক্যাটাগরির বিশেষ পোস্ট",ad:"বিজ্ঞাপন",adSense:"বিজ্ঞাপন",adResponsive:"রেসপনসিভ বিজ্ঞাপনের স্থান",stories:"সর্বশেষ পোস্ট",previous:"পূর্ববর্তী",next:"পরবর্তী",categories:"ক্যাটাগরি",about:"আমাদের সম্পর্কে",contact:"যোগাযোগ",privacy:"গোপনীয়তা নীতি",editorial:"সম্পাদনা নীতি",terms:"ব্যবহারের শর্ত",disclaimer:"দায়মুক্তি",cookies:"কুকি নীতি"},
    hi:{featuredStories:"विशेष लेख",featuredDescription:"संपादक द्वारा चुने गए महत्वपूर्ण लेख और विस्तृत समीक्षाएँ।",featuredMore:"और विशेष लेख पढ़ें",explore:"श्रेणियाँ देखें",latest:"नवीनतम",popular:"लोकप्रिय",more:"और अधिक जानें",emptyLatest:"नई पोस्ट प्रकाशित होने पर यहाँ दिखाई देंगी।",emptyPopular:"लोकप्रिय पोस्ट जल्द ही यहाँ दिखाई देंगी।",main:"मुख्य होम पेज",read:"पूरा लेख पढ़ें",categoryHighlights:"श्रेणी की खास पोस्ट",ad:"विज्ञापन",adSense:"विज्ञापन",adResponsive:"रिस्पॉन्सिव विज्ञापन स्थान",stories:"नवीनतम पोस्ट",previous:"पिछला",next:"अगला",categories:"श्रेणियाँ",about:"हमारे बारे में",contact:"संपर्क",privacy:"गोपनीयता नीति",editorial:"संपादकीय नीति",terms:"उपयोग की शर्तें",disclaimer:"अस्वीकरण",cookies:"कुकी नीति"},
    de:{featuredStories:"Ausgewählte Beiträge",featuredDescription:"Wichtige redaktionell ausgewählte Beiträge und ausführliche Rezensionen.",featuredMore:"Weitere ausgewählte Beiträge lesen",explore:"KATEGORIEN ENTDECKEN",latest:"Neueste",popular:"Beliebt",more:"Mehr erfahren",emptyLatest:"Neue Beiträge erscheinen hier nach der Veröffentlichung.",emptyPopular:"Beliebte Beiträge erscheinen bald hier.",main:"STARTSEITE",read:"Ganzen Artikel lesen",categoryHighlights:"Kategorie-Highlights",ad:"WERBUNG",adSense:"Werbung",adResponsive:"Responsiver Anzeigenplatz",stories:"NEUESTE BEITRÄGE",previous:"Zurück",next:"Weiter",categories:"Kategorien",about:"Über uns",contact:"Kontakt",privacy:"Datenschutz",editorial:"Redaktionsrichtlinie",terms:"Nutzungsbedingungen",disclaimer:"Haftungsausschluss",cookies:"Cookie-Richtlinie"},
    fr:{explore:"DÉCOUVRIR LES CATÉGORIES",latest:"Récent",popular:"Populaire",more:"Voir plus",emptyLatest:"Les nouveaux articles apparaîtront ici après publication.",emptyPopular:"Les articles populaires apparaîtront bientôt ici.",main:"PAGE D’ACCUEIL",read:"Lire l’article complet",categoryHighlights:"À découvrir par catégorie",ad:"PUBLICITÉ",adSense:"Publicité",adResponsive:"Espace publicitaire adaptatif",stories:"DERNIERS ARTICLES",previous:"Précédent",next:"Suivant",categories:"Catégories",about:"À propos",contact:"Contact",privacy:"Confidentialité",editorial:"Ligne éditoriale",terms:"Conditions d’utilisation",disclaimer:"Avertissement",cookies:"Politique relative aux cookies"},
    es:{featuredStories:"Artículos destacados",featuredDescription:"Artículos importantes y reseñas detalladas seleccionados por el equipo editorial.",featuredMore:"Leer más artículos destacados",explore:"EXPLORAR CATEGORÍAS",latest:"Recientes",popular:"Popular",more:"Ver más",emptyLatest:"Las nuevas publicaciones aparecerán aquí al publicarse.",emptyPopular:"Las publicaciones populares aparecerán pronto aquí.",main:"PÁGINA PRINCIPAL",read:"Leer artículo completo",categoryHighlights:"Destacados por categoría",ad:"PUBLICIDAD",adSense:"Publicidad",adResponsive:"Espacio publicitario adaptable",stories:"ARTÍCULOS RECIENTES",previous:"Anterior",next:"Siguiente",categories:"Categorías",about:"Acerca de",contact:"Contacto",privacy:"Privacidad",editorial:"Política editorial",terms:"Términos de uso",disclaimer:"Aviso legal",cookies:"Política de cookies"}
  };
  /* =========================================================
     05. LANGUAGE SWITCHING
     Purpose: Apply the selected language to interface controls.
     Section complete.
  ========================================================= */
  let activeLanguage = "en";
  const dateLocales = {en:"en-US",bn:"bn-BD",hi:"hi-IN",de:"de-DE",fr:"fr-FR",es:"es-ES"};
  function updateHeaderClock() {
    const now = new Date();
    const locale = dateLocales[activeLanguage] || "en-US";
    const dateText = new Intl.DateTimeFormat(locale,{weekday:"short",month:"short",day:"numeric",year:"numeric"}).format(now);
    const timeText = new Intl.DateTimeFormat(locale,{hour:"numeric",minute:"2-digit"}).format(now);
    ["headerDateDesktop","headerDateMobile"].forEach(id => { const el = $("#"+id); if (el) el.textContent = dateText; });
    ["headerTimeDesktop","headerTimeMobile"].forEach(id => { const el = $("#"+id); if (el) el.textContent = timeText; });
  }
  function applyLanguage(language) {
    activeLanguage = languageCopy[language] ? language : "en";
    const t = languageCopy[activeLanguage];
    const ui = extendedUiCopy[activeLanguage] || extendedUiCopy.en;
    document.documentElement.lang = activeLanguage;
    updateHeaderClock();
    document.querySelectorAll(".home-rail-tab[data-home-list]").forEach(button => { button.textContent = ui[button.dataset.homeList] || button.textContent; });
    const menuHeading = document.querySelector(".menu-heading"); if (menuHeading) menuHeading.textContent = ui.explore;
    const menuAbout = document.querySelector('.main-nav > a[href="#about"]'); if (menuAbout) menuAbout.textContent = ui.about;
    document.querySelectorAll(".home-ad-label,.top-ad > span").forEach(el => el.textContent = ui.ad);
    const homeAdStrong = document.querySelector(".home-ad-slot strong"); if (homeAdStrong) homeAdStrong.textContent = ui.adSense;
    document.querySelectorAll(".home-ad-slot small,.top-ad small").forEach(el => el.textContent = ui.adResponsive);
    const feedEyebrow = document.querySelector("#articleFeed .feed-heading .eyebrow"); if (feedEyebrow) feedEyebrow.textContent = ui.stories;
    const prev = document.querySelector("#previousPage"); if (prev) prev.textContent = ui.previous;
    const next = document.querySelector("#nextPage"); if (next) next.textContent = ui.next;
    const footerLabels = document.querySelectorAll(".footer-links a");
    const footerText = [ui.categories,ui.about,ui.contact,ui.privacy,ui.editorial,ui.terms,ui.disclaimer,ui.cookies];
    footerLabels.forEach((link,index) => { if (footerText[index]) link.textContent = footerText[index]; });
    const aboutHeading = document.querySelector("#about h2");
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
    if (aboutHeading) aboutHeading.textContent = t.aboutTitle;
    const aboutParagraph = document.querySelector("#about p"); if (aboutParagraph) aboutParagraph.textContent = t.aboutText;
    render();
  }
  /* =========================================================
     06. PAGE STATE
     Purpose: Remember selected category, post type, search and page.
     Section complete.
  ========================================================= */
  let activeCategory = "home";
  let activeSportsSubcategory = "";
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
  let showFeaturedFeed = false;
  let homeListType = "latest";
  let homeListIndex = 0;
  let homeListTimer = null;

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
  const articleDialog = $("#articleDialog");
  const articleDialogContent = $("#articleDialogContent");

  function imageForPost(post) {
    return post.cover || categoryImages[post.category] || categoryImages.lifestyle;
  }
  function sortedByDate(items) {
    return [...items].sort((a,b) => {
      const aDate = Number(a.publishedTimestamp) || new Date(a.date).getTime() || 0;
      const bDate = Number(b.publishedTimestamp) || new Date(b.date).getTime() || 0;
      return bDate - aDate;
    });
  }
  function latestPostPerCategory(items) {
    const seen = new Set();
    return sortedByDate(items).filter(post => {
      if (!post.category || seen.has(post.category)) return false;
      seen.add(post.category);
      return true;
    });
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
    const featured = sortedByDate(posts.filter(post => (post.postTypes || [post.postType || "latest"]).includes("latest")))[0] || posts[0];
    const latestItems = sortedByDate(posts.filter(post => (post.postTypes || [post.postType || "latest"]).includes("latest"))).slice(0,10);
    const popularItems = [...posts].filter(post => (post.postTypes || [post.postType || "latest"]).includes("popular"))
      .sort((a,b) => (Number(b.views)||0) - (Number(a.views)||0) || new Date(b.date) - new Date(a.date)).slice(0,10);
    const items = homeListType === "popular" ? popularItems : latestItems;
    if (!items.length) {
      homeListPanel.innerHTML = '<div class="home-list-empty">' + (extendedUiCopy[activeLanguage] || extendedUiCopy.en)[homeListType === "popular" ? "emptyPopular" : "emptyLatest"] + '</div>';
    } else {
      homeListPanel.innerHTML = items.map(post =>
        '<button class="home-list-item" type="button" data-open-post="' + posts.indexOf(post) + '">' +
          '<span class="home-list-thumb"><img src="' + imageForPost(post) + '" alt="" loading="lazy"></span>' +
          '<span class="home-list-copy"><span class="home-list-category">' + escapeHTML(categoryNames[post.category] || "Everyday Atlas") + '</span><strong>' + escapeHTML(post.title) + '</strong><time>' + escapeHTML(post.date) + (post.time ? " · " + escapeHTML(post.time) : "") + '</time></span>' +
        '</button>'
      ).join("");
    }
    $$(".home-rail-tab").forEach(button => {
      const selected = button.dataset.homeList === homeListType;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    const viewAll = $("#homeViewAll");
    if (viewAll) viewAll.innerHTML = (extendedUiCopy[activeLanguage] || extendedUiCopy.en).more + ' <span>→</span>';
  }
  let homeFeaturedIndex = 0;
  function renderHomeFeatured() {
    const stories = latestPostPerCategory(posts.filter(post => !(post.postTypes || [post.postType || "latest"]).includes("myChoice") || (post.postTypes || []).some(type => type === "latest" || type === "popular")));
    if (!stories.length) {
      homeFeatured.innerHTML = '<div class="home-feature-empty">Your latest published story will appear here.</div>';
      return;
    }
    homeFeaturedIndex = ((homeFeaturedIndex % stories.length) + stories.length) % stories.length;
    const post = stories[homeFeaturedIndex];
    const excerpt = (post.excerpt || (post.body || []).slice(0,2).join(" ")).slice(0,260);
    const index = posts.indexOf(post);
    const labels = extendedUiCopy[activeLanguage] || extendedUiCopy.en;
    homeFeatured.innerHTML =
      '<div class="home-feature-slide"><div class="home-feature-image"><img src="' + imageForPost(post) + '" alt="' + escapeHTML(post.title) + '" data-open-post="' + index + '" role="button" tabindex="0" aria-label="Open article: ' + escapeHTML(post.title) + '" fetchpriority="high"><span class="home-feature-tag">' + labels.main + '</span></div>' +
      '<div class="home-feature-content"><span class="home-feature-category">' + escapeHTML(categoryNames[post.category] || "FEATURED STORY") + (post.subcategory ? " · " + escapeHTML(post.subcategory) : "") + '</span>' +
      '<h1 data-open-post="' + index + '" role="button" tabindex="0" aria-label="Open article: ' + escapeHTML(post.title) + '">' + escapeHTML(post.title) + '</h1>' +
      '<div class="home-feature-meta"><time>' + escapeHTML(post.date) + '</time>' + (post.time ? '<span>·</span><span>' + escapeHTML(post.time) + '</span>' : '') + '<span>·</span><span>' + escapeHTML(post.read || "4 MIN READ") + '</span></div>' +
      shareButtons(post) +
      '<div class="home-feature-summary-row"><p>' + escapeHTML(excerpt) + '</p>' +
      '<button class="home-read-button" type="button" data-open-post="' + index + '">' + labels.read + ' <span>→</span></button></div></div></div>' +
      '<div class="home-feature-navigation" aria-label="Main story navigation">' +
      '<button type="button" class="home-feature-arrow" data-home-feature="previous" aria-label="Previous story">' + labels.previous + '</button>' +
      '<div class="home-feature-pagination" aria-label="Choose a story">' + stories.map((story,i) => '<button type="button" class="home-feature-dot' + (i === homeFeaturedIndex ? ' active' : '') + '" data-home-feature-index="' + i + '" aria-label="Go to story ' + (i+1) + '" aria-current="' + (i === homeFeaturedIndex ? 'true' : 'false') + '"></button>').join("") + '</div>' +
      '<button type="button" class="home-feature-arrow" data-home-feature="next" aria-label="Next story">' + labels.next + '</button></div>';
  }
  function renderMyChoice() {
    const section = $("#myChoiceSection"), host = $("#myChoiceList");
    if (!section || !host) return;
    const items = sortedByDate(posts.filter(post => (post.postTypes || [post.postType || "latest"]).includes("myChoice"))).slice(0,4);
    const demos = [
      {title:"What Happens When You Eat Apples?",summary:"Apples provide fibre and vitamin C. They make a handy snack as part of a balanced diet.",fruit:"🍎",bg:"#fbe8e6"},
      {title:"Are Grapes Good for You?",summary:"Grapes contain water and helpful plant compounds. Enjoy them as part of a varied diet.",fruit:"🍇",bg:"#eee8fa"},
      {title:"Why Add Pomegranate to Your Diet?",summary:"Pomegranate offers fibre and plant compounds. Its juicy seeds add colour and flavour to meals.",fruit:"🔴",bg:"#f9e6eb"},
      {title:"What Makes Bananas a Popular Snack?",summary:"Bananas provide potassium, vitamin B6 and carbohydrates. They are an easy snack on busy days.",fruit:"🍌",bg:"#fff4d8"}
    ];
    const demoImage = item => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" rx="14" fill="' + item.bg + '"/><circle cx="160" cy="83" r="59" fill="#fff" opacity=".55"/><text x="160" y="110" text-anchor="middle" font-size="82">' + item.fruit + '</text><text x="160" y="164" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="#43545a">EVERYDAY ATLAS</text></svg>';
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    };
    section.hidden = false;
    host.innerHTML = items.length ? items.map(post => {
      const index = posts.indexOf(post), summary = post.excerpt || (post.body || []).join(" ").slice(0,120);
      return '<article class="my-choice-item"><button class="my-choice-open" type="button" data-open-post="' + index + '"><span class="my-choice-thumb"><img src="' + imageForPost(post) + '" alt="" loading="lazy"></span><span class="my-choice-copy"><strong>' + escapeHTML(post.title) + '</strong>' + (summary ? '<small>' + escapeHTML(summary.slice(0,120)) + '</small>' : '') + '</span></button></article>';
    }).join("") : demos.map(item => '<article class="my-choice-item favorites-demo"><div class="my-choice-open"><span class="my-choice-thumb"><img src="' + demoImage(item) + '" alt="' + escapeHTML(item.title) + '" loading="lazy"></span><span class="my-choice-copy"><strong>' + escapeHTML(item.title) + '</strong><small>' + escapeHTML(item.summary) + '</small></span></div></article>').join("");
  }
  function renderFeaturedStories() {
    const section = $("#featuredStoriesSection");
    const left = $("#featuredStoriesLeft");
    const right = $("#featuredStoriesRight");
    const count = $("#featuredStoriesCount");
    if (!section || !left || !right) return;
    const items = posts.filter(post => post.featuredStories ?? post.featured).slice(0,20);
    if (count) count.textContent = items.length + " / 20";
    const renderItem = post => '<button class="featured-story-item" type="button" data-open-post="' + posts.indexOf(post) + '">' +
      '<span class="featured-story-thumb"><img src="' + imageForPost(post) + '" alt="" loading="lazy"></span>' +
      '<span class="featured-story-copy"><span class="featured-story-category">' + escapeHTML(categoryNames[post.category] || "Everyday Atlas") + '</span><strong>' + escapeHTML(post.title) + '</strong><time>' + escapeHTML(post.date) + '</time></span></button>';
    left.innerHTML = items.length ? items.slice(0,10).map(renderItem).join("") : '<div class="featured-story-empty">No featured stories yet. Select “Featured Stories / Editor’s Choice” when publishing an article.</div>';
    right.innerHTML = items.slice(10,20).map(renderItem).join("");
    const viewAll = $("#featuredStoriesViewAll");
    if (viewAll) viewAll.innerHTML = (extendedUiCopy[activeLanguage] || extendedUiCopy.en).featuredMore + ' <span>→</span>';
  }
  function openArticleDetail(post) {
    if (!post) return;
    const paragraphs = post.contentHtml || (post.body || []).map(line => "<p>" + escapeHTML(line) + "</p>").join("");
    articleDialogContent.innerHTML =
      '<div class="article-detail-meta">' + escapeHTML(categoryNames[post.category] || "Everyday Atlas") + (post.subcategory ? " · " + escapeHTML(post.subcategory) : "") + ' · ' + escapeHTML(post.date) + (post.time ? ' · ' + escapeHTML(post.time) : '') + '</div>' +
      '<h1 id="articleDialogTitle">' + escapeHTML(post.title) + '</h1>' +
      '<img class="article-detail-image" src="' + imageForPost(post) + '" alt="' + escapeHTML(post.title) + '">' +
      shareButtons(post) + '<div class="article-detail-body">' + paragraphs + '</div>' + (Array.isArray(post.keywords) && post.keywords.length ? '<div class="article-keywords" aria-label="Article topics">' + post.keywords.slice(0,12).map(word => '<span>#' + escapeHTML(String(word).replace(/\s+/g,'')) + '</span>').join('') + '</div>' : '');
    if (typeof articleDialog.showModal === "function") articleDialog.showModal();
    else articleDialog.setAttribute("open","");
  }
  function render() {
    const isHomeLanding = activeCategory === "home" && !searchTerm && !showHomeFeed;
    homeSection.hidden = !isHomeLanding;
    articleSection.hidden = isHomeLanding;
    const categoryPosts = posts
      .filter(post => showFeaturedFeed ? !!(post.featuredStories ?? post.featured) : (activeCategory === "home" || post.category === activeCategory) && (post.postTypes || [post.postType || "latest"]).includes(activePostType) && (activeCategory !== "sports" || !activeSportsSubcategory || post.subcategory === activeSportsSubcategory))
      .filter(post => !searchTerm || (post.title + " " + (post.body || []).join(" ") + " " + (post.excerpt || "") + " " + (post.keywords || []).join(" ")).toLowerCase().includes(searchTerm));
    const totalPages = Math.max(1, Math.ceil(categoryPosts.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visiblePosts = categoryPosts.slice(start, start + pageSize);
    const t = languageCopy[activeLanguage];
    $("#activeCategoryTitle").textContent = showFeaturedFeed ? (extendedUiCopy[activeLanguage] || extendedUiCopy.en).featuredStories : (t.categories[activeCategory] || "Home");
    $("#feedDescription").textContent = searchTerm
      ? "Search results in " + (t.categories[activeCategory] || "this category") + "."
       : (showFeaturedFeed ? (extendedUiCopy[activeLanguage] || extendedUiCopy.en).featuredDescription : t.description);

    if (isHomeLanding) {
      renderHomeFeatured();
      renderHomeList();
      renderFeaturedStories();
      renderMyChoice();
      return;
    }
    if (!visiblePosts.length) {
      articleList.innerHTML = '<div class="empty-state">' + escapeHTML(t.empty) + '</div>';
    } else {
      articleList.innerHTML = visiblePosts.map((post,index) => {
        const body = post.contentHtml || (post.body || []).map(line => "<p>" + escapeHTML(line) + "</p>").join("");
        const card = '<article class="post-card"><div class="post-topline"><span class="post-category">' + escapeHTML((categoryNames[post.category] || "").toUpperCase()) + (post.subcategory ? " · " + escapeHTML(post.subcategory.toUpperCase()) : "") + '</span><time class="post-date">' + escapeHTML(post.date) + '</time></div><h3>' + escapeHTML(post.title) + '</h3><div class="post-body">' + body + '</div><div class="post-readtime">' + escapeHTML(post.read) + ' · EVERYDAY ATLAS</div></article>';
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
    showFeaturedFeed = false;
    activeCategory = "home";
    activePostType = homeListType === "popular" ? "popular" : "latest";
    showHomeFeed = true;
    currentPage = 1;
    $$(".post-type-option").forEach(option => {
      const selected = option.dataset.postType === activePostType;
      option.classList.toggle("active", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    render();
    $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
  });
  $("#featuredStoriesViewAll").addEventListener("click", () => {
    activeCategory = "home";
    showHomeFeed = true;
    showFeaturedFeed = true;
    currentPage = 1;
    searchTerm = "";
    $("#siteSearch").value = "";
    render();
    $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
  });
  document.addEventListener("keydown", event => {
    const articleTrigger = event.target.closest('[data-open-post][role="button"]');
    if (articleTrigger && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      const post = posts[Number(articleTrigger.dataset.openPost)];
      if (post) openArticleDetail(post);
    }
  });
  document.addEventListener("click", event => {
    const featureArrow = event.target.closest("[data-home-feature]");
    const featureDot = event.target.closest("[data-home-feature-index]");
    if (featureArrow || featureDot) {
      const storyCount = latestPostPerCategory(posts.filter(post => !(post.postTypes || [post.postType || "latest"]).includes("myChoice") || (post.postTypes || []).some(type => type === "latest" || type === "popular"))).length;
      if (storyCount) {
        if (featureDot) homeFeaturedIndex = Number(featureDot.dataset.homeFeatureIndex) || 0;
        else homeFeaturedIndex = (homeFeaturedIndex + (featureArrow.dataset.homeFeature === "next" ? 1 : -1) + storyCount) % storyCount;
        renderHomeFeatured();
      }
    }
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
  
  const sportsTrigger = document.querySelector(".sports-category-trigger");
  const sportsSubmenu = document.querySelector("#sportsSubmenu");
  if (sportsTrigger && sportsSubmenu) {
    sportsTrigger.addEventListener("click", event => {
      event.stopPropagation();
      const willOpen = sportsSubmenu.hidden;
      sportsSubmenu.hidden = !willOpen;
      sportsTrigger.setAttribute("aria-expanded", String(willOpen));
    });
    sportsSubmenu.addEventListener("click", event => {
      const choice = event.target.closest("[data-sports-subcategory]");
      if (!choice) return;
      activeCategory = "sports";
      activeSportsSubcategory = choice.dataset.sportsSubcategory || "";
      showHomeFeed = false;
      showFeaturedFeed = false;
      activePostType = "latest";
      Array.from(document.querySelectorAll(".post-type-option")).forEach(option => {
        const selected = option.dataset.postType === activePostType;
        option.classList.toggle("active", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      currentPage = 1;
      searchTerm = "";
      const searchInput = $("#siteSearch");
      if (searchInput) searchInput.value = "";
      Array.from(document.querySelectorAll(".category-tab:not(.sports-category-trigger), .sidebar-category")).forEach(card => {
        const selected = card.dataset.category === "sports";
        card.classList.toggle("active", selected);
        card.setAttribute("aria-pressed", String(selected));
      });
      sportsTrigger.classList.add("active");
      sportsSubmenu.querySelectorAll("[data-sports-subcategory]").forEach(item => item.classList.toggle("active", item === choice));
      sportsSubmenu.hidden = true;
      sportsTrigger.setAttribute("aria-expanded", "false");
      render();
    });
    document.addEventListener("click", event => {
      if (!event.target.closest(".sports-category-menu")) {
        sportsSubmenu.hidden = true;
        sportsTrigger.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        sportsSubmenu.hidden = true;
        sportsTrigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* =========================================================
     09. CATEGORY NAVIGATION
     Purpose: Change category and reset the post-type filter.
     Section complete.
  ========================================================= */
  Array.from(document.querySelectorAll(".category-tab:not(.sports-category-trigger), .sidebar-category")).forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      activeSportsSubcategory = "";
      const sportsMenuTrigger = document.querySelector(".sports-category-trigger");
      const sportsMenu = document.querySelector("#sportsSubmenu");
      if (sportsMenuTrigger) sportsMenuTrigger.classList.toggle("active", activeCategory === "sports");
      if (sportsMenuTrigger) sportsMenuTrigger.setAttribute("aria-expanded", "false");
      if (sportsMenu) sportsMenu.hidden = true;
      if (sportsMenu) sportsMenu.querySelectorAll("[data-sports-subcategory]").forEach(item => item.classList.remove("active"));
      showHomeFeed = false;
      showFeaturedFeed = false;
      activePostType = "latest";
      Array.from(document.querySelectorAll(".post-type-option")).forEach(option => { const selected = option.dataset.postType === activePostType; option.classList.toggle("active", selected); option.setAttribute("aria-pressed", String(selected)); });
      currentPage = 1;
      searchTerm = "";
      const searchInput = $("#siteSearch");
      if (searchInput) searchInput.value = "";
      Array.from(document.querySelectorAll(".category-tab:not(.sports-category-trigger), .sidebar-category")).forEach(card => {
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
  updateHeaderClock();
  window.setInterval(updateHeaderClock, 30000);
  applyLanguage($("#languageSelect").value || "en");
  window.setInterval(() => {
    const storyCount = sortedByDate(posts).length;
    if (storyCount > 1 && homeFeatured) {
      homeFeaturedIndex = (homeFeaturedIndex + 1) % storyCount;
      renderHomeFeatured();
    }
  }, 2000);
  const requestedArticle = new URLSearchParams(window.location.search).get("article");
  if (requestedArticle) {
    const requestedPost = posts.find(post => articleSlug(post) === requestedArticle);
    if (requestedPost) openArticleDetail(requestedPost);
  }


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
