(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Mobile navigation
  const menuToggle = $("#menuToggle");
  const mobileNav = $("#mobileNav");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.textContent = isOpen ? "×" : "☰";
    });
    $$("a", mobileNav).forEach(link => link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    }));
  }

  // Language and country preferences. Country-based IP detection requires a trusted
  // geolocation provider/server and is intentionally not faked in this static demo.
  const languageSelect = $("#languageSelect");
  const countrySelect = $("#countrySelect");
  try {
    const savedLanguage = localStorage.getItem("ea-language");
    const savedCountry = localStorage.getItem("ea-country");
    if (savedLanguage && languageSelect) languageSelect.value = savedLanguage;
    if (savedCountry && countrySelect) countrySelect.value = savedCountry;
  } catch (_) {}
  languageSelect?.addEventListener("change", () => {
    try { localStorage.setItem("ea-language", languageSelect.value); } catch (_) {}
    const labels = {en:"English selected. Article translation will be connected in a later phase.",bn:"বাংলা নির্বাচন করা হয়েছে। অনুবাদ ব্যবস্থা পরবর্তী ধাপে যুক্ত হবে।",hi:"हिन्दी चुनी गई। अनुवाद सुविधा अगले चरण में जोड़ी जाएगी।",de:"Deutsch ausgewählt. Übersetzungen folgen in einer späteren Phase.",fr:"Français sélectionné. La traduction sera ajoutée ultérieurement.",es:"Español seleccionado. La traducción llegará en una fase posterior."};
    announce(labels[languageSelect.value] || labels.en);
  });
  countrySelect?.addEventListener("change", () => {
    try { localStorage.setItem("ea-country", countrySelect.value); } catch (_) {}
    if (countrySelect.value) announce("Country preference saved: " + countrySelect.value + ". Local content can be personalized in a later phase.");
  });

  // Search the sample story cards already present on the homepage.
  const searchForm = $("#searchForm");
  const searchInput = $("#siteSearch");
  const articleCards = $$(".article-card");
  const latestCards = $$("#articleResults .latest-card");
  const noResults = $("#noResults");
  function runSearch(query) {
    const term = query.trim().toLowerCase();
    let count = 0;
    articleCards.forEach(card => {
      const haystack = ((card.dataset.search || "") + " " + card.textContent).toLowerCase();
      const matches = !term || haystack.includes(term);
      card.classList.toggle("hidden", !matches);
      if (matches && card.closest("#articleResults")) count++;
    });
    if (noResults) noResults.hidden = !term || count > 0;
    if (term) $("#latest")?.scrollIntoView({behavior:"smooth", block:"start"});
  }
  searchForm?.addEventListener("submit", event => {
    event.preventDefault();
    runSearch(searchInput?.value || "");
  });
  searchInput?.addEventListener("input", () => {
    if (!searchInput.value.trim()) {
      articleCards.forEach(card => card.classList.remove("hidden"));
      if (noResults) noResults.hidden = true;
    }
  });

  // Newsletter is a visual front-end placeholder until an email provider is connected.
  $("#newsletterForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const message = $("#newsletterMessage");
    if (message) message.textContent = "Thanks! The signup form is a demo. Connect an email service before collecting subscriptions.";
  });

  // This is a static demo. Real AdSense code and publisher/slot IDs must be
  // inserted only after account approval. The visible ADVERTISEMENT areas are
  // reserved placements, not live ads and must never be clicked as ads.
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  function announce(message) {
    let status = $("#siteStatus");
    if (!status) {
      status = document.createElement("div");
      status.id = "siteStatus";
      status.className = "sr-only";
      status.setAttribute("role", "status");
      document.body.appendChild(status);
    }
    status.textContent = message;
  }
})();