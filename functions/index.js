const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

exports.generateQuests = onRequest(
  {
    cors: true,
    secrets: [GEMINI_API_KEY],
  },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({
          error: "Alleen POST requests zijn toegestaan."
        });
      }

      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({
          error: "Geen geldige prompt ontvangen."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY.value()
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
Je bent de AI Quest Master van een Life RPG-app.

De gebruiker geeft hieronder zijn doelen, interesses of wensen.

Maak precies 3 leuke, realistische quests.

Gebruikersinvoer:
${prompt}

Geef ALLEEN geldige JSON terug in dit formaat:

{
  "quests": [
    {
      "title": "Naam van de quest",
      "description": "Korte beschrijving",
      "category": "Health",
      "difficulty": "Easy",
      "xp": 50,
      "gold": 10
    }
  ]
}

Regels:
- precies 3 quests
- xp is een getal tussen 10 en 500
- gold is een getal tussen 1 en 100
- difficulty is alleen Easy, Medium of Hard
- category is bijvoorbeeld Health, Fitness, Study, Work, Social, Hobby of Personal
- quests moeten haalbaar zijn
- maak de quests specifiek voor de gebruiker
- geen markdown
- geen tekst buiten de JSON
        `,
      });

      const text = response.text;

      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const quests = JSON.parse(cleanText);

      return res.status(200).json(quests);

    } catch (error) {
      console.error("Gemini error:", error);

      return res.status(500).json({
        error: "Er ging iets mis met de AI.",
        details: error.message
      });
    }
  }
);
