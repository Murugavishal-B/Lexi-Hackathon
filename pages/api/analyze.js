// pages/api/analyze.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, fileName } = req.body || {};
  if (!text && !fileName) return res.status(400).json({ error: "No text provided" });

  try {
    const apiUrl = process.env.GEMINI_API_URL;
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `You are Lexi, an assistant for legal documents. Summarize and flag key clauses in plain language:\n\n${text}`;

    const r = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }),
    });

    const json = await r.json();

    const summary = json?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";

    res.status(200).json({ summary, raw: json });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed", details: err.message });
  }
}
