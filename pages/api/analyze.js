export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    try {
      const response = await fetch("https://api.generativeai.google/v1beta2/models/text-bison-001:generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          prompt: `Analyze this legal document text and give a clear, plain-language summary:\n\n${text}`,
          temperature: 0.2,
          maxOutputTokens: 500
        })
      });

      const data = await response.json();
      res.status(200).json(data);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gemini API error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
