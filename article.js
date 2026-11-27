/* Global Scope 24 — shared article page interactions.
   Content and SEO metadata are server-rendered by the Cloudflare Pages Function.
   This file only enhances the already-rendered article for readers. */
(() => {
  "use strict";

  const article = document.querySelector(".article-page");
  const content = document.getElementById("articleContent");
  if (!article || !content) return;

  const currentUrl = window.location.href;
  const currentTitle = document.querySelector(".article-heading h1")?.textContent?.trim() || document.title;

  function updateReadingProgress() {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    const bar = document.getElementById("readingProgress");
    if (bar) bar.style.width = progress + "%";
  }

  function estimateReadingTime() {
    const text = (content.innerText || content.textContent || "").trim();
    const words = text ? text.split(/\s+/).length : 0;
    // A conservative multilingual estimate; Bengali/Hindi text is counted by whitespace.
    const minutes = Math.max(1, Math.ceil(words / 220));
    const target = document.getElementById("readingTime");
    if (target) target.textContent = minutes + " min read";
  }

  function buildTableOfContents() {
    const toc = document.getElementById("articleToc");
    const links = document.getElementById("articleTocLinks");
    if (!toc || !links) return;

    const headings = [...content.querySelectorAll("h2, h3")];
    if (!headings.length) {
      toc.hidden = true;
      return;
    }

    const usedIds = new Set();
    headings.forEach((heading, index) => {
      let id = heading.id || heading.textContent.trim().toLowerCase()
        .normalize("NFC")
        .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "") || "section-" + (index + 1);
      const base = id;
      let suffix = 2;
      while (usedIds.has(id) || (document.getElementById(id) && document.getElementById(id) !== heading)) {
        id = base + "-" + suffix++;
      }
      usedIds.add(id);
      heading.id = id;

      const link = document.createElement("a");
      link.href = "#" + encodeURIComponent(id);
      link.textContent = heading.textContent.trim();
      if (heading.tagName === "H3") link.style.marginLeft = "12px";
      links.appendChild(link);
    });
  }

  function shareTo(network) {
    const url = encodeURIComponent(currentUrl);
    const title = encodeURIComponent(currentTitle);
    const destinations = {
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + url,
      x: "https://twitter.com/intent/tweet?url=" + url + "&text=" + title,
      whatsapp: "https://wa.me/?text=" + title + "%20" + url
    };
    const target = destinations[network];
    if (target) window.open(target, "_blank", "noopener,noreferrer,width=650,height=520");
  }

  document.addEventListener("click", async (event) => {
    const shareButton = event.target.closest("[data-share]");
    if (shareButton) {
      shareTo(shareButton.dataset.share);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    if (actionButton.dataset.action === "print") {
      window.print();
    } else if (actionButton.dataset.action === "copy-link") {
      const originalText = actionButton.textContent;
      try {
        await navigator.clipboard.writeText(currentUrl);
        actionButton.textContent = "Copied";
      } catch {
        actionButton.textContent = "Copy unavailable";
      }
      window.setTimeout(() => { actionButton.textContent = originalText; }, 1800);
    }
  });

  const cover = document.getElementById("articleCover");
  const coverImage = cover?.querySelector("img");
  if (coverImage && (!coverImage.getAttribute("src") || coverImage.getAttribute("src").includes("__ARTICLE_IMAGE__"))) {
    cover.hidden = true;
  }

  const year = document.getElementById("footerYear");
  if (year) year.textContent = String(new Date().getFullYear());

  estimateReadingTime();
  buildTableOfContents();
  updateReadingProgress();
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);
})();
