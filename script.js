
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
     Published content is loaded only from the shared Supabase CMS.
     No bundled demo or sample posts are displayed.
  ========================================================= */
  let posts = [];
  let trendingPosts = [];
  let publicSupabaseClient = null;
  
  // Published articles are loaded from the shared Supabase database after page initialization.

  /* =========================================================
     03. CATEGORY LABELS
     Purpose: Human-readable names for article categories.
     Section complete.
  ========================================================= */
  const categoryNames = {
    home:"Home",world:"World News",technology:"Science & Technology",biography:"Biography",sports:"Sports",entertainment:"Entertainment",travel:"Travel",finance:"Finance",lifestyle:"Lifestyle"
  };
  /* =========================================================
     04. LANGUAGE CONTENT
     Purpose: Translated interface labels for supported languages.
     Section complete.
  ========================================================= */
  const languageCopy = {
    en:{
      latest:"LATEST",categories:{
        home:"Home",world:"World News",technology:"Science & Technology",biography:"Biography",sports:"Sports",entertainment:"Entertainment",travel:"Travel",finance:"Finance",lifestyle:"Lifestyle"
      },stories:"LATEST STORIES",types:{
        latest:"Latest",popular:"Popular",mostViewed:"Most Viewed"
      },description:"Latest articles and useful information.",search:"Search articles...",sort:"NEWEST FIRST ↓",page:"Page",of:"of",articles:"Articles",empty:"No articles are published in this category yet.",about:"About",contact:"Contact",privacy:"Privacy",aboutTitle:"Clear information for a world of everyday questions.",aboutText:"Our articles are for general information and do not replace professional advice."
    },
    bn:{
      latest:"সর্বশেষ",categories:{
        home:"হোম",world:"বিশ্ব সংবাদ",tips:"দৈনন্দিন টিপস",technology:"বিজ্ঞান ও প্রযুক্তি",biography:"জীবনী",sports:"খেলাধুলা",entertainment:"বিনোদন",travel:"ভ্রমণ",finance:"অর্থনীতি",lifestyle:"জীবনযাপন"
      },stories:"সর্বশেষ লেখা",types:{
        latest:"সর্বশেষ",popular:"জনপ্রিয়",mostViewed:"সর্বাধিক দেখা"
      },description:"সাম্প্রতিক প্রবন্ধ ও দরকারি তথ্য।",search:"প্রবন্ধ খুঁজুন...",sort:"নতুন লেখা আগে ↓",page:"পৃষ্ঠা",of:"এর",articles:"প্রবন্ধ",empty:"এই বিভাগে এখনো কোনো প্রবন্ধ প্রকাশিত হয়নি।",about:"আমাদের সম্পর্কে",contact:"যোগাযোগ",privacy:"গোপনীয়তা",aboutTitle:"প্রতিদিনের নানা প্রশ্নের জন্য সহজ ও নির্ভরযোগ্য তথ্য।",aboutText:"আমাদের প্রবন্ধ সাধারণ তথ্যের জন্য; এগুলো পেশাদার পরামর্শের বিকল্প নয়।"
    },
    hi:{
      latest:"ताज़ा",categories:{
        home:"होम",world:"विश्व समाचार",tips:"दैनिक सुझाव",technology:"विज्ञान और प्रौद्योगिकी",biography:"जीवनी",sports:"खेल",entertainment:"मनोरंजन",travel:"यात्रा",finance:"वित्त",lifestyle:"जीवनशैली"
      },stories:"नवीनतम लेख",types:{
        latest:"नवीनतम",popular:"लोकप्रिय",mostViewed:"सबसे अधिक देखे गए"
      },description:"नए लेख और उपयोगी जानकारी।",search:"लेख खोजें...",sort:"नवीनतम पहले ↓",page:"पृष्ठ",of:"में से",articles:"लेख",empty:"इस श्रेणी में अभी कोई लेख प्रकाशित नहीं हुआ है।",about:"परिचय",contact:"संपर्क",privacy:"गोपनीयता",aboutTitle:"रोज़मर्रा के सवालों के लिए स्पष्ट और उपयोगी जानकारी।",aboutText:"हमारे लेख सामान्य जानकारी के लिए हैं और पेशेवर सलाह का विकल्प नहीं हैं।"
    },
    de:{
      latest:"AKTUELL",categories:{
        home:"Startseite",world:"Weltnachrichten",tips:"Alltagstipps",technology:"Wissenschaft & Technologie",sports:"Sport",entertainment:"Unterhaltung",travel:"Reisen",finance:"Finanzen",lifestyle:"Lebensstil"
      },stories:"NEUESTE ARTIKEL",types:{
        latest:"Neueste",popular:"Beliebt",mostViewed:"Meistgesehen"
      },description:"Neueste Artikel und hilfreiche Informationen.",search:"Artikel suchen...",sort:"NEUESTE ZUERST ↓",page:"Seite",of:"von",articles:"Artikel",empty:"In dieser Kategorie wurden noch keine Artikel veröffentlicht.",about:"Über uns",contact:"Kontakt",privacy:"Datenschutz",aboutTitle:"Klare Informationen für die Fragen des Alltags.",aboutText:"Unsere Artikel dienen der allgemeinen Information und ersetzen keine professionelle Beratung."
    },
    fr:{
      latest:"À LA UNE",categories:{
        home:"Accueil",world:"Actualités",tips:"Conseils pratiques",technology:"Science et technologie",sports:"Sports",entertainment:"Divertissement",travel:"Voyage",finance:"Finance",lifestyle:"Mode de vie"
      },stories:"DERNIERS ARTICLES",types:{
        latest:"Récent",popular:"Populaire",mostViewed:"Les plus vus"
      },description:"Articles récents et informations utiles.",search:"Rechercher des articles...",sort:"PLUS RÉCENT ↓",page:"Page",of:"sur",articles:"Articles",empty:"Aucun article n’a encore été publié dans cette catégorie.",about:"À propos",contact:"Contact",privacy:"Confidentialité",aboutTitle:"Des informations claires pour les questions du quotidien.",aboutText:"Nos articles sont informatifs et ne remplacent pas un avis professionnel."
    },
    es:{
      latest:"ÚLTIMAS NOTICIAS",categories:{
        home:"Inicio",world:"Noticias mundiales",tips:"Consejos diarios",technology:"Ciencia y tecnología",sports:"Deportes",entertainment:"Entretenimiento",travel:"Viajes",finance:"Finanzas",lifestyle:"Estilo de vida"
      },stories:"ARTÍCULOS RECIENTES",types:{
        latest:"Recientes",popular:"Popular",mostViewed:"Más vistos"
      },description:"Artículos recientes e información útil.",search:"Buscar artículos...",sort:"MÁS RECIENTES ↓",page:"Página",of:"de",articles:"Artículos",empty:"Todavía no se han publicado artículos en esta categoría.",about:"Acerca de",contact:"Contacto",privacy:"Privacidad",aboutTitle:"Información clara para las preguntas de cada día.",aboutText:"Nuestros artículos son informativos y no sustituyen el asesoramiento profesional."
    }
  };
  const extendedUiCopy = {
    en:{moreCategories:"More",featuredStories:"Featured Stories",featuredDescription:"A collection of editor-selected stories and in-depth reviews.",featuredMore:"Read More Featured Stories",explore:"EXPLORE CATEGORIES",latest:"Latest",popular:"Popular",more:"More Details",emptyLatest:"New stories will appear here as they are published.",emptyPopular:"Popular stories will appear here soon.",main:"MAIN HOME PAGE",read:"Read Full Article",categoryHighlights:"Category Highlights",explore:"EXPLORE",ad:"ADVERTISEMENT",adSense:"AdSense",adResponsive:"Responsive advertisement placement",stories:"LATEST STORIES",previous:"Previous",next:"Next",categories:"Categories",about:"About Us",contact:"Contact",privacy:"Privacy Policy",editorial:"Editorial Policy",terms:"Terms of Use",disclaimer:"Disclaimer",cookies:"Cookie Policy"},
    bn:{moreCategories:"আরও",featuredStories:"ফিচার্ড পোস্ট",featuredDescription:"সম্পাদক বা অ্যাডমিনের নির্বাচিত গুরুত্বপূর্ণ পোস্ট ও বিস্তারিত রিভিউ।",featuredMore:"আরও বিস্তারিত পড়ুন",explore:"ক্যাটাগরি দেখুন",latest:"সর্বশেষ",popular:"জনপ্রিয়",more:"আরও বিস্তারিত",emptyLatest:"নতুন পোস্ট প্রকাশিত হলে এখানে দেখা যাবে।",emptyPopular:"জনপ্রিয় পোস্ট শিগগিরই এখানে দেখা যাবে।",main:"মূল হোমপেজ",read:"সম্পূর্ণ লেখা পড়ুন",categoryHighlights:"ক্যাটাগরির বিশেষ পোস্ট",ad:"বিজ্ঞাপন",adSense:"বিজ্ঞাপন",adResponsive:"রেসপনসিভ বিজ্ঞাপনের স্থান",stories:"সর্বশেষ পোস্ট",previous:"পূর্ববর্তী",next:"পরবর্তী",categories:"ক্যাটাগরি",about:"আমাদের সম্পর্কে",contact:"যোগাযোগ",privacy:"গোপনীয়তা নীতি",editorial:"সম্পাদনা নীতি",terms:"ব্যবহারের শর্ত",disclaimer:"দায়মুক্তি",cookies:"কুকি নীতি"},
    hi:{moreCategories:"और",featuredStories:"विशेष लेख",featuredDescription:"संपादक द्वारा चुने गए महत्वपूर्ण लेख और विस्तृत समीक्षाएँ।",featuredMore:"और विशेष लेख पढ़ें",explore:"श्रेणियाँ देखें",latest:"नवीनतम",popular:"लोकप्रिय",more:"और अधिक जानें",emptyLatest:"नई पोस्ट प्रकाशित होने पर यहाँ दिखाई देंगी।",emptyPopular:"लोकप्रिय पोस्ट जल्द ही यहाँ दिखाई देंगी।",main:"मुख्य होम पेज",read:"पूरा लेख पढ़ें",categoryHighlights:"श्रेणी की खास पोस्ट",ad:"विज्ञापन",adSense:"विज्ञापन",adResponsive:"रिस्पॉन्सिव विज्ञापन स्थान",stories:"नवीनतम पोस्ट",previous:"पिछला",next:"अगला",categories:"श्रेणियाँ",about:"हमारे बारे में",contact:"संपर्क",privacy:"गोपनीयता नीति",editorial:"संपादकीय नीति",terms:"उपयोग की शर्तें",disclaimer:"अस्वीकरण",cookies:"कुकी नीति"},
    de:{moreCategories:"Mehr",featuredStories:"Ausgewählte Beiträge",featuredDescription:"Wichtige redaktionell ausgewählte Beiträge und ausführliche Rezensionen.",featuredMore:"Weitere ausgewählte Beiträge lesen",explore:"KATEGORIEN ENTDECKEN",latest:"Neueste",popular:"Beliebt",more:"Mehr erfahren",emptyLatest:"Neue Beiträge erscheinen hier nach der Veröffentlichung.",emptyPopular:"Beliebte Beiträge erscheinen bald hier.",main:"STARTSEITE",read:"Ganzen Artikel lesen",categoryHighlights:"Kategorie-Highlights",ad:"WERBUNG",adSense:"Werbung",adResponsive:"Responsiver Anzeigenplatz",stories:"NEUESTE BEITRÄGE",previous:"Zurück",next:"Weiter",categories:"Kategorien",about:"Über uns",contact:"Kontakt",privacy:"Datenschutz",editorial:"Redaktionsrichtlinie",terms:"Nutzungsbedingungen",disclaimer:"Haftungsausschluss",cookies:"Cookie-Richtlinie"},
    fr:{moreCategories:"Plus",explore:"DÉCOUVRIR LES CATÉGORIES",latest:"Récent",popular:"Populaire",more:"Voir plus",emptyLatest:"Les nouveaux articles apparaîtront ici après publication.",emptyPopular:"Les articles populaires apparaîtront bientôt ici.",main:"PAGE D’ACCUEIL",read:"Lire l’article complet",categoryHighlights:"À découvrir par catégorie",ad:"PUBLICITÉ",adSense:"Publicité",adResponsive:"Espace publicitaire adaptatif",stories:"DERNIERS ARTICLES",previous:"Précédent",next:"Suivant",categories:"Catégories",about:"À propos",contact:"Contact",privacy:"Confidentialité",editorial:"Ligne éditoriale",terms:"Conditions d’utilisation",disclaimer:"Avertissement",cookies:"Politique relative aux cookies"},
    es:{moreCategories:"Más",featuredStories:"Artículos destacados",featuredDescription:"Artículos importantes y reseñas detalladas seleccionados por el equipo editorial.",featuredMore:"Leer más artículos destacados",explore:"EXPLORAR CATEGORÍAS",latest:"Recientes",popular:"Popular",more:"Ver más",emptyLatest:"Las nuevas publicaciones aparecerán aquí al publicarse.",emptyPopular:"Las publicaciones populares aparecerán pronto aquí.",main:"PÁGINA PRINCIPAL",read:"Leer artículo completo",categoryHighlights:"Destacados por categoría",ad:"PUBLICIDAD",adSense:"Publicidad",adResponsive:"Espacio publicitario adaptable",stories:"ARTÍCULOS RECIENTES",previous:"Anterior",next:"Siguiente",categories:"Categorías",about:"Acerca de",contact:"Contacto",privacy:"Privacidad",editorial:"Política editorial",terms:"Términos de uso",disclaimer:"Aviso legal",cookies:"Política de cookies"}
  };
  /* =========================================================
     05. LANGUAGE SWITCHING
     Purpose: Apply the selected language to interface controls.
     Section complete.
  ========================================================= */
  // Until it is deployed, keep existing interface copy available as a safe fallback.
  ["ar","ur","pt","zh","ja","ko","id","ru","tr"].forEach(code => {
    languageCopy[code] = languageCopy.en;
    extendedUiCopy[code] = extendedUiCopy.en;
  });

  // Only the three editorial languages are available in the header selector.
  const supportedLanguages = [
    {code:"bn",label:"বাংলা",locale:"bn-BD"},
    {code:"en",label:"English",locale:"en-US"},
    {code:"hi",label:"हिन्दी",locale:"hi-IN"}
  ];
  const languageSelect = $("#languageSelect");
  if (languageSelect) {
    languageSelect.replaceChildren(...supportedLanguages.map(language => {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = language.label + " (" + language.code.toUpperCase() + ")";
      return option;
    }));
    // Slightly widen the existing selector on desktop, without enlarging it on mobile.
    const sizeLanguageControl = () => {
      languageSelect.style.minWidth = window.matchMedia("(min-width: 801px)").matches ? "158px" : "auto";
    };
    sizeLanguageControl();
    window.addEventListener("resize", sizeLanguageControl, {passive:true});
  }

  let activeLanguage = "en";
  const dateLocales = Object.fromEntries(supportedLanguages.map(language => [language.code, language.locale]));
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
    const sportsLabels = window.EA_TRANSLATIONS?.sportsSubcategories?.[activeLanguage] || window.EA_TRANSLATIONS?.sportsSubcategories?.en || {};
    document.querySelectorAll("#sportsSubmenu [data-sports-subcategory]").forEach(button => { const key=button.dataset.sportsSubcategory; if(sportsLabels[key])button.textContent=sportsLabels[key]; });
    const entertainmentLabels={en:{cinema:"Cinema",bollywood:"Bollywood","south-cinema":"South Indian Cinema",music:"Music",hollywood:"Hollywood",television:"Television",serial:"TV Serials","folk-art":"Folk Culture"},bn:{cinema:"সিনেমা",bollywood:"বলিউড","south-cinema":"দক্ষিণের সিনেমা",music:"গান",hollywood:"হলিউড",television:"টেলিভিশন",serial:"সিরিয়াল","folk-art":"লোক-সংস্কৃতি"},hi:{cinema:"सिनेमा",bollywood:"बॉलीवुड","south-cinema":"दक्षिण भारतीय सिनेमा",music:"संगीत",hollywood:"हॉलीवुड",television:"टेलीविजन",serial:"धारावाहिक","folk-art":"लोक संस्कृति"},de:{cinema:"Kino",bollywood:"Bollywood","south-cinema":"Südkino",music:"Musik",hollywood:"Hollywood",television:"Fernsehen",serial:"Serien","folk-art":"Volkskultur"},fr:{cinema:"Cinéma",bollywood:"Bollywood","south-cinema":"Cinéma du Sud",music:"Musique",hollywood:"Hollywood",television:"Télévision",serial:"Séries","folk-art":"Culture populaire"},es:{cinema:"Cine",bollywood:"Bollywood","south-cinema":"Cine del sur",music:"Música",hollywood:"Hollywood",television:"Televisión",serial:"Series","folk-art":"Cultura popular"}}[activeLanguage]||{};
    document.querySelectorAll("#entertainmentSubmenu [data-entertainment-subcategory]").forEach(button=>{const key=button.dataset.entertainmentSubcategory;if(entertainmentLabels[key])button.textContent=entertainmentLabels[key];});
    const regionalLabels={en:{bangladesh:"Bangladesh",india:"India",pakistan:"Pakistan",asia:"Asia",europe:"Europe","middle-east":"Middle East"},bn:{bangladesh:"বাংলাদেশ",india:"ভারত",pakistan:"পাকিস্তান",asia:"এশিয়া",europe:"ইউরোপ","middle-east":"মধ্যপ্রাচ্য"},hi:{bangladesh:"बांग्लादेश",india:"भारत",pakistan:"पाकिस्तान",asia:"एशिया",europe:"यूरोप","middle-east":"मध्य पूर्व"},de:{bangladesh:"Bangladesch",india:"Indien",pakistan:"Pakistan",asia:"Asien",europe:"Europa","middle-east":"Naher Osten"},fr:{bangladesh:"Bangladesh",india:"Inde",pakistan:"Pakistan",asia:"Asie",europe:"Europe","middle-east":"Moyen-Orient"},es:{bangladesh:"Bangladés",india:"India",pakistan:"Pakistán",asia:"Asia",europe:"Europa","middle-east":"Oriente Medio"}}[activeLanguage]||{};
    document.querySelectorAll("#worldSubmenu [data-world-subcategory]").forEach(button=>{const key=button.dataset.worldSubcategory;if(regionalLabels[key])button.textContent=regionalLabels[key];});
    const lifestyleLabels={
      "daily-tips":{en:"Daily Tips",bn:"দৈনন্দিন টিপস",hi:"दैनिक सुझाव",de:"Alltagstipps",fr:"Conseils quotidiens",es:"Consejos diarios"},
      "health":{en:"Health",bn:"স্বাস্থ্য",hi:"स्वास्थ्य",de:"Gesundheit",fr:"Santé",es:"Salud"},
      "beauty-care":{en:"Beauty Care",bn:"রূপচর্চা",hi:"सौंदर्य देखभाल",de:"Schönheitspflege",fr:"Soins de beauté",es:"Cuidado de belleza"}
    };
    document.querySelectorAll("#lifestyleSubmenu [data-lifestyle-subcategory]").forEach(button=>{const labels=lifestyleLabels[button.dataset.lifestyleSubcategory];if(labels)button.textContent=labels[activeLanguage]||labels.en;});
    /* Localize only the hamburger header drawer subcategory cards.
       The visible homepage category navigation is intentionally untouched. */
    const drawerSubcategoryLabels = {
      "bangladesh": { en: "Bangladesh", bn: "বাংলাদেশ", hi: "बांग्लादेश" },
      "india": { en: "India", bn: "ভারত", hi: "भारत" },
      "pakistan": { en: "Pakistan", bn: "পাকিস্তান", hi: "पाकिस्तान" },
      "asia": { en: "Asia", bn: "এশিয়া", hi: "एशिया" },
      "europe": { en: "Europe", bn: "ইউরোপ", hi: "यूरोप" },
      "middle-east": { en: "Middle East", bn: "মধ্যপ্রাচ্য", hi: "मध्य पूर्व" },
      "cricket": { en: "Cricket", bn: "ক্রিকেট", hi: "क्रिकेट" },
      "football": { en: "Football", bn: "ফুটবল", hi: "फ़ुटबॉल" },
      "tennis": { en: "Tennis", bn: "টেনিস", hi: "टेनिस" },
      "basketball": { en: "Basketball", bn: "বাস্কেটবল", hi: "बास्केटबॉल" },
      "other-sports": { en: "Other", bn: "অন্যান্য", hi: "अन्य" },
      "cinema": { en: "Cinema", bn: "সিনেমা", hi: "सिनेमा" },
      "bollywood": { en: "Bollywood", bn: "বলিউড", hi: "बॉलीवुड" },
      "south-cinema": { en: "South Indian Cinema", bn: "দক্ষিণ ভারতীয় সিনেমা", hi: "दक्षिण भारतीय सिनेमा" },
      "music": { en: "Music", bn: "সংগীত", hi: "संगीत" },
      "hollywood": { en: "Hollywood", bn: "হলিউড", hi: "हॉलीवुड" },
      "television": { en: "Television", bn: "টেলিভিশন", hi: "टेलीविजन" },
      "serial": { en: "TV Serials", bn: "টিভি সিরিয়াল", hi: "टीवी धारावाहिक" },
      "folk-art": { en: "Folk Culture", bn: "লোকসংস্কৃতি", hi: "लोक संस्कृति" },
      "daily-tips": { en: "Daily Tips", bn: "দৈনন্দিন টিপস", hi: "दैनिक सुझाव" },
      "health": { en: "Health", bn: "স্বাস্থ্য", hi: "स्वास्थ्य" },
      "beauty-care": { en: "Beauty Care", bn: "রূপচর্চা", hi: "सौंदर्य देखभाल" }
    };
    document.querySelectorAll(".main-nav .sidebar-submenu button[data-sidebar-subcategory]").forEach(button => {
      const labels = drawerSubcategoryLabels[button.dataset.sidebarSubcategory];
      if (labels) button.textContent = labels[activeLanguage] || labels.en;
    });
    const sportsHomeTitle = document.querySelector("#homeSportsTitle");
    if (sportsHomeTitle) sportsHomeTitle.textContent = t.categories.sports;
    document.documentElement.lang = activeLanguage;
    updateHeaderClock();
    document.querySelectorAll(".home-rail-tab[data-home-list]").forEach(button => { button.textContent = ui[button.dataset.homeList] || button.textContent; });
    const menuHeading = document.querySelector(".menu-heading"); if (menuHeading) menuHeading.textContent = ui.explore;
    const moreLabel = document.querySelector("#moreCategoriesTab"); if (moreLabel) { moreLabel.setAttribute("aria-label", ui.moreCategories || "More"); moreLabel.setAttribute("title", ui.moreCategories || "More"); }
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
      const label = t.categories[button.dataset.categoryLabel || button.dataset.category];
      if (!label) return;
      if (button.classList.contains("sidebar-category")) {
        const textNode = Array.from(button.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.nodeValue = label;
        else button.insertBefore(document.createTextNode(label), button.firstChild);
      } else if (button.dataset.category !== "home") {
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
    applyLocalizedPostContent();
    render();
  }
  /* =========================================================
     06. PAGE STATE
     Purpose: Remember selected category, post type, search and page.
     Section complete.
  ========================================================= */
  let activeCategory = "home";
  let activeSubcategory = "";
  // Biography filters are optional; All Countries is the default and shows every biography.
  let biographyFilters = {country:"all",personType:"",personName:""};
  const biographyCountryFilter = $("#biographyCountryFilter");
  const biographyTypeFilter = $("#biographyTypeFilter");
  const biographyNameFilter = $("#biographyNameFilter");
  function biographyPostsBase(){
    return posts.filter(post=>post.category==="biography");
  }
  function refreshBiographyNameOptions(){
    if(!biographyNameFilter)return;
    if(biographyCountryFilter){
      const selectedCountry=biographyCountryFilter.value||"all";
      const knownCountries=Array.from(biographyCountryFilter.options).map(option=>option.value).filter(value=>value&&value!=="all");
      const storedCountries=biographyPostsBase().map(post=>post.biographyCountry).filter(Boolean);
      const countries=[...new Set([...knownCountries,...storedCountries])].sort((a,b)=>a.localeCompare(b));
      biographyCountryFilter.innerHTML='<option value="all">All Countries</option>'+countries.map(country=>'<option value="'+escapeHTML(country)+'">'+escapeHTML(country)+'</option>').join("");
      biographyCountryFilter.value=countries.includes(selectedCountry)?selectedCountry:"all";
    }
    const country=biographyCountryFilter?.value||"all";
    const type=biographyTypeFilter?.value||"";
    const names=[...new Set(biographyPostsBase().filter(post=>(country==="all"||!country||post.biographyCountry===country)&&(!type||post.biographyPersonType===type)).map(post=>post.biographyPersonName||post.title).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const previous=biographyNameFilter.value;
    biographyNameFilter.innerHTML='<option value="">All People</option>'+names.map(name=>'<option value="'+escapeHTML(name)+'">'+escapeHTML(name)+'</option>').join("");
    if(names.includes(previous))biographyNameFilter.value=previous;
  }
  function biographyPostMatches(post){
    const country=biographyFilters.country||"all";
    return (country==="all"||post.biographyCountry===country)&&
      (!biographyFilters.personType||post.biographyPersonType===biographyFilters.personType)&&
      (!biographyFilters.personName||(post.biographyPersonName||post.title)===biographyFilters.personName);
  }
  if(biographyCountryFilter&&biographyTypeFilter&&biographyNameFilter){
    biographyCountryFilter.addEventListener("change",refreshBiographyNameOptions);
    biographyTypeFilter.addEventListener("change",refreshBiographyNameOptions);
    $("#biographyFilterApply")?.addEventListener("click",()=>{
      biographyFilters={country:biographyCountryFilter.value||"all",personType:biographyTypeFilter.value||"",personName:biographyNameFilter.value||""};
      currentPage=1;render();
    });
    $("#biographyFilterReset")?.addEventListener("click",()=>{
      biographyCountryFilter.value="all";biographyTypeFilter.value="";biographyNameFilter.value="";
      biographyFilters={country:"all",personType:"",personName:""};refreshBiographyNameOptions();currentPage=1;render();
    });
  }

  // Homepage World News filtering is independent of category-page navigation.
  let activeHomeWorldSubcategory = "";
  // Homepage Lifestyle filtering is independent of category-page navigation.
  let activeHomeLifestyleSubcategory = "";
  let currentPage = 1;
  let activePostType = "latest";
  const pageSize = 9; // Nine fixed slots fill the shared category editorial layout.
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

  // No automatic category images: only the uploaded cover is shown.
  function imageForPost(post) { return post && typeof post.cover === "string" ? post.cover.trim() : ""; }

  const pageLayout = $(".page-layout");
  const homeSection = $("#homeSection");
  const latestPostsSection = $("#latestPostsSection");
  const articleSection = $("#articleFeed");
  const homeListPanel = $("#homeListPanel");
  const homeFeatured = $("#homeFeatured");
  const singleArticleView = $("#singleArticleView");
  const categorySection = $("#categories");
  const topAdSlot = $(".top-ad");
  const featuredStoriesSection = $("#featuredStoriesSection");
  const trendingSection = $("#trendingSection");
  const manualTrendingSection = $("#manualTrendingSection");
  const aboutSection = $("#about");

  /* Desktop Latest Posts section matches the live rendered height of the Hero section. */
  function syncLatestPostsSectionHeight() {
    if (!latestPostsSection || !homeSection) return;
    if (latestPostsSection.hidden || homeSection.hidden || !window.matchMedia("(min-width:801px)").matches) {
      latestPostsSection.style.removeProperty("height");
      return;
    }
    const heroHeight = homeSection.getBoundingClientRect().height;
    if (heroHeight > 0) latestPostsSection.style.height = Math.ceil(heroHeight) + "px";
  }

  if (homeSection) {
    if (typeof ResizeObserver === "function") {
      const heroHeightObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(syncLatestPostsSectionHeight);
      });
      heroHeightObserver.observe(homeSection);
    }
    window.addEventListener("resize", syncLatestPostsSectionHeight, {passive:true});
    window.addEventListener("load", syncLatestPostsSectionHeight, {once:true});
  }

  function renderLatestPostsSection() {
    if (!latestPostsSection) return;
    const visualHost = $("#latestPostsVisual");
    const updateHost = $("#latestPostsUpdates");
    const headlineHost = $("#latestPostsHeadlines");
    if (!visualHost || !updateHost || !headlineHost) return;

    // Show only published stories explicitly placed in Latest.
    const latestItems = sortedByDate(posts.filter(post => {
      const placements = Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"];
      return placements.includes("latest");
    }));
    latestPostsSection.hidden = latestItems.length === 0;

    // Latest section only: six image cards on the left, four image-and-summary
    // updates in the middle, and six image cards on the right.
    const visualItems = latestItems.slice(0,6);
    const updateItems = latestItems.slice(6,10);
    const headlineItems = latestItems.slice(10,16);

    visualHost.innerHTML = visualItems.map(post => {
      const image = imageForPost(post);
      return '<button class="latest-post-visual-card" type="button" data-open-post="' + posts.indexOf(post) + '">' +
        (image
          ? '<span class="latest-post-visual-image"><img src="' + escapeHTML(image) + '" alt="' + escapeHTML(post.title) + '" loading="lazy"></span>'
          : '<span class="latest-post-visual-image latest-post-image-empty"></span>') +
        '<strong>' + escapeHTML(post.title) + '</strong>' +
      '</button>';
    }).join("");

    updateHost.innerHTML = updateItems.map(post => {
      const image = imageForPost(post);
      const rawSummary = String(post.excerpt || (post.contentHtml || (post.body || []).join(" ")).replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ")).replace(/\s+/g," ").trim();
      const summary = rawSummary.length > 118 ? rawSummary.slice(0,115).trimEnd() + "…" : rawSummary;
      return '<button class="latest-post-update-row" type="button" data-open-post="' + posts.indexOf(post) + '">' +
        (image
          ? '<span class="latest-post-update-image"><img src="' + escapeHTML(image) + '" alt="" loading="lazy"></span>'
          : '<span class="latest-post-update-image latest-post-image-empty"></span>') +
        '<span class="latest-post-update-copy"><strong>' + escapeHTML(post.title) + '</strong>' +
          (summary ? '<small>' + escapeHTML(summary) + '</small>' : '') +
        '</span>' +
      '</button>';
    }).join("");

    headlineHost.innerHTML = headlineItems.map(post => {
      const image = imageForPost(post);
      return '<button class="latest-post-visual-card" type="button" data-open-post="' + posts.indexOf(post) + '">' +
        (image
          ? '<span class="latest-post-visual-image"><img src="' + escapeHTML(image) + '" alt="' + escapeHTML(post.title) + '" loading="lazy"></span>'
          : '<span class="latest-post-visual-image latest-post-image-empty"></span>') +
        '<strong>' + escapeHTML(post.title) + '</strong>' +
      '</button>';
    }).join("");

    // Wait for the current Hero and Latest Posts cards to finish layout, then copy the Hero height.
    window.requestAnimationFrame(syncLatestPostsSectionHeight);
  }

  /* Science & Technology homepage section: 12 uniform image-and-summary list posts. */
  function renderScienceTechSection() {
    const section = $("#scienceTechSection");
    const host = $("#scienceTechPosts");
    const title = $("#scienceTechTitle");
    if (!section || !host) return;

    const items = sortedByDate(posts.filter(post =>
      post.category === "technology" &&
      (Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"]).includes("latest")
    )).slice(0,12);

    section.hidden = items.length === 0;
    if (!items.length) {
      host.innerHTML = "";
      return;
    }

    if (title) {
      const language = languageCopy[activeLanguage] || languageCopy.en;
      title.textContent = (language.categories && language.categories.technology) || "Science & Technology";
    }

    const renderScienceList = post => {
      const index = posts.indexOf(post);
      const image = imageForPost(post);
      const rawSummary = String(
        post.excerpt ||
        post.contentHtml ||
        post.content ||
        (Array.isArray(post.body) ? post.body.join(" ") : "")
      ).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
      const summary = rawSummary.length > 170 ? rawSummary.slice(0,167).trimEnd() + "…" : rawSummary;

      return '<button class="home-category-card science-tech-list-card" type="button" data-open-post="' + index + '">' +
        (image
          ? '<span class="home-category-image"><img src="' + escapeHTML(image) + '" alt="" loading="lazy"></span>'
          : '<span class="home-category-image home-category-image-empty"></span>') +
        '<span class="home-category-copy">' +
          '<strong>' + escapeHTML(post.title) + '</strong>' +
          (summary ? '<small>' + escapeHTML(summary) + '</small>' : '') +
        '</span>' +
      '</button>';
    };

    const leftPosts = items.slice(0,6);
    
    const rightPosts = items.slice(6,12);

    host.innerHTML =
      '<div class="science-tech-list-column science-tech-left">' +
        leftPosts.map(renderScienceList).join("") +
      '</div>' +
      '<div class="science-tech-list-column science-tech-right">' +
        rightPosts.map(renderScienceList).join("") +
        '<button class="science-tech-more" type="button" data-home-category-view="technology">আরও বিস্তারিত পড়ুন <span aria-hidden="true">→</span></button>' +
      '</div>';

    window.requestAnimationFrame(syncScienceTechSectionHeight);
  }

  /* Let the two eight-post lists determine their natural section height. */
  function syncScienceTechSectionHeight() {
    const section = $("#scienceTechSection");
    if (section) section.style.removeProperty("height");
  }

  if (homeSection) {
    if (typeof ResizeObserver === "function") {
      const scienceTechHeightObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(syncScienceTechSectionHeight);
      });
      scienceTechHeightObserver.observe(homeSection);
    }
    window.addEventListener("resize", syncScienceTechSectionHeight, {passive:true});
    window.addEventListener("load", syncScienceTechSectionHeight, {once:true});
  }

  function renderEntertainmentFeature() {
    const section = $("#entertainmentFeatureSection");
    const leadHost = $("#entertainmentFeatureLead");
    const gridHost = $("#entertainmentFeatureGrid");
    const sliderHost = $("#entertainmentImageSlider");
    if (!section || !leadHost || !gridHost || !sliderHost) return;

    // Use the latest published Entertainment posts from the existing Supabase collection.
    const items = sortedByDate(posts.filter(post =>
      post.category === "entertainment" &&
      (Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"]).includes("latest")
    ));
    section.hidden = items.length === 0;

    if (sliderHost.__entertainmentTimer) window.clearInterval(sliderHost.__entertainmentTimer);
    sliderHost.__entertainmentTimer = null;

    if (!items.length) {
      leadHost.innerHTML = "";
      gridHost.innerHTML = "";
      sliderHost.innerHTML = "";
      return;
    }

    const lead = items[0];
    const leadIndex = posts.indexOf(lead);
    const leadImage = imageForPost(lead);
    const leadExcerpt = String(lead.excerpt || "").trim();

    // Main story: image on the left, title and short text on the right.
    leadHost.innerHTML =
      '<article class="entertainment-feature-main-post">' +
        '<button class="entertainment-feature-main-open" type="button" data-open-post="' + leadIndex + '">' +
          (leadImage
            ? '<span class="entertainment-feature-main-image"><img src="' + escapeHTML(leadImage) + '" alt="' + escapeHTML(lead.title) + '" loading="lazy"></span>'
            : '<span class="entertainment-feature-main-image"></span>') +
          '<span class="entertainment-feature-main-copy"><strong>' + escapeHTML(lead.title) + '</strong>' +
          (leadExcerpt ? '<span class="entertainment-feature-main-excerpt">' + escapeHTML(leadExcerpt.slice(0,260)) + '</span>' : '') +
          '</span>' +
        '</button>' +
      '</article>';

    // Three supporting stories appear side by side beneath the main story.
    gridHost.innerHTML = items.slice(1,4).map(post => {
      const index = posts.indexOf(post);
      const image = imageForPost(post);
      return '<button class="entertainment-feature-card" type="button" data-open-post="' + index + '">' +
        (image
          ? '<span class="entertainment-feature-card-image"><img src="' + escapeHTML(image) + '" alt="' + escapeHTML(post.title) + '" loading="lazy"></span>'
          : '<span class="entertainment-feature-card-image"></span>') +
        '<strong>' + escapeHTML(post.title) + '</strong>' +
      '</button>';
    }).join("");

    // Cycle through unique cover images from the same Entertainment posts.
    const sliderImages = items.map(post => ({
      src: imageForPost(post),
      title: String(post.title || "Entertainment")
    })).filter((item, index, all) =>
      item.src && all.findIndex(other => other.src === item.src) === index
    );

    if (!sliderImages.length) {
      sliderHost.innerHTML = '<div class="entertainment-image-slider-empty" aria-hidden="true"></div>';
      return;
    }

    let activeImage = 0;
    const paintSlider = () => {
      const image = sliderImages[activeImage];
      sliderHost.innerHTML =
        '<figure class="entertainment-image-slider-frame">' +
          '<img src="' + escapeHTML(image.src) + '" alt="' + escapeHTML(image.title) + '" loading="lazy">' +
          '<figcaption>' + escapeHTML(image.title) + '</figcaption>' +
        '</figure>';
    };
    paintSlider();

    if (sliderImages.length > 1) {
      sliderHost.__entertainmentTimer = window.setInterval(() => {
        activeImage = (activeImage + 1) % sliderImages.length;
        paintSlider();
      }, 3000);
    }
  }

  // Read all images already stored with the article (cover + inline article images).
  // The existing Cloudinary / Supabase upload workflow remains unchanged.
  function imagesForHomeGallery(post) {
    const images = [];
    const cover = imageForPost(post);
    if (cover) images.push(cover);

    const articleHtml = [
      post && post.contentHtml,
      post && post.content,
      Array.isArray(post && post.body) ? post.body.join(" ") : ""
    ].filter(Boolean).join(" ");

    const imageTags = articleHtml.match(/<img\b[^>]*>/gi) || [];
    imageTags.forEach(tag => {
      const match = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
      if (!match || !match[2]) return;
      const src = match[2].trim();
      if (/^https?:\/\//i.test(src) && !images.includes(src)) images.push(src);
    });
    return images;
  }

  function renderHomeEditorialSection(items, host, sectionKey) {
    if (!host) return;
    host.classList.add("home-editorial-host");
    if (host.__galleryTimer) window.clearInterval(host.__galleryTimer);
    host.__galleryTimer = null;

    if (!items.length) {
      host.innerHTML =
        '<div class="home-editorial-top"><div class="home-editorial-lead"><div class="home-editorial-empty-main" aria-hidden="true"></div></div><div class="home-editorial-list"></div></div>' +
        '<div class="home-post-gallery-slider is-empty" data-home-gallery="' + sectionKey + '" aria-label="Article image slider"></div>';
      return;
    }

    const mainPost = items[0];
    const sidePosts = sectionKey === "biography" ? items.slice(1, 5) : items.slice(1);
    const mainIndex = posts.indexOf(mainPost);
    const mainImage = imageForPost(mainPost);
    const excerpt = String(mainPost.excerpt || "").trim();
    // Collect available images from the posts in this homepage section.
    // Five image slots are always shown; additional images move through the slider one at a time.
    const galleryImages = items.flatMap(post => imagesForHomeGallery(post).map(src => ({ src, title: post.title || "Article image" }))).filter((image, index, all) => all.findIndex(item => item.src === image.src) === index);

    const mainCard =
      '<button class="home-category-card home-world-main" type="button" data-open-post="' + mainIndex + '">' +
        (mainImage ? '<span class="home-category-image"><img src="' + escapeHTML(mainImage) + '" alt="' + escapeHTML(mainPost.title) + '" loading="lazy"></span>' : '<span class="home-category-image home-category-image-empty"></span>') +
        '<span class="home-category-copy"><strong>' + escapeHTML(mainPost.title) + '</strong>' +
        (excerpt ? '<small>' + escapeHTML(excerpt.slice(0,145)) + '</small>' : '') + '</span></button>';

    const sideList = (sectionKey === "biography"
      ? Array.from({ length: 4 }, (_, index) => sidePosts[index] || null)
      : sidePosts
    ).map(post => {
      if (sectionKey === "biography" && !post) {
        return '<div class="home-biography-card home-biography-card-placeholder" aria-hidden="true">' +
          '<span class="home-category-image home-category-image-empty"></span>' +
          '<span class="home-biography-placeholder-title"></span>' +
          '</div>';
      }
      const index = posts.indexOf(post);
      const image = imageForPost(post);
      const sideCardClass = sectionKey === "biography" ? "home-category-card home-biography-card" : "home-category-card home-world-small";
      return '<button class="' + sideCardClass + '" type="button" data-open-post="' + index + '">' +
        (image ? '<span class="home-category-image"><img src="' + escapeHTML(image) + '" alt="" loading="lazy"></span>' : '<span class="home-category-image home-category-image-empty"></span>') +
        '<span class="home-category-copy"><strong>' + escapeHTML(post.title) + '</strong></span></button>';
    }).join("");

    const visibleGallerySlots = 5;
    let galleryCenterIndex = 0;
    const gallery = '<div class="home-post-gallery-slider' + (galleryImages.length ? '' : ' is-empty') + '" data-home-gallery="' + sectionKey + '" aria-label="Article image carousel">' +
      '<div class="home-post-gallery-track">' +
      Array.from({ length: visibleGallerySlots }, (_, slot) => {
        const imageIndex = galleryImages.length ? (galleryCenterIndex + slot - 2 + galleryImages.length * 10) % galleryImages.length : -1;
        const image = imageIndex >= 0 ? galleryImages[imageIndex] : null;
        return '<figure class="home-post-gallery-slide' + (slot === 2 ? ' is-center' : '') + (image ? '' : ' is-empty') + '" data-gallery-slot="' + slot + '">' +
          (image ? '<img src="' + escapeHTML(image.src) + '" alt="' + escapeHTML(image.title) + '" loading="lazy"><figcaption>' + escapeHTML(image.title) + '</figcaption>' : '') +
          '</figure>';
      }).join("") +
      '</div>' +
      (galleryImages.length > 1 ? '<button class="home-post-gallery-arrow is-prev" type="button" data-gallery-step="-1" aria-label="Previous images">‹</button><button class="home-post-gallery-arrow is-next" type="button" data-gallery-step="1" aria-label="Next images">›</button>' : '') +
      '</div>';

    const sidePanelClass = sectionKey === "biography" ? "home-editorial-list home-biography-cards" : "home-editorial-list";
    const sidePanelStyle = sectionKey === "biography"
      ? ' style="display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(150px,1fr));gap:12px;align-content:start;align-items:stretch;min-height:312px;width:100%;padding:8px;background:#fff;border:1px solid #e5ece9;border-radius:5px;box-shadow:0 2px 8px #102d3610;box-sizing:border-box"'
      : '';
    host.innerHTML = '<div class="home-editorial-top"><div class="home-editorial-lead">' + mainCard + '</div><div class="' + sidePanelClass + '"' + sidePanelStyle + '>' + sideList + '</div></div>' + gallery;

    const slider = host.querySelector(".home-post-gallery-slider");
    if (!slider || galleryImages.length < 2) return;
    const track = slider.querySelector(".home-post-gallery-track");
    let isAnimating = false;
    let pendingDirection = 0;

    const setSlideImage = (slide, imageIndex) => {
      const image = galleryImages[(imageIndex + galleryImages.length) % galleryImages.length];
      slide.classList.remove("is-empty", "is-center");
      slide.dataset.imageIndex = String((imageIndex + galleryImages.length) % galleryImages.length);
      slide.innerHTML = '<img src="' + escapeHTML(image.src) + '" alt="' + escapeHTML(image.title) + '" loading="lazy"><figcaption>' + escapeHTML(image.title) + '</figcaption>';
    };
    const markCenterSlide = () => {
      Array.from(track.children).forEach((slide, index) => {
        slide.classList.toggle("is-center", index === 2);
        slide.dataset.gallerySlot = String(index);
      });
    };
    const moveGallery = direction => {
      if (isAnimating) {
        pendingDirection = direction;
        return;
      }
      isAnimating = true;
      track.dataset.direction = String(direction);
      track.style.transition = "transform .55s ease";
      track.style.transform = direction > 0 ? "translateX(calc(-1 * var(--gallery-step)))" : "translateX(var(--gallery-step))";
    };
    track.addEventListener("transitionend", event => {
      // Ignore bubbled transform events from the center image; only the track ends a slide move.
      if (event.target !== track || event.propertyName !== "transform") return;
      const direction = Number(track.dataset.direction || 1);
      const slides = Array.from(track.children);
      if (direction > 0) {
        const first = slides.shift();
        track.appendChild(first);
        galleryCenterIndex = (galleryCenterIndex + 1) % galleryImages.length;
        setSlideImage(track.lastElementChild, galleryCenterIndex + 2);
      } else {
        const last = slides.pop();
        track.insertBefore(last, track.firstElementChild);
        galleryCenterIndex = (galleryCenterIndex - 1 + galleryImages.length) % galleryImages.length;
        setSlideImage(track.firstElementChild, galleryCenterIndex - 2);
      }
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      markCenterSlide();
      track.offsetHeight;
      track.style.transition = "transform .55s ease";
      isAnimating = false;
      if (pendingDirection) {
        const nextDirection = pendingDirection;
        pendingDirection = 0;
        moveGallery(nextDirection);
      }
    });

    slider.onclick = event => {
      const control = event.target.closest("[data-gallery-step]");
      if (!control) return;
      event.preventDefault();
      moveGallery(Number(control.dataset.galleryStep || 0));
    };
    host.__galleryTimer = window.setInterval(() => moveGallery(1), 3500);
  }

  function renderHomeCategorySections() {
    const world = sortedByDate(posts.filter(post =>
      post.category === "world" &&
      (!activeHomeWorldSubcategory || post.subcategory === activeHomeWorldSubcategory) &&
      (Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"]).includes("latest")
    ));
    const lifestyle = sortedByDate(posts.filter(post =>
      post.category === "lifestyle" &&
      (!activeHomeLifestyleSubcategory || post.subcategory === activeHomeLifestyleSubcategory) &&
      (Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"]).includes("latest")
    ));
    const sports = sortedByDate(posts.filter(post =>
      post.category === "sports" &&
      (Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"]).includes("latest")
    )).slice(0,8);
    const tips = sortedByDate(posts.filter(post =>
      post.category === "lifestyle" && post.subcategory === "daily-tips" &&
      (Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"]).includes("latest")
    )).slice(0,8);

    const worldSection = $("#homeWorldSection"), worldHost = $("#homeWorldPosts");
    const worldTitle = $("#homeWorldTitle");
    if (worldSection && worldHost) {
      worldSection.hidden = false;
      const worldSelect = $("#homeWorldSubcategorySelect");
      const worldButtons = Array.from(document.querySelectorAll("#worldSubmenu [data-world-subcategory]"));
      if (worldSelect) {
        const selectedValue = activeHomeWorldSubcategory;
        worldSelect.innerHTML = '<option value="">Select Subcategory</option>' +
          worldButtons.map(button => '<option value="' + escapeHTML(button.dataset.worldSubcategory) + '">' + escapeHTML(button.textContent.trim()) + '</option>').join("");
        worldSelect.value = selectedValue;
      }
      if (worldTitle) worldTitle.textContent = "বিশ্ব সংবাদ";
      renderHomeEditorialSection(world, worldHost, "world");
    }

    const lifestyleSection = $("#homeLifestyleSection"), lifestyleHost = $("#homeLifestylePosts");
    const lifestyleSelect = $("#homeLifestyleSubcategorySelect");
    if (lifestyleSection && lifestyleHost) {
      lifestyleSection.hidden = false;
      const lifestyleButtons = Array.from(document.querySelectorAll("#lifestyleSubmenu [data-lifestyle-subcategory]"));
      if (lifestyleSelect) {
        const selectedValue = activeHomeLifestyleSubcategory;
        lifestyleSelect.innerHTML = '<option value="">Select Subcategory</option>' +
          lifestyleButtons.map(button => '<option value="' + escapeHTML(button.dataset.lifestyleSubcategory) + '">' + escapeHTML(button.textContent.trim()) + '</option>').join("");
        lifestyleSelect.value = selectedValue;
      }
      renderHomeEditorialSection(lifestyle, lifestyleHost, "lifestyle");
    }

    const sportsSection = $("#homeSportsSection"), sportsHost = $("#homeSportsPosts");
    if (sportsSection && sportsHost) {
      sportsSection.hidden = false;
      renderHomeEditorialSection(sports, sportsHost, "sports");
    }

    const tipsSection = $("#homeTipsSection"), tipsHost = $("#homeTipsPosts");
    if (tipsSection && tipsHost) {
      tipsSection.hidden = !tips.length;
      tipsHost.innerHTML = tips.map(post => {
        const index = posts.indexOf(post);
        const image = imageForPost(post);
        const excerpt = String(post.excerpt || "").trim();
        return '<button class="home-category-card home-tips-card" type="button" data-open-post="' + index + '">' +
          (image ? '<span class="home-category-image"><img src="' + escapeHTML(image) + '" alt="" loading="lazy"></span>' : '<span class="home-category-image home-category-image-empty"></span>') +
          '<span class="home-category-copy"><strong>' + escapeHTML(post.title) + '</strong>' +
          (excerpt ? '<small>' + escapeHTML(excerpt.slice(0,145)) + '</small>' : '') + '</span></button>';
      }).join("");
    }
  }

  /* Keep Most Read in its original full-width position.
     On desktop only, place manually curated Trending above the right-rail AdSense slot. */
  const manualTrendingOriginalAnchor = document.createComment("Manual Trending section original position");
  if (manualTrendingSection && manualTrendingSection.parentNode) {
    manualTrendingSection.parentNode.insertBefore(manualTrendingOriginalAnchor, manualTrendingSection);
  }
  const trendingDesktopQuery = window.matchMedia("(min-width: 801px)");
  function placeManualTrendingForViewport() {
    if (!manualTrendingSection || !manualTrendingOriginalAnchor.parentNode) return;
    if (trendingDesktopQuery.matches) {
      const rightRail = document.querySelector(".home-right");
      const adSlot = rightRail && rightRail.querySelector(".home-ad-slot");
      if (rightRail && adSlot) rightRail.insertBefore(manualTrendingSection, adSlot);
    } else {
      manualTrendingOriginalAnchor.parentNode.insertBefore(manualTrendingSection, manualTrendingOriginalAnchor.nextSibling);
    }
  }
  placeManualTrendingForViewport();
  if (typeof trendingDesktopQuery.addEventListener === "function") {
    trendingDesktopQuery.addEventListener("change", placeManualTrendingForViewport);
  } else if (typeof trendingDesktopQuery.addListener === "function") {
    trendingDesktopQuery.addListener(placeManualTrendingForViewport);
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
  function routeSlug(value) {
    /* Preserve Bengali vowel signs and other combining marks; NFC prevents broken Bengali slugs. */
    return String(value || "").normalize("NFC").toLowerCase().trim()
      .replace(/[^\p{L}\p{M}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"");
  }
  /* The visible URL slug follows the currently selected language's article title. */
  function articleSlug(post) { return routeSlug(post && (post.title || post.canonicalTitle)); }
  /* Accept every saved language title when resolving an incoming URL, so shared
     English/Hindi/Bengali links still open even if the visitor uses another language. */
  function articleSlugMatches(post, slug) {
    if (!post || !slug) return false;
    const translations = post.translations && typeof post.translations === "object" ? post.translations : {};
    const candidates = [post.canonicalTitle, post.title, ...Object.values(translations).map(item => item && item.title)];
    return candidates.some(title => routeSlug(title) === slug);
  }

  /* Country names are stored canonically in English for reliable filters,
     then displayed in the visitor's selected language. */
  function localizedBiographyCountry(country, language) {
    const names = {
      "bangladesh":["বাংলাদেশ","बांग्लादेश"],"india":["ভারত","भारत"],"pakistan":["পাকিস্তান","पाकिस्तान"],
      "united states":["যুক্তরাষ্ট্র","संयुक्त राज्य अमेरिका"],"united kingdom":["যুক্তরাজ্য","यूनाइटेड किंगडम"],
      "canada":["কানাডা","कनाडा"],"australia":["অস্ট্রেলিয়া","ऑस्ट्रेलिया"],"china":["চীন","चीन"],
      "japan":["জাপান","जापान"],"south korea":["দক্ষিণ কোরিয়া","दक्षिण कोरिया"],"germany":["জার্মানি","जर्मनी"],
      "france":["ফ্রান্স","फ्रांस"],"italy":["ইতালি","इटली"],"spain":["স্পেন","स्पेन"],"russia":["রাশিয়া","रूस"],
      "brazil":["ব্রাজিল","ब्राज़ील"],"south africa":["দক্ষিণ আফ্রিকা","दक्षिण अफ्रीका"],"nigeria":["নাইজেরিয়া","नाइजीरिया"],
      "egypt":["মিশর","मिस्र"],"saudi arabia":["সৌদি আরব","सऊदी अरब"],"united arab emirates":["সংযুক্ত আরব আমিরাত","संयुक्त अरब अमीरात"],
      "turkey":["তুরস্ক","तुर्की"],"indonesia":["ইন্দোনেশিয়া","इंडोनेशिया"],"malaysia":["মালয়েশিয়া","मलेशिया"],
      "singapore":["সিঙ্গাপুর","सिंगापुर"],"nepal":["নেপাল","नेपाल"],"sri lanka":["শ্রীলঙ্কা","श्रीलंका"],
      "afghanistan":["আফগানিস্তান","अफ़ग़ानिस्तान"],"iran":["ইরান","ईरान"],"iraq":["ইরাক","इराक"],
      "new zealand":["নিউজিল্যান্ড","न्यूज़ीलैंड"],"mexico":["মেক্সিকো","मेक्सिको"],"argentina":["আর্জেন্টিনা","अर्जेंटीना"],
      "sweden":["সুইডেন","स्वीडन"],"norway":["নরওয়ে","नॉर्वे"],"netherlands":["নেদারল্যান্ডস","नीदरलैंड"],
      "switzerland":["সুইজারল্যান্ড","स्विट्ज़रलैंड"],"ireland":["আয়ারল্যান্ড","आयरलैंड"],
      "thailand":["থাইল্যান্ড","थाईलैंड"],"vietnam":["ভিয়েতনাম","वियतनाम"]
    };
    const translated=names[String(country||"").trim().toLowerCase()];
    return language==="bn"&&translated?translated[0]:language==="hi"&&translated?translated[1]:String(country||"");
  }

  /* Render the saved Bengali, English or Hindi version selected by the visitor. */
  function applyLocalizedPostContent() {
    posts.forEach(post => {
      const translations = post.translations && typeof post.translations === "object" ? post.translations : {};
      const selected = translations[activeLanguage] || {};
      const fallback = translations[post.language] || {};
      const title = String(selected.title || fallback.title || post.canonicalTitle || post.title || "");
      const html = String(selected.content_html || fallback.content_html || post.canonicalContentHtml || post.contentHtml || "");
      const excerpt = String(selected.excerpt || (activeLanguage === post.language ? fallback.excerpt || post.canonicalExcerpt || post.excerpt || "" : ""));
      post.title = title;
      post.contentHtml = html;
      post.biographyPersonName = String(selected.person_name || (activeLanguage === post.language ? post.canonicalBiographyPersonName || post.biographyPersonName || "" : ""));
      post.biographyCountryDisplay = localizedBiographyCountry(post.biographyCountry, activeLanguage);
      const textNode = document.createElement("div");
      textNode.innerHTML = html;
      const plain = (textNode.textContent || "").replace(/\\s+/g," ").trim();
      post.body = plain ? [plain] : [];
      post.excerpt = excerpt || plain.slice(0,260);
    });
  }
  const categoryPathSlugs = {technology:"technology"};
  function categoryRouteSlug(post) { const key=post && post.category; return categoryPathSlugs[key] || routeSlug(categoryNames[key] || key || "articles"); }
  function siteBasePath() {
    /* GitHub Pages project site base. Keep this independent of the current article URL. */
    return "/health/";
  }
  function articleRoute(post, source = "") {
    const parts = [categoryRouteSlug(post),post.subcategory ? routeSlug(post.subcategory) : "",articleSlug(post)].filter(Boolean);
    const path = siteBasePath() + parts.map(part => encodeURIComponent(part)).join("/") + "/";
    return source === "most-read" ? path + "?source=most-read" : path;
  }
  function articleShareUrl(post) { return new URL(articleRoute(post),window.location.origin).toString(); }
  function shareButtons(post) {
    return '<div class="home-share-row" aria-label="Share article">' +
      '<button type="button" data-share="facebook" data-post-index="' + posts.indexOf(post) + '" aria-label="Share on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg></button>' +
      '<button type="button" data-share="x" data-post-index="' + posts.indexOf(post) + '" aria-label="Share on X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h4.5l11.5 18h-4.5L4 3Zm0 18 6.8-8.1m2.4-2.8L20 3"/></svg></button>' +
      '<button type="button" data-share="whatsapp" data-post-index="' + posts.indexOf(post) + '" aria-label="Share on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.5 2.3 2.2 4 4.5 4.5l1-1 2 1c-.3 1.2-1.2 2-2.5 2-3.7-.3-6.7-3.3-7-7 0-1.3.8-2.2 2-2.5l1 2-1 1Z"/></svg></button>' +
      '<button type="button" data-share="copy" data-post-index="' + posts.indexOf(post) + '" aria-label="Copy article link"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 15 15 9"/><path d="M8 12H6a4 4 0 0 1 0-8h5a4 4 0 0 1 4 4v1"/><path d="M16 12h2a4 4 0 0 1 0 8h-5a4 4 0 0 1-4-4v-1"/></svg></button>' +
      '</div>';
  }
  function renderHomeList(panel = homeListPanel, tabs = Array.from(document.querySelectorAll(".home-rail-tab:not(.article-home-rail-tab)")), excludePost = null) {
    const desktopLimit = window.matchMedia("(min-width: 801px)").matches ? 4 : 10;
    const latestItems = sortedByDate(posts.filter(post =>
      post !== excludePost && (post.postTypes || [post.postType || "latest"]).includes("latest")
    )).slice(0,desktopLimit);
    const popularItems = [...posts].filter(post => {
      const placements = post.postTypes || [post.postType || "latest"];
      // The homepage's Popular rail only includes stories also selected for Latest.
      // Popular-only stories remain inside their own category's Popular tab.
      return post !== excludePost && placements.includes("popular") && placements.includes("latest");
    }).sort((a,b) =>
      (Number(b.views)||0) - (Number(a.views)||0) ||
      (Number(b.publishedTimestamp)||new Date(b.date).getTime()||0) -
      (Number(a.publishedTimestamp)||new Date(a.date).getTime()||0)
    ).slice(0,desktopLimit);
    const items = homeListType === "popular" ? popularItems : latestItems;
    if (!panel) return;
    // Apply the compact image-and-title layout to both homepage Latest and Popular tabs.
    panel.classList.toggle("is-home-compact", panel === homeListPanel || panel.id === "categoryHomeListPanel");
    if (!items.length) {
      panel.innerHTML = '<div class="home-list-empty">' + (extendedUiCopy[activeLanguage] || extendedUiCopy.en)[homeListType === "popular" ? "emptyPopular" : "emptyLatest"] + '</div>';
    } else {
      panel.innerHTML = items.map(post => {
        const plainExcerpt = String(post.excerpt || (post.contentHtml || (post.body || []).join(" ")).replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ")).replace(/\s+/g," ").trim();
        const excerpt = plainExcerpt.length > 210 ? plainExcerpt.slice(0,207).trimEnd() + "…" : plainExcerpt;
        const stamp = Number(post.publishedTimestamp) || new Date(post.date).getTime();
        const dateTime = Number.isFinite(stamp) && stamp > 0
          ? new Date(stamp).toLocaleDateString(activeLanguage==="bn"?"bn-BD":activeLanguage==="hi"?"hi-IN":"en-US",{day:"numeric",month:"short",year:"numeric"}) + " · " + new Date(stamp).toLocaleTimeString(activeLanguage==="bn"?"bn-BD":activeLanguage==="hi"?"hi-IN":"en-US",{hour:"numeric",minute:"2-digit"})
          : String(post.date || "");
        return '<button class="home-list-item" type="button" data-open-post="' + posts.indexOf(post) + '">' +
          '<span class="home-list-heading"><span class="home-list-category">' + escapeHTML(categoryNames[post.category] || "Global Scope 24") + '</span><strong>' + escapeHTML(post.title) + '</strong></span>' +
          '<span class="home-list-summary-row">' +
            (imageForPost(post) ? '<span class="home-list-thumb"><img src="' + escapeHTML(imageForPost(post)) + '" alt="" loading="lazy"></span>' : '') +
            '<span class="home-list-excerpt">' + escapeHTML(excerpt) + '</span>' +
          '</span>' +
          '<time class="home-list-meta">' + escapeHTML(dateTime) + '</time>' +
        '</button>';
      }).join("");
    }
    tabs.forEach(button => {
      const selected = button.dataset.homeList === homeListType;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    const viewAll = $("#homeViewAll");
    if (viewAll) viewAll.innerHTML = (extendedUiCopy[activeLanguage] || extendedUiCopy.en).more + ' <span>→</span>';
  }
  let homeFeaturedIndex = 0;
  function renderHomeFeatured() {
    // The main homepage slider contains only posts explicitly assigned to Latest.
    // Popular-only posts must never enter this Latest feature.
    const stories = sortedByDate(posts.filter(post =>
      (post.postTypes || [post.postType || "latest"]).includes("latest")
    ));
    if (!stories.length) {
      homeFeatured.innerHTML = '<div class="home-feature-empty">Your latest published story will appear here.</div>';
      renderHomeSupportCards(null);
      return;
    }
    homeFeaturedIndex = ((homeFeaturedIndex % stories.length) + stories.length) % stories.length;
    const post = stories[homeFeaturedIndex];
    const index = posts.indexOf(post);
    const labels = extendedUiCopy[activeLanguage] || extendedUiCopy.en;
    const publishedDate = Number(post.publishedTimestamp)
      ? new Date(Number(post.publishedTimestamp))
      : null;
    const displayTime = publishedDate && !Number.isNaN(publishedDate.getTime())
      ? publishedDate.toLocaleTimeString(activeLanguage || "en", { hour: "numeric", minute: "2-digit" })
      : "";
    const image = imageForPost(post);
    // Restore the lead story summary using the saved excerpt or readable article text.
    const featurePlainText = String(post.excerpt || (post.contentHtml || (post.body || []).join(" ")))
      .replace(/<[^>]*>/g," ")
      .replace(/&nbsp;/g," ")
      .replace(/\s+/g," ")
      .trim();
    const featureExcerpt = featurePlainText.length > 320
      ? featurePlainText.slice(0,317).trimEnd() + "…"
      : featurePlainText;
    homeFeatured.innerHTML =
      '<div class="home-feature-slide">' +
      (image ? '<div class="home-feature-image" data-open-post="' + index + '" role="button" tabindex="0" aria-label="Open article: ' + escapeHTML(post.title) + '"><img src="' + escapeHTML(image) + '" alt="' + escapeHTML(post.title) + '" fetchpriority="high"></div>' : '') +
      '<div class="home-feature-content">' +
      '<h1 data-open-post="' + index + '" role="button" tabindex="0" aria-label="Open article: ' + escapeHTML(post.title) + '">' + escapeHTML(post.title) + '</h1>' +
      (featureExcerpt ? '<p class="home-feature-description">' + escapeHTML(featureExcerpt) + '</p>' : '') +
      '<div class="home-feature-meta"><time>' + escapeHTML(post.date) + (displayTime ? ' · ' + escapeHTML(displayTime) : '') + '</time></div></div></div>' +
      '<div class="home-feature-navigation" aria-label="Main story navigation">' +
      '<button type="button" class="home-feature-arrow" data-home-feature="previous">' + labels.previous + '</button>' +
      '<div class="home-feature-pagination" aria-label="Choose a story">' + stories.map((story,i) => '<button type="button" class="home-feature-dot' + (i === homeFeaturedIndex ? ' active' : '') + '" data-home-feature-index="' + i + '" aria-label="Go to story ' + (i+1) + '" aria-current="' + (i === homeFeaturedIndex ? 'true' : 'false') + '"></button>').join("") + '</div>' +
      '<button type="button" class="home-feature-arrow" data-home-feature="next">' + labels.next + '</button></div>';
    renderHomeSupportCards(post);
  }
  function renderHomeSupportCards(featuredPost) {
    const host = $("#homeSupportCards");
    if (!host) return;
    const stories = sortedByDate(posts.filter(post => post !== featuredPost && (post.postTypes || [post.postType || "latest"]).includes("latest"))).slice(0,2);
    host.innerHTML = stories.map(post => {
      const index = posts.indexOf(post), image = imageForPost(post);
      return '<button class="home-support-card" type="button" data-open-post="' + index + '">' + (image ? '<span class="home-support-image"><img src="' + escapeHTML(image) + '" alt="" loading="lazy"></span>' : '<span class="home-support-image home-support-image-empty"></span>') + '<strong>' + escapeHTML(post.title) + '</strong></button>';
    }).join("");
  }

  function renderMyChoice() {
    const section = $("#myChoiceSection"), host = $("#myChoiceList");
    if (!section || !host) return;
    const items = sortedByDate(posts.filter(post => (post.postTypes || [post.postType || "latest"]).includes("myChoice"))).slice(0,4);
    section.hidden = !items.length;
    if (!items.length) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = items.map(post => {
      const index = posts.indexOf(post), summary = post.excerpt || (post.body || []).join(" ").slice(0,120);
      return '<article class="my-choice-item"><button class="my-choice-open" type="button" data-open-post="' + index + '">' + (imageForPost(post) ? '<span class="my-choice-thumb"><img src="' + imageForPost(post) + '" alt="" loading="lazy"></span>' : '') + '<span class="my-choice-copy"><strong>' + escapeHTML(post.title) + '</strong>' + (summary ? '<small>' + escapeHTML(summary.slice(0,120)) + '</small>' : '') + '</span></button></article>';
    }).join("");
  }
  function renderFeaturedStories() {
    const grid = $("#featuredStoriesGrid");
    const count = $("#featuredStoriesCount");
    if (!grid) return;
    // Keep the editorial selection in publication order, with up to 40 cards.
    const items = posts.filter(post => post.featuredStories ?? post.featured).slice(0,20);
    if (count) count.textContent = items.length + " / 20";
    const renderItem = post => '<button class="featured-story-item" type="button" data-open-post="' + posts.indexOf(post) + '">' +
      (imageForPost(post) ? '<span class="featured-story-thumb"><img src="' + imageForPost(post) + '" alt="" loading="lazy"></span>' : '') +
      '<span class="featured-story-copy"><span class="featured-story-category">' + escapeHTML(categoryNames[post.category] || "Global Scope 24") + '</span><strong>' + escapeHTML(post.title) + '</strong><time>' + escapeHTML(post.date) + '</time></span></button>';
    grid.innerHTML = items.length ? items.map(renderItem).join("") : '<div class="featured-story-empty">No featured stories yet. Select “Featured Stories / Editor’s Choice” when publishing an article.</div>';
    const viewAll = $("#featuredStoriesViewAll");
    if (viewAll) viewAll.innerHTML = (extendedUiCopy[activeLanguage] || extendedUiCopy.en).featuredMore + ' <span>→</span>';
  }

  function renderTrendingStories() {
    const list = $("#trendingStoriesList");
    const section = $("#trendingSection");
    if (!list || !section) return;
    const items = trendingPosts
      .map(item => ({...item, post:posts.find(post => String(post.cmsId) === String(item.post_id))}))
      .filter(item => item.post)
      .slice(0,14);
    const title = $("#trendingStoriesTitle");
    if (title) title.textContent = "Most Read";
    list.innerHTML = items.length
      ? items.map((item,index) => '<button class="trending-story-link" type="button" data-open-post="' + posts.indexOf(item.post) + '" data-open-source="most-read"><span class="trending-story-rank">' + String(index+1).padStart(2,"0") + '</span><span class="trending-story-title">' + escapeHTML(item.post.title) + '</span><span class="trending-story-arrow" aria-hidden="true">↗</span></button>').join("")
      : "";
  }

  /* Manually curated Trending is independent from the automatic Most Read ranking. */
  function renderManualTrendingStories() {
    const list = $("#manualTrendingList");
    const section = manualTrendingSection;
    if (!list || !section) return;
    const items = sortedByDate(posts.filter(post =>
      (Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"]).includes("trending")
    ));
    section.hidden = !items.length;
    list.innerHTML = items.map(post =>
      '<button class="trending-story-link" type="button" data-open-post="' + posts.indexOf(post) + '">' +
      '<span class="trending-story-title">' + escapeHTML(post.title) + '</span></button>'
    ).join("");
  }

  function renderArticleRecommendations() {
    return '<section class="article-below-lists" aria-label="More articles">' +
      '<div class="home-rail-card">' +
        '<div class="home-rail-heading"><div class="home-rail-tabs" role="tablist" aria-label="More articles">' +
          '<button class="home-rail-tab article-home-rail-tab active" type="button" role="tab" aria-selected="true" data-home-list="latest">Latest</button>' +
          '<button class="home-rail-tab article-home-rail-tab" type="button" role="tab" aria-selected="false" data-home-list="popular">Popular</button>' +
        '</div></div>' +
        '<div class="home-list-panel" id="articleHomeListPanel" role="list" tabindex="0"></div>' +
      '</div>' +
    '</section>';
  }

  function openArticleDetail(post) {
    if (!post || !singleArticleView) return;
    currentArticlePost = post;
    recordArticleView(post);
    const rawSourceHtml = post.contentHtml || (post.body || []).map(line => "<p>" + escapeHTML(line) + "</p>").join("");
    const sourceHtml = window.DOMPurify ? DOMPurify.sanitize(rawSourceHtml,{USE_PROFILES:{html:true},ADD_ATTR:["target","style","width","height","loading"]}) : rawSourceHtml;
    const categoryLabel = categoryNames[post.category] || post.category || "Global Scope 24";
    const subcategoryLabel = post.subcategory ? post.subcategory.replace(/-/g," ") : "";
    // Biography uses the exact same article template as every other category.
    // Only its optional person metadata is added inside the shared heading.
    const biographyLabels = {
      en:{person:"Person",profession:"Profession",country:"Country",types:{scientist:"Scientist",actor:"Actor",athlete:"Athlete",writer:"Writer",entrepreneur:"Entrepreneur",leader:"Leader",artist:"Artist",inventor:"Inventor",activist:"Activist",other:"Other"}},
      bn:{person:"ব্যক্তি",profession:"পেশা",country:"দেশ",types:{scientist:"বিজ্ঞানী",actor:"অভিনেতা",athlete:"ক্রীড়াবিদ",writer:"লেখক",entrepreneur:"উদ্যোক্তা",leader:"নেতা",artist:"শিল্পী",inventor:"উদ্ভাবক",activist:"কর্মী",other:"অন্যান্য"}},
      hi:{person:"व्यक्ति",profession:"पेशा",country:"देश",types:{scientist:"वैज्ञानिक",actor:"अभिनेता",athlete:"खिलाड़ी",writer:"लेखक",entrepreneur:"उद्यमी",leader:"नेता",artist:"कलाकार",inventor:"आविष्कारक",activist:"कार्यकर्ता",other:"अन्य"}}
    };
    const biographyCopy = biographyLabels[activeLanguage] || biographyLabels.en;
    const biographyTypeLabel = post.biographyPersonType
      ? (biographyCopy.types[post.biographyPersonType] || post.biographyPersonType.replace(/-/g," ").replace(/\b\w/g,letter=>letter.toUpperCase()))
      : "";
    const biographyMetadata = post.category === "biography"
      ? '<div class="single-article-biography-meta">' +
          (post.biographyPersonName ? '<span><strong>' + biographyCopy.person + '</strong> ' + escapeHTML(post.biographyPersonName) + '</span>' : '') +
          (biographyTypeLabel ? '<span><strong>' + biographyCopy.profession + '</strong> ' + escapeHTML(biographyTypeLabel) + '</span>' : '') +
          (post.biographyCountry ? '<span><strong>' + biographyCopy.country + '</strong> ' + escapeHTML(post.biographyCountryDisplay || post.biographyCountry) + '</span>' : '') +
        '</div>'
      : "";
    const paragraphs = sourceHtml;
    singleArticleView.innerHTML =
      '<article class="single-article container">' +
        '<div class="single-article-heading">' +
          '<div class="single-article-category">' + escapeHTML(categoryLabel) + (subcategoryLabel ? ' <span>›</span> ' + escapeHTML(subcategoryLabel) : '') + '</div>' +
          biographyMetadata +
          '<h1>' + escapeHTML(post.title) + '</h1>' +
          '<div class="single-article-meta"><time>' + escapeHTML(post.date || "") + (post.time ? ' · ' + escapeHTML(post.time) : '') + '</time></div>' +
        '</div>' +
        (imageForPost(post) ? '<img class="single-article-cover" src="' + escapeHTML(imageForPost(post)) + '" alt="' + escapeHTML(post.title) + '">' : '') +
        shareButtons(post) +
        '<div class="single-article-body" id="singleArticleBody">' + paragraphs + '</div>' +
      '</article>' +
      renderArticleRecommendations();
    renderHomeList($("#articleHomeListPanel"), Array.from(document.querySelectorAll(".article-home-rail-tab")), post);
    singleArticleView.hidden = false;
    if (pageLayout) pageLayout.classList.add("article-page-active");
    if (homeSection) homeSection.hidden = true;
    if (latestPostsSection) latestPostsSection.hidden = true;
    if (articleSection) articleSection.hidden = true;
    // Keep the shared site frame and the surrounding homepage sections visible
    // while the selected article replaces only the central content area.
    const entertainmentSection = $("#entertainmentFeatureSection");
    const homeCategorySections = $("#homeCategorySections");
    const worldNewsSection = $("#homeWorldSection");
    if (worldNewsSection) worldNewsSection.hidden = true;
    if (entertainmentSection) entertainmentSection.hidden = true;
    if (homeCategorySections) homeCategorySections.hidden = true;
    if (featuredStoriesSection) featuredStoriesSection.hidden = false;
    if (trendingSection) trendingSection.hidden = false;
    if (manualTrendingSection) manualTrendingSection.hidden = false;
    if (aboutSection) aboutSection.hidden = false;
    if (categorySection) categorySection.hidden = false;
    if (topAdSlot) topAdSlot.hidden = false;
    document.title = post.title + " | Global Scope 24";
    const description = String(post.metaDescription || post.excerpt || (post.contentHtml || "").replace(/<[^>]*>/g," ").replace(/\s+/g," ")).trim().slice(0,320);
    if(post.metaTitle) document.title = post.metaTitle + " | Global Scope 24";
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag && description) descriptionTag.setAttribute("content",description);
    window.scrollTo(0,0);
  }
  /* Return from an open article to its category feed before another category is rendered. */
  function closeArticleViewForCategoryNavigation() {
    if (singleArticleView) singleArticleView.hidden = true;
    if (pageLayout) pageLayout.classList.remove("article-page-active");
    currentArticlePost = null;
    history.replaceState({
      globalScopeCategory:true,
      category:activeCategory,
      subcategory:activeSubcategory
    }, "", siteBasePath());
  }

  function saveCurrentCategoryHistoryState() {
    history.replaceState({
      globalScopeCategory:true,
      category:activeCategory,
      subcategory:activeSubcategory
    }, "", siteBasePath());
  }

  /* Open article content inside the existing site layout instead of navigating to a detached page. */
  function openArticleInCurrentLayout(post, source = "") {
    if (!post) return;
    activeCategory = post.category || activeCategory || "";
    activeSubcategory = post.subcategory || "";
    activePostType = "latest";
    showHomeFeed = false;
    showFeaturedFeed = false;
    searchTerm = "";
    currentPage = 1;
    render();
    history.replaceState({
      globalScopeCategory:true,
      category:activeCategory,
      subcategory:activeSubcategory
    }, "", siteBasePath());
    history.pushState({globalScopeArticle:true}, "", articleRoute(post, source));
    openArticleDetail(post);
  }

  /* Browser Back restores the category feed; Forward restores the selected article. */
  window.addEventListener("popstate", event => {
    if (event.state && event.state.globalScopeArticle) {
      const slug = requestedArticleSlug();
      const post = posts.find(item => articleSlugMatches(item, slug));
      if (post) openArticleDetail(post);
      return;
    }
    if (singleArticleView) singleArticleView.hidden = true;
    if (pageLayout) pageLayout.classList.remove("article-page-active");
    currentArticlePost = null;
    if (event.state && event.state.globalScopeCategory) {
      activeCategory = event.state.category || activeCategory;
      activeSubcategory = event.state.subcategory || "";
      showHomeFeed = false;
      showFeaturedFeed = false;
      activePostType = "latest";
      currentPage = 1;
    }
    render();
  });


  /* Reuse the exact homepage Latest/Popular rail on category pages.
     The shared renderer supplies the same global, automatically updated lists. */
  function renderCategoryLatestPopularSections() {
    const ui = extendedUiCopy[activeLanguage] || extendedUiCopy.en;
    return '<section class="category-home-rail article-below-lists" aria-label="Latest and Popular">' +
      '<div class="home-rail-card">' +
        '<div class="home-rail-heading"><div class="home-rail-tabs" role="tablist" aria-label="Latest and Popular">' +
          '<button class="home-rail-tab category-home-rail-tab active" type="button" role="tab" aria-selected="true" data-home-list="latest">Latest</button>' +
          '<button class="home-rail-tab category-home-rail-tab" type="button" role="tab" aria-selected="false" data-home-list="popular">Popular</button>' +
        '</div></div>' +
        '<div class="home-list-panel" id="categoryHomeListPanel" role="list" tabindex="0"></div>' +
        '<button class="home-view-all" id="categoryHomeViewAll" type="button">' + escapeHTML(ui.more) + ' <span>→</span></button>' +
      '</div>' +
    '</section>';
  }

  function render() {
    const isHomeLanding = activeCategory === "home" && !searchTerm && !showHomeFeed;
    if (trendingSection) trendingSection.hidden = !isHomeLanding;
    if (manualTrendingSection) manualTrendingSection.hidden = !isHomeLanding;
    // Featured Stories is a dedicated homepage section, not part of category feeds.
    if (featuredStoriesSection) featuredStoriesSection.hidden = !isHomeLanding;
    homeSection.hidden = !isHomeLanding;
    if (latestPostsSection) {
      latestPostsSection.hidden = !isHomeLanding;
      if (!isHomeLanding) latestPostsSection.style.removeProperty("height");
    }
    articleSection.hidden = isHomeLanding;
    const scienceTechSection = $("#scienceTechSection");
    const entertainmentSection = $("#entertainmentFeatureSection");
    const homeCategorySections = $("#homeCategorySections");
    const worldNewsSection = $("#homeWorldSection");
    const lifestyleHomeSection = $("#homeLifestyleSection");
    const sportsHomeSection = $("#homeSportsSection");
    if (worldNewsSection) worldNewsSection.hidden = !isHomeLanding;
    // These two homepage sections sit outside #homeCategorySections,
    // so hide them explicitly whenever a category or subcategory feed is open.
    if (lifestyleHomeSection) lifestyleHomeSection.hidden = !isHomeLanding;
    if (sportsHomeSection) sportsHomeSection.hidden = !isHomeLanding;
    if (scienceTechSection) scienceTechSection.hidden = !isHomeLanding;
    if (entertainmentSection) entertainmentSection.hidden = !isHomeLanding;
    if (homeCategorySections) homeCategorySections.hidden = !isHomeLanding;
    const categoryMatches = post => (activeCategory === "home" || post.category === activeCategory) &&
      (!activeSubcategory || post.subcategory === activeSubcategory);
    const placementMatches = post => {
      const placements = Array.isArray(post.postTypes) ? post.postTypes : [post.postType || "latest"];
      // Both homepage and category feeds respect the editor's explicit placement.
      // A Popular-only article belongs in its category's Popular tab, not Latest.
      return activePostType === "mostViewed" || placements.includes(activePostType);
    };
    const categoryPosts = posts
      .filter(post => showFeaturedFeed ? !!(post.featuredStories ?? post.featured) : categoryMatches(post) && (activeCategory === "biography" || placementMatches(post)))
      .filter(post => activeCategory !== "biography" || biographyPostMatches(post))
      .filter(post => !searchTerm || (post.title + " " + (post.body || []).join(" ") + " " + (post.excerpt || "") + " " + (post.keywords || []).join(" ")).toLowerCase().includes(searchTerm))
      .sort((a,b) => {
        if (showFeaturedFeed) return (Number(b.publishedTimestamp)||new Date(b.date).getTime()||0) - (Number(a.publishedTimestamp)||new Date(a.date).getTime()||0);
        if (activePostType === "mostViewed" || activePostType === "popular") return (Number(b.views)||0) - (Number(a.views)||0) || (Number(b.publishedTimestamp)||new Date(b.date).getTime()||0) - (Number(a.publishedTimestamp)||new Date(a.date).getTime()||0);
        return (Number(b.publishedTimestamp)||new Date(b.date).getTime()||0) - (Number(a.publishedTimestamp)||new Date(a.date).getTime()||0);
      });
    // Category landing pages show the nine fixed editorial slots plus every remaining post below.
    const visiblePosts = categoryPosts;
    const t = languageCopy[activeLanguage];
    const activeSubcategoryButton = activeSubcategory ? Array.from(document.querySelectorAll("[data-sports-subcategory], [data-entertainment-subcategory], [data-world-subcategory], [data-lifestyle-subcategory]")).find(button => ["data-sports-subcategory","data-entertainment-subcategory","data-world-subcategory","data-lifestyle-subcategory"].some(attribute => button.getAttribute(attribute) === activeSubcategory)) : null;
    const activeCategoryLabel = activeSubcategoryButton?.textContent.trim() || activeSubcategory.replace(/-/g," ") || t.categories[activeCategory] || "Home";
    const biographyPanel=$("#biographyFilterPanel");
    if(biographyPanel) biographyPanel.hidden=activeCategory!=="biography";
    const postTypeSwitcher=$("#articleFeed .post-type-switcher");
    if(postTypeSwitcher) postTypeSwitcher.hidden=activeCategory==="biography";
    if(activeCategory==="biography") refreshBiographyNameOptions();
    const feedEyebrow = $("#articleFeed .eyebrow");
    if (feedEyebrow) {
      const mainCategoryLabel = t.categories[activeCategory] || activeCategory;
      const categoryBreadcrumb = activeSubcategory
        ? mainCategoryLabel + " / " + activeCategoryLabel
        : mainCategoryLabel;
      feedEyebrow.textContent = isHomeLanding
        ? t.stories
        : (showFeaturedFeed ? (extendedUiCopy[activeLanguage] || extendedUiCopy.en).featuredStories : categoryBreadcrumb);
    }
    $("#activeCategoryTitle").textContent = showFeaturedFeed ? (extendedUiCopy[activeLanguage] || extendedUiCopy.en).featuredStories : activeCategoryLabel;
    $("#feedDescription").textContent = searchTerm
      ? "Search results in " + (t.categories[activeCategory] || "this category") + "."
       : (showFeaturedFeed ? (extendedUiCopy[activeLanguage] || extendedUiCopy.en).featuredDescription : t.description);

    if (isHomeLanding) {
      renderHomeFeatured();
      renderHomeList();
      renderLatestPostsSection();
      renderScienceTechSection();
      renderEntertainmentFeature();
      renderHomeCategorySections();
      renderFeaturedStories();
      renderTrendingStories();
      renderManualTrendingStories();
      renderMyChoice();
      return;
    }
    /* Category and subcategory pages always render all nine editorial slots.
       Missing posts become non-clickable placeholders so the layout never collapses. */
    const renderCategoryCard = (post, className) => {
      if (!post) {
        return '<div class="category-editorial-card category-editorial-placeholder ' + className + '" aria-hidden="true">' +
          '<span class="category-editorial-image category-editorial-image-empty"></span>' +
          '<strong>&nbsp;</strong>' +
        '</div>';
      }
      const postIndex = posts.indexOf(post);
      const image = imageForPost(post);
      return '<button class="category-editorial-card ' + className + '" type="button" data-open-post="' + postIndex + '">' +
        (image
          ? '<span class="category-editorial-image"><img src="' + escapeHTML(image) + '" alt="' + escapeHTML(post.title) + '" loading="lazy"></span>'
          : '<span class="category-editorial-image category-editorial-image-empty"></span>') +
        '<strong>' + escapeHTML(post.title) + '</strong>' +
      '</button>';
    };
    const leftPosts = Array.from({length:3}, (_, index) => visiblePosts[index] || null);
    const leadPost = visiblePosts[3] || null;
    const centerBottomPosts = [visiblePosts[4] || null, visiblePosts[5] || null];
    const rightPosts = [visiblePosts[6] || null, visiblePosts[7] || null, visiblePosts[8] || null];
    const remainingPosts = visiblePosts.slice(9);
    const renderMobileCategoryPost = (post, index, isFirst = false) => {
      if (!post) return "";
      const postIndex = posts.indexOf(post);
      const image = imageForPost(post);
      const rawSummary = String(post.excerpt || (post.contentHtml || (post.body || []).join(" ")).replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ")).replace(/\s+/g," ").trim();
      const summary = rawSummary.length > 150 ? rawSummary.slice(0,147).trimEnd() + "…" : rawSummary;
      return '<button class="category-mobile-post' + (isFirst ? ' category-mobile-lead' : ' category-mobile-list-item') + '" type="button" data-open-post="' + postIndex + '">' +
        (image
          ? '<span class="category-mobile-image"><img src="' + escapeHTML(image) + '" alt="' + escapeHTML(post.title) + '" loading="lazy"></span>'
          : '<span class="category-mobile-image category-editorial-image-empty"></span>') +
        '<span class="category-mobile-copy">' +
          (isFirst ? '' : '<small class="category-mobile-number">' + String(index + 1).padStart(2,"0") + '</small>') +
          '<strong>' + escapeHTML(post.title) + '</strong>' +
          (summary ? '<span class="category-mobile-summary">' + escapeHTML(summary) + '</span>' : '') +
        '</span>' +
      '</button>';
    };
    if (activeCategory === "biography") {
      // Biography reuses the homepage World News editorial layout:
      // one lead story on the left, the remaining biographies on the right,
      // and the shared image carousel underneath. Header and filters stay unchanged.
      articleList.innerHTML =
        '<div class="biography-home-editorial" id="biographyHomeEditorial"></div>' +
        renderCategoryLatestPopularSections();
      const biographyEditorialHost = $("#biographyHomeEditorial");
      if (biographyEditorialHost) {
        renderHomeEditorialSection(visiblePosts, biographyEditorialHost, "biography");
      }
    } else {
      articleList.innerHTML =
        '<div class="category-editorial-grid">' +
          '<div class="category-editorial-side category-editorial-left">' +
            leftPosts.map(post => renderCategoryCard(post,"category-editorial-side-card")).join("") +
          '</div>' +
          '<div class="category-editorial-center">' +
            renderCategoryCard(leadPost,"category-editorial-lead-card") +
            '<div class="category-editorial-bottom">' +
              centerBottomPosts.map(post => renderCategoryCard(post,"category-editorial-bottom-card")).join("") +
            '</div>' +
          '</div>' +
          '<div class="category-editorial-side category-editorial-right">' +
            rightPosts.map(post => renderCategoryCard(post,"category-editorial-side-card")).join("") +
          '</div>' +
        '</div>' +
        (remainingPosts.length
          ? '<div class="category-more-grid">' +
              remainingPosts.map(post => renderCategoryCard(post,"category-more-card")).join("") +
            '</div>'
          : '') +
        '<div class="category-mobile-layout">' +
          (visiblePosts.length ? renderMobileCategoryPost(visiblePosts[0],0,true) : '') +
          (visiblePosts.length > 1
            ? '<div class="category-mobile-list">' + visiblePosts.slice(1).map((post,index) => renderMobileCategoryPost(post,index + 1)).join("") + '</div>'
            : '') +
        '</div>' +
        renderCategoryLatestPopularSections();
    }
    const categoryHomePanel = $("#categoryHomeListPanel");
    if (categoryHomePanel) {
      renderHomeList(categoryHomePanel, Array.from(document.querySelectorAll(".category-home-rail-tab")));
    }
    // All filtered category posts are shown together, so pagination is not needed here.
    const pagination = document.querySelector(".pagination");
    if (pagination) pagination.style.display = "none";
  }

  /* Delegated controls also cover the category and article rails created dynamically. */
  document.addEventListener("click", event => {
    const button = event.target.closest(".home-rail-tab");
    if (button) {
      homeListType = button.dataset.homeList;
      homeListIndex = 0;
      const articleList = button.classList.contains("article-home-rail-tab");
      const categoryList = button.classList.contains("category-home-rail-tab");
      const panel = articleList ? $("#articleHomeListPanel") : categoryList ? $("#categoryHomeListPanel") : homeListPanel;
      const tabs = articleList
        ? Array.from(document.querySelectorAll(".article-home-rail-tab"))
        : categoryList
          ? Array.from(document.querySelectorAll(".category-home-rail-tab"))
          : Array.from(document.querySelectorAll(".home-rail-tab:not(.article-home-rail-tab):not(.category-home-rail-tab)"));
      renderHomeList(panel, tabs, articleList ? currentArticlePost : null);
      return;
    }
    if (event.target.closest("#categoryHomeViewAll")) {
      showFeaturedFeed = false;
      activeCategory = "home";
      activeSubcategory = "";
      activePostType = homeListType === "popular" ? "popular" : "latest";
      showHomeFeed = true;
      currentPage = 1;
      render();
      $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
    }
  });
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
      if (post) openArticleInCurrentLayout(post, articleTrigger.dataset.openSource);
    }
  });
  document.addEventListener("click", event => {
    const categoryViewAll = event.target.closest("[data-home-category-view]");
    if (categoryViewAll) {
      const category = categoryViewAll.dataset.homeCategoryView;
      const subcategory = categoryViewAll.dataset.homeSubcategoryView || "";
      const target = subcategory
        ? document.querySelector('.sidebar-submenu button[data-sidebar-category="' + category + '"][data-sidebar-subcategory="' + subcategory + '"]')
        : document.querySelector('.sidebar-category[data-category="' + category + '"]');
      if (target) target.click();
      if (category === "entertainment" || category === "sports") {
        const categoryFeed = $("#articleFeed");
        if (categoryFeed) categoryFeed.scrollIntoView({behavior:"smooth",block:"start"});
      }
    }
    const featureArrow = event.target.closest("[data-home-feature]");
    const featureDot = event.target.closest("[data-home-feature-index]");
    if (featureArrow || featureDot) {
      const storyCount = sortedByDate(posts).length;
      if (storyCount) {
        if (featureDot) homeFeaturedIndex = Number(featureDot.dataset.homeFeatureIndex) || 0;
        else homeFeaturedIndex = (homeFeaturedIndex + (featureArrow.dataset.homeFeature === "next" ? 1 : -1) + storyCount) % storyCount;
        renderHomeFeatured();
      }
    }
    const openButton = event.target.closest("[data-open-post]");
    if (openButton) {
      const post = posts[Number(openButton.dataset.openPost)];
      if (post) openArticleInCurrentLayout(post, openButton.dataset.openSource);
    }
    const shareButton = event.target.closest("[data-share]");
    if (shareButton) {
      const post = posts[Number(shareButton.dataset.postIndex)];
      if (!post) return;
      const url = articleShareUrl(post);
      const text = encodeURIComponent(post.title + " — Global Scope 24");
      const target = shareButton.dataset.share;
      if (target === "facebook") window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),"_blank","noopener,noreferrer");
      else if (target === "x") window.open("https://twitter.com/intent/tweet?text=" + text + "&url=" + encodeURIComponent(url),"_blank","noopener,noreferrer");
      else if (target === "whatsapp") window.open("https://wa.me/?text=" + text + "%20" + encodeURIComponent(url),"_blank","noopener,noreferrer");
      else if (target === "copy" && navigator.clipboard) navigator.clipboard.writeText(url).then(() => { shareButton.classList.add("copied"); shareButton.setAttribute("aria-label","Link copied"); }).catch(() => {});
    }
  });

  
  /*
   * Shared route for top navigation, dropdowns, and the mobile category drawer.
   * Homepage section selectors remain independent section filters.
   */
  function navigateToCategory(category, subcategory = "") {
    if (!category) return;
    closeArticleViewForCategoryNavigation();
    activeCategory = category;
    activeSubcategory = subcategory || "";
    showHomeFeed = false;
    showFeaturedFeed = false;
    activePostType = "latest";
    currentPage = 1;
    searchTerm = "";
    saveCurrentCategoryHistoryState();

    const searchInput = $("#siteSearch");
    if (searchInput) searchInput.value = "";
    document.querySelectorAll(".post-type-option").forEach(option => {
      const selected = option.dataset.postType === activePostType;
      option.classList.toggle("active", selected);
      option.setAttribute("aria-pressed", String(selected));
    });

    document.querySelectorAll(".category-tab, .sidebar-category").forEach(button => {
      const selected = button.dataset.category === activeCategory &&
        (button.dataset.subcategory || "") === activeSubcategory;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    document.querySelectorAll(".sports-category-trigger,.entertainment-category-trigger,.world-category-trigger,.lifestyle-category-trigger")
      .forEach(trigger => {
        const selected = trigger.dataset.category === activeCategory;
        trigger.classList.toggle("active", selected);
        trigger.setAttribute("aria-expanded", "false");
      });

    document.querySelectorAll(".sports-submenu,.entertainment-submenu,.world-submenu,.lifestyle-submenu")
      .forEach(menu => {
        menu.classList.remove("is-open");
        menu.hidden = true;
        menu.style.maxHeight = "0px";
        menu.querySelectorAll("button").forEach(item => {
          const attribute = Array.from(item.attributes).find(attr => attr.name.endsWith("-subcategory"));
          const selected = Boolean(attribute && attribute.value === activeSubcategory);
          item.classList.toggle("active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
      });

    const drawer = $("#mainNav");
    if (drawer) {
      drawer.querySelectorAll(".sidebar-submenu").forEach(panel => { panel.hidden = true; });
      drawer.querySelectorAll(".sidebar-submenu-toggle").forEach(toggle => toggle.setAttribute("aria-expanded", "false"));
      drawer.querySelectorAll(".sidebar-submenu button").forEach(button => {
        const selected = button.dataset.sidebarCategory === activeCategory &&
          (button.dataset.sidebarSubcategory || "") === activeSubcategory;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      drawer.classList.remove("open");
    }
    document.body.classList.remove("menu-open");
    const menuToggle = $("#menuToggle");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open categories");
    }

    render();
    const categoryFeed = $("#articleFeed");
    if (categoryFeed) categoryFeed.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setupSubcategoryMenu(triggerSelector, submenuSelector, category, dataSelector, dataAttribute) {
    const trigger = document.querySelector(triggerSelector);
    const submenu = document.querySelector(submenuSelector);
    if (!trigger || !submenu) return;

    const setOpen = open => {
      if (open) {
        document.querySelectorAll(".sports-submenu,.entertainment-submenu,.world-submenu,.lifestyle-submenu")
          .forEach(menu => {
            if (menu === submenu) return;
            menu.classList.remove("is-open");
            menu.hidden = true;
            menu.style.maxHeight = "0px";
            const otherTrigger = menu.parentElement.querySelector("button[aria-expanded]");
            if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          });
        submenu.hidden = false;
        submenu.style.maxHeight = "0px";
        submenu.classList.add("is-open");
        requestAnimationFrame(() => {
          const styles = window.getComputedStyle(submenu);
          const borderHeight = (parseFloat(styles.borderTopWidth) || 0) +
            (parseFloat(styles.borderBottomWidth) || 0);
          submenu.style.maxHeight = (submenu.scrollHeight + borderHeight) + "px";
        });
      } else {
        submenu.classList.remove("is-open");
        submenu.style.maxHeight = submenu.scrollHeight + "px";
        requestAnimationFrame(() => { submenu.style.maxHeight = "0px"; });
        window.setTimeout(() => {
          if (!submenu.classList.contains("is-open")) submenu.hidden = true;
        }, 240);
      }
      trigger.setAttribute("aria-expanded", String(open));
    };

    trigger.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(submenu.hidden);
    });
    submenu.addEventListener("click", event => {
      const choice = event.target.closest(dataSelector);
      if (!choice) return;
      event.preventDefault();
      event.stopPropagation();
      navigateToCategory(category, choice.getAttribute(dataAttribute) || "");
    });
    document.addEventListener("click", event => {
      if (!event.target.closest("." + trigger.parentElement.classList[0]) && !submenu.hidden) setOpen(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !submenu.hidden) setOpen(false);
    });
  }

  setupSubcategoryMenu(".world-category-trigger", "#worldSubmenu", "world", "[data-world-subcategory]", "data-world-subcategory");
  setupSubcategoryMenu(".sports-category-trigger", "#sportsSubmenu", "sports", "[data-sports-subcategory]", "data-sports-subcategory");
  setupSubcategoryMenu(".entertainment-category-trigger", "#entertainmentSubmenu", "entertainment", "[data-entertainment-subcategory]", "data-entertainment-subcategory");
  setupSubcategoryMenu(".lifestyle-category-trigger", "#lifestyleSubmenu", "lifestyle", "[data-lifestyle-subcategory]", "data-lifestyle-subcategory");

  // Homepage dropdowns filter only their own homepage sections.
  const homeWorldSelect = $("#homeWorldSubcategorySelect");
  if (homeWorldSelect) {
    homeWorldSelect.addEventListener("change", () => {
      activeHomeWorldSubcategory = homeWorldSelect.value || "";
      document.querySelectorAll("#worldSubmenu [data-world-subcategory]").forEach(item => {
        const selected = item.dataset.worldSubcategory === activeHomeWorldSubcategory;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderHomeCategorySections();
    });
  }

  const homeLifestyleSelect = $("#homeLifestyleSubcategorySelect");
  if (homeLifestyleSelect) {
    homeLifestyleSelect.addEventListener("change", () => {
      activeHomeLifestyleSubcategory = homeLifestyleSelect.value || "";
      document.querySelectorAll("#lifestyleSubmenu [data-lifestyle-subcategory]").forEach(item => {
        const selected = item.dataset.lifestyleSubcategory === activeHomeLifestyleSubcategory;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderHomeCategorySections();
    });
  }

  /* Mobile category drawer uses the same category route. */
  const categoryDrawer = $("#mainNav");
  if (categoryDrawer) {
    categoryDrawer.addEventListener("click", event => {
      const toggle = event.target.closest(".sidebar-submenu-toggle");
      if (toggle) {
        event.preventDefault();
        event.stopPropagation();
        const submenu = document.getElementById(toggle.getAttribute("aria-controls"));
        if (!submenu) return;
        const willOpen = submenu.hidden;
        categoryDrawer.querySelectorAll(".sidebar-submenu").forEach(panel => { panel.hidden = true; });
        categoryDrawer.querySelectorAll(".sidebar-submenu-toggle").forEach(button => button.setAttribute("aria-expanded", "false"));
        submenu.hidden = !willOpen;
        toggle.setAttribute("aria-expanded", String(willOpen));
        return;
      }
      const choice = event.target.closest("[data-sidebar-category][data-sidebar-subcategory]");
      if (choice) {
        event.preventDefault();
        navigateToCategory(choice.dataset.sidebarCategory, choice.dataset.sidebarSubcategory || "");
      }
    });
  }

  /* Main category tabs and sidebar category names use the same route. */
  document.querySelectorAll(
    ".category-tab:not(.sports-category-trigger):not(.entertainment-category-trigger):not(.world-category-trigger):not(.lifestyle-category-trigger), .sidebar-category"
  ).forEach(button => {
    button.addEventListener("click", () => navigateToCategory(button.dataset.category, button.dataset.subcategory || ""));
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
  const moreCategoriesButton = $("#moreCategoriesTab");
  const closeCategoryMenu = () => {
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open categories");
    if (moreCategoriesButton) moreCategoriesButton.setAttribute("aria-expanded", "false");
  };
  if (moreCategoriesButton) {
    moreCategoriesButton.addEventListener("click", () => {
      const open = !menu.classList.contains("open");
      menu.classList.toggle("open", open);
      document.body.classList.toggle("menu-open", open);
      moreCategoriesButton.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close categories" : "Open categories");
    });
  }
  menuToggle.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close categories" : "Open categories");
    if (moreCategoriesButton) moreCategoriesButton.setAttribute("aria-expanded", String(open));
  });
  menuClose.addEventListener("click", closeCategoryMenu);
  document.addEventListener("click", event => {
    if (menu.classList.contains("open") && !menu.contains(event.target) && !menuToggle.contains(event.target) && !(moreCategoriesButton && moreCategoriesButton.contains(event.target))) {
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
    applyLocalizedPostContent();
    render();
    if (currentArticlePost) {
      const refreshedPost = posts.find(post => post.cmsId === currentArticlePost.cmsId);
      if (refreshedPost) {
        openArticleDetail(refreshedPost);
        /* Keep the same article open, but replace its URL with this language's title slug. */
        history.replaceState({globalScopeArticle:true}, "", articleRoute(refreshedPost));
      }
    }
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
  const routeParam = new URLSearchParams(window.location.search).get("route");
  if (routeParam) {
    const routeParts = routeParam.split("?")[0].split("/").filter(Boolean).map(part => decodeURIComponent(part));
    if (routeParts.length) history.replaceState(null,"",siteBasePath() + routeParts.map(part => encodeURIComponent(part)).join("/") + "/");
  }
  function requestedArticleRouteParts() {
    const routeParam = new URLSearchParams(window.location.search).get("route");
    if (routeParam) return routeParam.split("?")[0].split("/").filter(Boolean).map(part => decodeURIComponent(part));
    const parts = window.location.pathname.split("/").filter(Boolean);
    const baseParts = siteBasePath().split("/").filter(Boolean);
    return parts.slice(baseParts.length).map(part => decodeURIComponent(part));
  }
  function requestedArticleSlug() {
    const parts = requestedArticleRouteParts();
    return parts.length >= 2 ? parts[parts.length - 1] : "";
  }

  function getTrendingVisitorId() {
    const key = "gs24-trending-visitor";
    try {
      let id = localStorage.getItem(key);
      if (!id) {
        id = window.crypto && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, char => {
              const random = Math.random() * 16 | 0;
              return (char === "x" ? random : (random & 3 | 8)).toString(16);
            });
        localStorage.setItem(key,id);
      }
      return id;
    } catch (_) {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, char => {
        const random = Math.random() * 16 | 0;
        return (char === "x" ? random : (random & 3 | 8)).toString(16);
      });
    }
  }

  async function refreshTrendingStories() {
    if (!publicSupabaseClient) return;
    const {data,error} = await publicSupabaseClient.rpc("get_most_read_posts");
    if (error) {
      console.warn("Most Read data is not available yet. Run supabase/most_read_views.sql:",error.message);
      trendingPosts = [];
    } else {
      trendingPosts = Array.isArray(data) ? data : [];
    }
    renderTrendingStories();
  }

  function recordArticleView(post) {
    if (!publicSupabaseClient || !post || !post.cmsId) return;
    publicSupabaseClient.rpc("record_post_view",{
      p_post_id:String(post.cmsId),
      p_visitor_id:getTrendingVisitorId()
    }).then(({error}) => {
      if (error) {
        console.warn("Could not record article view. Run supabase/most_read_views.sql:",error.message);
        return;
      }
      refreshTrendingStories();
    });
  }

  /* Shared public content: published posts and active headlines come from Supabase. */
  async function loadSharedPublishedContent() {
    try {
      const client = window.supabase.createClient(
        "https://oxxnjxrunvhrfwxdvbsr.supabase.co",
        "sb_publishable_I_vdOiwMc4XowqUG8HLP8w_h-GnwbvY",
        {
          global: {
            // Always request fresh published content instead of relying on browser HTTP cache.
            fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" })
          }
        }
      );
      publicSupabaseClient = client;
      const [{data:rows,error:postsError},{data:headlineRows,error:headlinesError}] = await Promise.all([
        client.from("posts").select("*").eq("status","published").order("published_at",{ascending:false}),
        client.from("headlines").select("text").eq("is_active",true).order("sort_order",{ascending:true})
      ]);
      if (postsError) throw postsError;
      if (headlinesError) throw headlinesError;
      const cloudPosts = (rows || []).map(row => {
        const translations = row.translations && typeof row.translations === "object" && !Array.isArray(row.translations)
          ? row.translations
          : {};
        const contentHtml = row.content_html || "";
        const textNode = document.createElement("div");
        textNode.innerHTML = contentHtml;
        const plain = (textNode.textContent || "").replace(/\\s+/g," ").trim();
        const stamp = row.published_at || row.created_at || new Date().toISOString();
        const publishedDate = new Date(stamp);
        return {
          cmsId:row.id,category:["beauty","health","tips"].includes(row.category)?"lifestyle":row.category,
          biographyPersonType:row.biography_person_type||"",biographyPersonName:row.biography_person_name||"",canonicalBiographyPersonName:row.biography_person_name||"",biographyCountry:row.biography_country||"",
           subcategory:row.subcategory||(row.category==="tips"?"daily-tips":row.category==="health"?"health":row.category==="beauty"?"beauty-care":""),title:row.title||"",canonicalTitle:row.title||"",language:row.language||"bn",translations,
          postType:(row.post_types||["latest"])[0]||"latest",
          postTypes:Array.isArray(row.post_types)?row.post_types:["latest"],
          featuredStories:!!row.featured_stories,featured:!!row.featured_stories,
          publishedTimestamp:publishedDate.getTime(),
          date:publishedDate.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),
          read:"",excerpt:row.excerpt||plain.slice(0,260),canonicalExcerpt:row.excerpt||plain.slice(0,260),metaTitle:row.meta_title||"",metaDescription:row.meta_description||"",focusKeyword:row.focus_keyword||"",body:plain?[plain]:[],
          contentHtml,canonicalContentHtml:contentHtml,cover:row.cover_url||"",videoUrl:row.video_url||"",
          keywords:Array.isArray(row.related_keywords)?row.related_keywords:(Array.isArray(row.keywords)?row.keywords:[]),views:Number(row.views)||0
        };
      });
      posts = cloudPosts;
      applyLocalizedPostContent();
      await refreshTrendingStories();
      const track = $(".ticker-track");
      const headlines = (headlineRows || []).map(item => String(item.text||"").trim()).filter(Boolean);
      if (track && headlines.length) {
        const escaped = headlines.map(line => "<span>" + escapeHTML(line) + "</span>");
        track.innerHTML = [...escaped,...escaped].join("");
      }
      render();
      const currentArticleSlug = requestedArticleSlug();
      if (currentArticleSlug) {
        const requestedParts = requestedArticleRouteParts();
        const requestedCategory = requestedParts[0] || "";
        const requestedSubcategory = requestedParts.length >= 3 ? requestedParts[1] : "";
        const cloudArticle = posts.find(post => {
          const categoryMatches = [routeSlug(post.category),categoryRouteSlug(post)].includes(requestedCategory);
          const subcategoryMatches = requestedParts.length >= 3
            ? routeSlug(post.subcategory) === requestedSubcategory
            : !post.subcategory;
          return categoryMatches && subcategoryMatches && articleSlugMatches(post, currentArticleSlug);
        }) ||
        posts.find(post => articleSlugMatches(post, currentArticleSlug));
        if (cloudArticle) openArticleDetail(cloudArticle);
        else {
          document.title = "Article Not Found | Global Scope 24";
          singleArticleView.innerHTML = '<div class="single-article container"><h1>Article not found</h1><p>This article may have been unpublished or moved.</p><a href="' + siteBasePath() + '">Return to Global Scope 24</a></div>';
          singleArticleView.hidden = false;
          if (pageLayout) pageLayout.classList.add("article-page-active");
          if (homeSection) homeSection.hidden = true;
          if (latestPostsSection) latestPostsSection.hidden = true;
          if (articleSection) articleSection.hidden = true;
          const entertainmentSection = $("#entertainmentFeatureSection");
          const homeCategorySections = $("#homeCategorySections");
          if (entertainmentSection) entertainmentSection.hidden = true;
          if (homeCategorySections) homeCategorySections.hidden = true;
          if (featuredStoriesSection) featuredStoriesSection.hidden = false;
          if (manualTrendingSection) manualTrendingSection.hidden = false;
          if (trendingSection) trendingSection.hidden = false;
          if (aboutSection) aboutSection.hidden = false;
          if (categorySection) categorySection.hidden = false;
          if (topAdSlot) topAdSlot.hidden = false;
        }
      }
    } catch (error) {
      console.error("Could not load published Global Scope 24 content from Supabase:", error);
    }
  }
  loadSharedPublishedContent();

})();
