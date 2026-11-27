/**
 * Global Scope 24 — Dynamic article renderer
 *
 * URL: /article/:slug
 * Shared template: /article.html
 * Data source: published rows in the Supabase "posts" table.
 *
 * Cloudflare Pages environment variables (recommended):
 *   SUPABASE_URL       = https://oxxnjxrunvhrfwxdvbsr.supabase.co
 *   SUPABASE_ANON_KEY  = the public publishable/anon key used by the website
 *
 * Never put a Supabase service_role key in this file or in browser-visible code.
 */

const SITE_NAME = "Global Scope 24";
const SITE_ORIGIN = "https://webdeveloperakkas-project.github.io/health";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function routeSlug(value) {
  return String(value || "")
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function safeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatDate(date, language) {
  if (!date) return "";
  const locale = ({ bn: "bn-BD", hi: "hi-IN", de: "de-DE", fr: "fr-FR", es: "es-ES" })[language] || "en-US";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(date);
}

function absoluteUrl(value, requestUrl) {
  if (!value) return "";
  try {
    const url = new URL(String(value), requestUrl);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

/*
 * Article HTML is saved by the admin editor after DOMPurify sanitization.
 * This final defensive pass removes executable elements, inline event
 * handlers, dangerous URL schemes, and embedded document/object elements.
 */
function cleanArticleHtml(input) {
  let html = String(input || "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<(script|style|iframe|frame|frameset|object|embed|applet|form|input|button|textarea|select|option|meta|link|base)[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  html = html.replace(/<(script|style|iframe|frame|frameset|object|embed|applet|form|input|button|textarea|select|option|meta|link|base)\b[^>]*\/?\s*>/gi, "");
  html = html.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/\s+(href|src|xlink:href)\s*=\s*("|')\s*(?:javascript|vbscript|data):[\s\S]*?\2/gi, "");
  html = html.replace(/\s+srcdoc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  return html;
}

function replaceToken(template, token, value) {
  return template.split(token).join(String(value ?? ""));
}

function jsonForHtml(value) {
  // Prevent a JSON string from terminating the application/ld+json script tag.
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function findTranslation(post, language) {
  const translations = post && post.translations && typeof post.translations === "object" && !Array.isArray(post.translations)
    ? post.translations : {};
  const primary = String(post.language || "en").toLowerCase();
  const selected = translations[language] || translations[primary] || {};
  return { translations, selected, primary };
}

function postMatchesSlug(post, slug) {
  const { translations } = findTranslation(post, String(post.language || "en").toLowerCase());
  const candidates = [
    post.title,
    ...Object.values(translations).map((item) => item && item.title)
  ];
  return candidates.some((title) => routeSlug(title) === slug);
}

function categoryLabel(category) {
  const labels = {
    world: "World News", "world-news": "World News", technology: "Technology",
    sports: "Sports", health: "Health", beauty: "Beauty", lifestyle: "Lifestyle",
    travel: "Travel", finance: "Finance", tips: "Daily Tips", "daily-tips": "Daily Tips",
    biography: "Biography", entertainment: "Entertainment"
  };
  const key = String(category || "").toLowerCase();
  return labels[key] || (key ? key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Article");
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const slug = routeSlug(params && params.slug);
  if (!slug) return new Response("Article not found", { status: 404 });

  const supabaseUrl = String(env.SUPABASE_URL || "https://oxxnjxrunvhrfwxdvbsr.supabase.co").replace(/\/$/, "");
  const supabaseKey = env.SUPABASE_ANON_KEY || "sb_publishable_I_vdOiwMc4XowqUG8HLP8w_h-GnwbvY";
  if (!supabaseKey) {
    return new Response("Article service is not configured.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  try {
    const apiUrl = new URL(supabaseUrl + "/rest/v1/posts");
    apiUrl.searchParams.set("select", "*");
    apiUrl.searchParams.set("status", "eq.published");
    apiUrl.searchParams.set("order", "published_at.desc");
    apiUrl.searchParams.set("limit", "1000");

    const dbResponse = await fetch(apiUrl.toString(), {
      headers: {
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey,
        Accept: "application/json"
      }
    });
    if (!dbResponse.ok) {
      return new Response("Unable to load this article right now.", {
        status: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
      });
    }

    const rows = await dbResponse.json();
    const post = Array.isArray(rows) ? rows.find((row) => postMatchesSlug(row, slug)) : null;
    if (!post) return new Response("Article not found", { status: 404 });

    const primaryLanguage = String(post.language || "en").toLowerCase();
    const { selected, translations } = findTranslation(post, primaryLanguage);
    const title = String(selected.title || post.title || "Untitled article").trim();
    const contentHtml = cleanArticleHtml(selected.content_html || post.content_html || "");
    const description = String(selected.excerpt || post.excerpt || "")
      .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
    const category = categoryLabel(post.category);
    const categoryPath = String(post.category || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
    const published = safeDate(post.published_at || post.created_at);
    const updated = safeDate(post.updated_at || post.published_at || post.created_at);
    const image = absoluteUrl(post.cover_url, request.url);
    const canonicalUrl = new URL("/article/" + encodeURIComponent(slug) + "/", request.url).href;
    const keywords = Array.isArray(post.related_keywords) ? post.related_keywords :
      (Array.isArray(post.keywords) ? post.keywords : []);
    const author = String(post.author_name || post.author || "Global Scope 24 Editorial Team");
    const imageAlt = String(selected.image_alt_text || title);
    const imageCaption = post.cover_caption_enabled ? String(post.cover_caption || "") : "";

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
      "headline": title,
      "description": description,
      "image": image ? [image] : undefined,
      "datePublished": published ? published.toISOString() : undefined,
      "dateModified": updated ? updated.toISOString() : undefined,
      "author": { "@type": "Organization", "name": author },
      "publisher": { "@type": "Organization", "name": SITE_NAME, "url": SITE_ORIGIN },
      "inLanguage": primaryLanguage,
      "keywords": keywords.join(", ")
    };

    let templateResponse;
    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      templateResponse = await env.ASSETS.fetch(new URL("/article.html", request.url));
    } else {
      templateResponse = await fetch(new URL("/article.html", request.url));
    }
    if (!templateResponse || !templateResponse.ok) {
      return new Response("Article template is unavailable. Check the Cloudflare Pages static assets configuration.", {
        status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    let html = await templateResponse.text();
    const replacements = {
      "__ARTICLE_LANGUAGE__": escapeHtml(primaryLanguage),
      "__ARTICLE_TITLE__": escapeHtml(title),
      "__META_DESCRIPTION__": escapeHtml(description),
      "__ARTICLE_URL__": escapeHtml(canonicalUrl),
      "__ARTICLE_IMAGE__": escapeHtml(image),
      "__ARTICLE_PUBLISHED_ISO__": escapeHtml(published ? published.toISOString() : ""),
      "__ARTICLE_UPDATED_ISO__": escapeHtml(updated ? updated.toISOString() : ""),
      "__ARTICLE_JSON_LD__": jsonForHtml(structuredData),
      "__ARTICLE_CATEGORY_URL__": escapeHtml(categoryPath ? "/" + categoryPath + "/" : "/"),
      "__ARTICLE_CATEGORY__": escapeHtml(category),
      "__ARTICLE_AUTHOR__": escapeHtml(author),
      "__ARTICLE_PUBLISHED_DATE__": escapeHtml(formatDate(published, primaryLanguage)),
      "__ARTICLE_IMAGE_ALT__": escapeHtml(imageAlt),
      "__ARTICLE_IMAGE_CAPTION__": escapeHtml(imageCaption),
      "__ARTICLE_CONTENT__": contentHtml,
      "__ARTICLE_KEYWORDS__": keywords.slice(0, 15).map((word) => '<span>#' + escapeHtml(String(word).replace(/\s+/g, "")) + '</span>').join(" ")
    };
    for (const [token, value] of Object.entries(replacements)) html = replaceToken(html, token, value);

    // Remove the cover figure when the post has no image, rather than emitting an empty image URL.
    if (!image) html = html.replace(/\s*<figure class="article-cover"[\s\S]*?<\/figure>/i, "");
    if (!description) html = html.replace(/\s*<p class="article-deck"[^>]*>[\s\S]*?<\/p>/i, "");
    html = html.replace(/__[^\s<>]+__/g, "");

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600"
      }
    });
  } catch (error) {
    return new Response("An unexpected error occurred while rendering this article.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
}
