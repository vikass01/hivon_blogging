/**
 * Generate a ~200-word summary from post body using Google Gemini.
 * Called only ONCE per post (on create), then stored in the DB.
 * Trims output to ~180-220 words to enforce the requested length.
 */
export async function generateSummary(title: string, body: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, skipping summary");
    return null;
  }

  const trimmedBody = body.length > 8000 ? body.slice(0, 8000) + "..." : body;
  const prompt = `You are writing a summary of a blog post.

STRICT REQUIREMENTS:
- The summary MUST be between 180 and 220 words. Aim for exactly 200 words.
- Do NOT write a short summary. Do NOT write a one-line summary. Anything under 180 words is INVALID.
- Output ONLY the summary text — no heading, no title, no bullet points, no preamble like "Here is a summary" or "This post discusses".
- Write 2 to 3 full paragraphs of flowing prose covering: the main argument, supporting key points, important details/examples, and the conclusion.
- Use clear, neutral, engaging prose.
- Count your words mentally before finalizing. If under 180, expand with more detail from the post.

TITLE: ${title}

POST:
${trimmedBody}

Now write the 180–220 word summary:`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        signal: AbortSignal.timeout(45_000),
      }
    );

    if (!res.ok) {
      console.error("Gemini error:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    let text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Gemini returned no text. Full response:", JSON.stringify(data).slice(0, 500));
      return null;
    }
    text = text.trim();
    let wordCount = text.split(/\s+/).filter(Boolean).length;
    console.log(`Gemini summary first pass: ${wordCount} words`);

    // If too short, retry once asking the model to expand to ~200 words.
    if (wordCount < 160) {
      const expandPrompt = `The summary below is too short (${wordCount} words). Rewrite it to be between 180 and 220 words by adding more detail, examples, and context from the original post. Output ONLY the expanded summary, no preamble.

ORIGINAL POST TITLE: ${title}

ORIGINAL POST:
${trimmedBody}

CURRENT TOO-SHORT SUMMARY:
${text}

Now write the expanded 180–220 word summary:`;

      const retry = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: expandPrompt }] }],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 4096,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
          signal: AbortSignal.timeout(45_000),
        }
      );
      if (retry.ok) {
        const retryData = await retry.json();
        const retryText: string | undefined = retryData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (retryText && retryText.trim().split(/\s+/).filter(Boolean).length > wordCount) {
          text = retryText.trim();
          wordCount = text.split(/\s+/).filter(Boolean).length;
          console.log(`Gemini summary after expand: ${wordCount} words`);
        }
      }
    }

    // Hard cap: if model returned much more than 230 words, truncate at sentence boundary.
    const words = text.split(/\s+/);
    if (words.length > 230) {
      const truncated = words.slice(0, 220).join(" ");
      const lastPeriod = truncated.lastIndexOf(".");
      text = lastPeriod > 100 ? truncated.slice(0, lastPeriod + 1) : truncated + "…";
    }
    return text;
  } catch (e) {
    console.error("Gemini exception:", e);
    return null;
  }
}
