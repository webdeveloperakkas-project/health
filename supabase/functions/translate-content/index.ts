// Global Scope 24 — on-demand translation with persistent cache.
// The Gemini API key and Supabase service-role key are server-side secrets only.
const allowedOrigins = new Set([
  "https://webdeveloperakkas-project.github.io",
]);
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://webdeveloperakkas-project.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (origin && !allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { cacheKey, language, sourceHash, content } = await request.json();
    const allowedLanguages = new Set(["en", "bn", "hi", "ar", "ur", "es", "pt", "fr", "zh", "ja", "ko", "id", "de", "ru", "tr"]);
    if (typeof cacheKey !== "string" || cacheKey.length < 1 || cacheKey.length > 500 ||
        typeof language !== "string" || !allowedLanguages.has(language) ||
        typeof sourceHash !== "string" || sourceHash.length > 128 ||
        !content || typeof content !== "object" || Array.isArray(content)) {
      return json({ error: "Invalid translation request" }, 400);
    }

    const serialized = JSON.stringify(content);
    if (serialized.length > 45000) return json({ error: "Content is too large for one translation request" }, 413);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
    let serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey && secretKeysRaw) {
      try {
        const secretKeys = JSON.parse(secretKeysRaw);
        serviceKey = secretKeys.service_role || secretKeys.serviceRole || "";
      } catch (_) {}
    }
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!supabaseUrl || !serviceKey || !geminiKey) {
      return json({ error: "Translation service is not configured" }, 500);
    }

    const restUrl = `${supabaseUrl}/rest/v1/translation_cache`;
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    };

    // Reuse an existing translation only when its source content is unchanged.
    const lookupUrl = new URL(restUrl);
    lookupUrl.searchParams.set("cache_key", `eq.${cacheKey}`);
    lookupUrl.searchParams.set("language_code", `eq.${language}`);
    lookupUrl.searchParams.set("select", "source_hash,translated_content");
    lookupUrl.searchParams.set("limit", "1");
    const cachedResponse = await fetch(lookupUrl, { headers });
    if (!cachedResponse.ok) throw new Error("Could not read translation cache");
    const cachedRows = await cachedResponse.json();
    if (cachedRows.length && cachedRows[0].source_hash === sourceHash) {
      return json({ translated: cachedRows[0].translated_content, cached: true });
    }

    // Limit cache-miss generation per visitor to protect the free Gemini quota.
    const forwardedIp = request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const clientKey = await sha256(forwardedIp);
    const rateResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/check_translation_rate_limit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ p_client_key: clientKey, p_limit: 30 }),
    });
    if (!rateResponse.ok || await rateResponse.json() !== true) {
      return json({ error: "Translation limit reached. Please try again shortly." }, 429);
    }

    const prompt = [
      "You are the professional localization engine for Global Scope 24.",
      `Translate every human-readable value into language code "${language}".`,
      "Return ONLY valid JSON with the same keys and data types as the input.",
      "Do not summarize, omit, add facts, or change numbers, dates, URLs, IDs, names, or factual meaning.",
      "If a value contains HTML, translate only visible text and preserve all HTML tags, attributes, links, image URLs, and structure exactly.",
      "Keep proper names and technical terms accurate. Preserve placeholders and template tokens.",
      "Input JSON:",
      serialized,
    ].join("\n\n");

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.15 },
        }),
      },
    );
    const geminiData = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error("Gemini translation error:", geminiData);
      return json({ error: "Translation provider request failed" }, 502);
    }

    const outputText = geminiData?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "").join("").trim();
    if (!outputText) return json({ error: "Gemini returned an empty translation" }, 502);
    const translated = JSON.parse(outputText);
    if (!translated || typeof translated !== "object" || Array.isArray(translated)) {
      return json({ error: "Gemini returned an invalid translation format" }, 502);
    }

    // The unique (cache_key, language_code) key prevents duplicate cache rows.
    const saveResponse = await fetch(restUrl, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        cache_key: cacheKey,
        language_code: language,
        source_hash: sourceHash,
        translated_content: translated,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!saveResponse.ok) {
      console.error("Translation cache save failed:", await saveResponse.text());
      return json({ error: "Translation succeeded but could not be cached" }, 500);
    }

    return json({ translated, cached: false });
  } catch (error) {
    console.error("Translation function failed:", error);
    return json({ error: "Translation request could not be completed" }, 500);
  }
});
