
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const posts = [
    {category:"health",title:"Small Daily Habits That Support a Healthier Life",date:"November 19, 2026",read:"4 MIN READ",body:[
      "Good health is often supported by small choices repeated over time. A regular sleep schedule can help your body maintain a steady daily rhythm.",
      "Try to include a variety of vegetables, fruits and other nourishing foods in your meals. Drinking water throughout the day is a simple habit worth maintaining.",
      "Gentle movement, such as walking or stretching, can make an ordinary day more active. Choose activities that suit your ability and personal circumstances.",
      "Taking short breaks can also help you reset your attention. Make time to connect with family, friends or people you trust.",
      "Avoid trying to change every habit at once. Start with one realistic goal and give yourself time to practise it.",
      "Notice what works well for you and adjust your routine when needed. If you have a health concern, speak with a qualified healthcare professional.",
      "These everyday ideas are general information, not a personal treatment plan. Small, sustainable steps can be a useful starting point for wellbeing."
    ]},
    {category:"health",title:"A Simple Guide to Building a Balanced Daily Routine",date:"November 18, 2026",read:"3 MIN READ",body:[
      "A balanced routine gives your day a helpful structure without making every hour feel fixed. Begin by choosing a regular time to wake up and prepare for sleep.",
      "Plan meals and keep a few simple, nourishing options available. Add movement in a way that feels comfortable and realistic.",
      "Make room for focused work as well as short pauses. A little preparation the night before can make the next morning feel calmer.",
      "Keep your goals flexible and review them from time to time. A routine should support your life, not become another source of pressure."
    ]},
    {category:"health",title:"Why Rest and Hydration Matter in Everyday Life",date:"November 17, 2026",read:"3 MIN READ",body:[
      "Rest and hydration are basic parts of everyday wellbeing. People have different needs, so pay attention to your own circumstances and routine.",
      "A calm bedtime environment and a consistent sleep schedule may make it easier to rest. Keep water available and drink regularly throughout the day.",
      "If tiredness or other symptoms continue or worry you, seek advice from a qualified healthcare professional rather than relying on general online tips."
    ]},
    {category:"technology",title:"Everyday AI Tools: A Friendly Starting Guide",date:"November 19, 2026",read:"4 MIN READ",body:[
      "Artificial intelligence tools can help people explore ideas, organise information and complete some everyday digital tasks. You do not need to be a technical expert to begin learning about them.",
      "For example, an AI assistant can help you draft a checklist, explain an unfamiliar term or suggest a structure for a document. Clear instructions usually lead to more useful results.",
      "Always review important information before using it. AI systems can make mistakes, misunderstand a question or provide details that are out of date.",
      "Do not enter passwords, private financial information or sensitive personal details into tools unless you understand their privacy and security practices.",
      "Compare more than one source when a decision matters. For health, legal or financial questions, consult an appropriately qualified professional.",
      "Start with a simple, low-risk task and learn what the tool can and cannot do. Use technology as an assistant, not as a replacement for your own judgement.",
      "With thoughtful use, digital tools can save time while helping you stay in control of your work."
    ]},
    {category:"technology",title:"Simple Ways to Keep Your Online Accounts Safer",date:"November 18, 2026",read:"3 MIN READ",body:[
      "A few careful habits can make your online accounts more secure. Use a different, strong password for each important service.",
      "Where available, turn on multi-factor authentication so a password alone is not enough to access your account. Keep your recovery email and phone number up to date.",
      "Be cautious with unexpected links and attachments, even when a message appears to come from someone you know. Check the website address before signing in.",
      "Keep your device and apps updated. If a message creates urgency or asks for money or login details, pause and verify it through an official channel."
    ]},
    {category:"technology",title:"Choosing Useful Apps Without Getting Overwhelmed",date:"November 17, 2026",read:"3 MIN READ",body:[
      "Before installing a new app, identify the task you want it to help with. A clear purpose makes it easier to compare options.",
      "Check who develops the app, what permissions it requests and how it handles personal information. Read recent reviews with a critical eye.",
      "Try the basic features before paying for a subscription. Remove apps you no longer use and review recurring charges periodically.",
      "The best tool is not always the one with the most features. Choose something reliable, understandable and suitable for your needs."
    ]},
    {category:"beauty",title:"A Simple, Thoughtful Approach to Daily Skincare",date:"November 19, 2026",read:"4 MIN READ",body:[
      "A skincare routine does not need to contain many products to feel organised. Many basic routines focus on gentle cleansing, moisturising and sun protection.",
      "Choose products that suit your skin and introduce new items gradually. Using several new products at the same time can make it harder to identify what works for you.",
      "Read product labels and follow the directions provided by the manufacturer. A patch test may be useful when trying a new product, although it cannot guarantee that irritation will not occur.",
      "Sun protection is an important part of daytime care. Follow the product instructions and consider shade, clothing and other practical ways to reduce sun exposure.",
      "Avoid assuming that expensive products are automatically better. Simple, consistent care is often easier to maintain.",
      "If you experience persistent irritation, pain or a skin condition that concerns you, ask a qualified healthcare professional for advice.",
      "This guide is general educational information and is not a diagnosis or a personalised skincare recommendation."
    ]},
    {category:"beauty",title:"Understanding the Basics of Hair Care",date:"November 18, 2026",read:"3 MIN READ",body:[
      "Hair needs can differ depending on hair type, styling habits and the environment. Start by noticing how your hair responds to your current routine.",
      "Use shampoo and conditioner according to their directions and avoid rough handling when hair is wet. Heat styling less often may help reduce avoidable damage.",
      "Choose a manageable routine instead of following every trend. If you notice sudden or persistent hair loss or scalp problems, seek professional advice."
    ]},
    {category:"beauty",title:"How to Read a Personal Care Product Label",date:"November 17, 2026",read:"3 MIN READ",body:[
      "Product labels can help you understand what an item is intended to do and how it should be used. Read the directions, warnings and ingredient list before use.",
      "Check the expiry information and store products as recommended. Be careful with claims that promise instant or guaranteed results.",
      "If you have allergies or sensitive skin, review ingredients carefully and ask a qualified professional when unsure. Stop using a product if it causes a concerning reaction."
    ]}
  ];

  const categoryNames = {health:"Health",beauty:"Beauty",technology:"Technology",travel:"Travel",hospitals:"Hospitals",finance:"Finance",world:"World News",tips:"Daily Tips",lifestyle:"Lifestyle"};

  const languageCopy = {
    en:{latest:"LATEST",categories:{health:"Health",beauty:"Beauty",technology:"Technology",travel:"Travel",hospitals:"Hospitals",finance:"Finance",world:"World News",tips:"Daily Tips",lifestyle:"Lifestyle"},stories:"LATEST STORIES",description:"Latest articles and useful information.",search:"Search articles...",sort:"NEWEST FIRST ↓",page:"Page",of:"of",articles:"Articles",empty:"No sample posts are available in this category yet. More articles will appear here as they are published.",about:"About",contact:"Contact",privacy:"Privacy",aboutTitle:"Clear information for a world of everyday questions.",aboutText:"Our articles are for general information and do not replace professional advice."},
    bn:{latest:"সর্বশেষ",categories:{health:"স্বাস্থ্য",beauty:"সৌন্দর্য",technology:"প্রযুক্তি",travel:"ভ্রমণ",hospitals:"হাসপাতাল",finance:"অর্থনীতি",world:"বিশ্ব সংবাদ",tips:"দৈনন্দিন টিপস",lifestyle:"জীবনযাপন"},stories:"সর্বশেষ লেখা",description:"সাম্প্রতিক প্রবন্ধ ও দরকারি তথ্য।",search:"প্রবন্ধ খুঁজুন...",sort:"নতুন লেখা আগে ↓",page:"পৃষ্ঠা",of:"এর",articles:"প্রবন্ধ",empty:"এই বিভাগে এখনো কোনো নমুনা প্রবন্ধ নেই। প্রকাশিত হলে নতুন প্রবন্ধ এখানে দেখা যাবে।",about:"আমাদের সম্পর্কে",contact:"যোগাযোগ",privacy:"গোপনীয়তা",aboutTitle:"প্রতিদিনের নানা প্রশ্নের জন্য সহজ ও নির্ভরযোগ্য তথ্য।",aboutText:"আমাদের প্রবন্ধ সাধারণ তথ্যের জন্য; এগুলো পেশাদার পরামর্শের বিকল্প নয়।"},
    hi:{latest:"ताज़ा",categories:{health:"स्वास्थ्य",beauty:"सौंदर्य",technology:"प्रौद्योगिकी",travel:"यात्रा",hospitals:"अस्पताल",finance:"वित्त",world:"विश्व समाचार",tips:"दैनिक सुझाव",lifestyle:"जीवनशैली"},stories:"नवीनतम लेख",description:"नए लेख और उपयोगी जानकारी।",search:"लेख खोजें...",sort:"नवीनतम पहले ↓",page:"पृष्ठ",of:"में से",articles:"लेख",empty:"इस श्रेणी में अभी कोई नमूना लेख उपलब्ध नहीं है।",about:"परिचय",contact:"संपर्क",privacy:"गोपनीयता",aboutTitle:"रोज़मर्रा के सवालों के लिए स्पष्ट और उपयोगी जानकारी।",aboutText:"हमारे लेख सामान्य जानकारी के लिए हैं और पेशेवर सलाह का विकल्प नहीं हैं।"},
    de:{latest:"AKTUELL",categories:{health:"Gesundheit",beauty:"Schönheit",technology:"Technologie",travel:"Reisen",hospitals:"Krankenhäuser",finance:"Finanzen",world:"Weltnachrichten",tips:"Alltagstipps",lifestyle:"Lebensstil"},stories:"NEUESTE ARTIKEL",description:"Neueste Artikel und hilfreiche Informationen.",search:"Artikel suchen...",sort:"NEUESTE ZUERST ↓",page:"Seite",of:"von",articles:"Artikel",empty:"Für diese Kategorie sind noch keine Beispielartikel verfügbar.",about:"Über uns",contact:"Kontakt",privacy:"Datenschutz",aboutTitle:"Klare Informationen für die Fragen des Alltags.",aboutText:"Unsere Artikel dienen der allgemeinen Information und ersetzen keine professionelle Beratung."},
    fr:{latest:"À LA UNE",categories:{health:"Santé",beauty:"Beauté",technology:"Technologie",travel:"Voyage",hospitals:"Hôpitaux",finance:"Finance",world:"Actualités",tips:"Conseils pratiques",lifestyle:"Mode de vie"},stories:"DERNIERS ARTICLES",description:"Articles récents et informations utiles.",search:"Rechercher des articles...",sort:"PLUS RÉCENT ↓",page:"Page",of:"sur",articles:"Articles",empty:"Aucun article exemple n'est encore disponible dans cette catégorie.",about:"À propos",contact:"Contact",privacy:"Confidentialité",aboutTitle:"Des informations claires pour les questions du quotidien.",aboutText:"Nos articles sont informatifs et ne remplacent pas un avis professionnel."},
    es:{latest:"ÚLTIMAS NOTICIAS",categories:{health:"Salud",beauty:"Belleza",technology:"Tecnología",travel:"Viajes",hospitals:"Hospitales",finance:"Finanzas",world:"Noticias mundiales",tips:"Consejos diarios",lifestyle:"Estilo de vida"},stories:"ARTÍCULOS RECIENTES",description:"Artículos recientes e información útil.",search:"Buscar artículos...",sort:"MÁS RECIENTES ↓",page:"Página",of:"de",articles:"Artículos",empty:"Todavía no hay artículos de ejemplo en esta categoría.",about:"Acerca de",contact:"Contacto",privacy:"Privacidad",aboutTitle:"Información clara para las preguntas de cada día.",aboutText:"Nuestros artículos son informativos y no sustituyen el asesoramiento profesional."}
  };
  let activeLanguage = "en";
  function applyLanguage(language) {
    activeLanguage = languageCopy[language] ? language : "en";
    const t = languageCopy[activeLanguage];
    document.documentElement.lang = activeLanguage;
    $(".category-tab, .sidebar-category").forEach(button => button.textContent = t.categories[button.dataset.category]);
    $("#siteSearch").placeholder = t.search;
    $(".eyebrow").textContent = t.stories;
    $(".sort-label").textContent = t.sort;
    $("#about h2").textContent = t.aboutTitle;
    $("#about p").textContent = t.aboutText;
    const links = $(".footer-links a");
    if (links[1]) links[1].textContent = t.about;
    if (links[2]) links[2].textContent = t.contact;
    if (links[3]) links[3].textContent = t.privacy;
    render();
  }

  let activeCategory = "health";
  let currentPage = 1;
  const pageSize = 2;
  let searchTerm = "";

  const articleList = $("#articleList");
  const previousButton = $("#previousPage");
  const nextButton = $("#nextPage");

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }

  function render() {
    const categoryPosts = posts
      .filter(post => post.category === activeCategory)
      .filter(post => !searchTerm || (post.title + " " + post.body.join(" ")).toLowerCase().includes(searchTerm));
    const totalPages = Math.max(1, Math.ceil(categoryPosts.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visiblePosts = categoryPosts.slice(start, start + pageSize);

    const t = languageCopy[activeLanguage];
    $("#activeCategoryTitle").textContent = (t.categories[activeCategory] || "Articles") + " " + t.articles;
    $("#feedDescription").textContent = searchTerm
      ? "Search results in " + (t.categories[activeCategory] || "this category") + "."
      : t.description;

    if (!visiblePosts.length) {
      articleList.innerHTML = '<div class="empty-state">' + escapeHTML(t.empty) + '</div>';
    } else {
      articleList.innerHTML = visiblePosts.map((post, index) => {
        const body = post.body.map(line => "<p>" + escapeHTML(line) + "</p>").join("");
        const card = '<article class="post-card"><div class="post-topline"><span class="post-category">' + escapeHTML(categoryNames[post.category].toUpperCase()) + '</span><time class="post-date">' + escapeHTML(post.date) + '</time></div><h3>' + escapeHTML(post.title) + '</h3><div class="post-body">' + body + '</div><div class="post-readtime">' + escapeHTML(post.read) + ' · EVERYDAY ATLAS</div></article>';
        return card + (index === 0 && visiblePosts.length > 1 ? '<div class="inline-ad" aria-label="Advertisement placement"><strong>ADVERTISEMENT</strong><span>In-article ad space</span></div>' : "");
      }).join("");
    }

    $("#pageStatus").textContent = t.page + " " + currentPage + " " + t.of + " " + totalPages;
    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
  }

  $(".category-tab, .sidebar-category").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      currentPage = 1;
      searchTerm = "";
      const searchInput = $("#siteSearch");
      if (searchInput) searchInput.value = "";
      $(".category-tab, .sidebar-category").forEach(card => {
        const selected = card.dataset.category === activeCategory;
        card.classList.toggle("active", selected);
        card.setAttribute("aria-pressed", String(selected));
      });
      const menu = $("#mainNav");
      const toggle = $("#menuToggle");
      if (menu) menu.classList.remove("open");
      if (toggle) { toggle.setAttribute("aria-expanded","false"); toggle.setAttribute("aria-label","Open categories"); }
      render();
      $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
    });
  });

  $("#menuToggle").addEventListener("click", () => {
    const menu = $("#mainNav");
    const toggle = $("#menuToggle");
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close categories" : "Open categories");
  });
  document.addEventListener("click", event => {
    const menu = $("#mainNav");
    const toggle = $("#menuToggle");
    if (menu.classList.contains("open") && !menu.contains(event.target) && !toggle.contains(event.target)) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open categories");
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      $("#mainNav").classList.remove("open");
      $("#menuToggle").setAttribute("aria-expanded", "false");
      $("#menuToggle").setAttribute("aria-label", "Open categories");
    }
  });

  previousButton.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; render(); $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"}); }
  });
  nextButton.addEventListener("click", () => {
    currentPage++;
    render();
    $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
  });

  $("#searchForm").addEventListener("submit", event => {
    event.preventDefault();
    searchTerm = ($("#siteSearch").value || "").trim().toLowerCase();
    currentPage = 1;
    render();
    $("#articleFeed").scrollIntoView({behavior:"smooth",block:"start"});
  });

  $("#languageSelect").addEventListener("change", event => {
    try { localStorage.setItem("ea-language", event.target.value); } catch (_) {}
    applyLanguage(event.target.value);
  });
  try {
    const savedLanguage = localStorage.getItem("ea-language");
    if (savedLanguage && $("#languageSelect").querySelector('option[value="' + savedLanguage + '"]')) $("#languageSelect").value = savedLanguage;
  } catch (_) {}

  $("#year").textContent = new Date().getFullYear();
  applyLanguage($("#languageSelect").value || "en");
})();
