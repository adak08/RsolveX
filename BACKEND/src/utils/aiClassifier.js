// utils/aiClassifier.js
// Uses Google Gemini to classify complaint category and priority
// Called when user selects "other" category and provides a custom description

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Valid values in our system
const VALID_CATEGORIES = ["road", "water", "electricity", "sanitation", "other"];
const VALID_PRIORITIES = ["low", "medium", "high", "critical"];

// Fallback if Gemini is unavailable or returns garbage
const FALLBACK_RESULT = {
    category: "other",
    priority: "medium",
    reasoning: "AI classifier unavailable — default applied",
    aiClassified: false
};

/**
 * Calls Gemini to classify a complaint's category and priority
 * based on its title and description.
 *
 * @param {string} title - Complaint title
 * @param {string} description - Complaint description
 * @param {string} customOtherLabel - What the user typed in the "other" field (e.g. "fire", "accident")
 * @returns {{ category, priority, reasoning, aiClassified }}
 */
export const classifyComplaintWithAI = async (title, description, customOtherLabel = "") => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("⚠️  GEMINI_API_KEY not set — skipping AI classification");
        return FALLBACK_RESULT;
    }

    const prompt = buildPrompt(title, description, customOtherLabel);

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.1,       // Low temp = deterministic, factual responses
                    maxOutputTokens: 300,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API error:", response.status, errText);
            return FALLBACK_RESULT;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            console.error("Gemini returned empty response");
            return FALLBACK_RESULT;
        }

        return parseGeminiResponse(rawText);

    } catch (error) {
        console.error("AI classifier network error:", error.message);
        return FALLBACK_RESULT;
    }
};

// ─── Prompt Builder ───────────────────────────────────────────────────────────

const buildPrompt = (title, description, customOtherLabel) => {
    return `
You are a civic complaint classification assistant for a multi-tenant complaint management system called ResolveX.

A user has submitted a complaint. Your job is to:
1. Determine the most appropriate CATEGORY from this fixed list: road, water, electricity, sanitation, other
2. Determine the PRIORITY level from: low, medium, high, critical
3. Provide a short REASONING (1 sentence max)

Category definitions:
- road: potholes, broken roads, traffic signals, streetlights, sidewalks, accidents, vehicle-related infrastructure
- water: water supply issues, leakage, flooding, drainage, sewage
- electricity: power cuts, short circuits, electrical fires, fallen wires, transformer issues
- sanitation: garbage, waste disposal, public toilets, pest control, cleanliness
- other: anything that doesn't clearly fit the above categories

Priority definitions:
- critical: immediate threat to human life or safety (fire, gas leak, electrocution risk, major accident, explosion)
- high: serious issue that can escalate quickly (power outage, major road damage, flooding, broken main water line)
- medium: significant inconvenience or moderate risk (recurring issues, moderate damage)
- low: minor inconvenience, cosmetic issues, general feedback

Complaint details:
- Title: "${title}"
- Description: "${description}"
- User-specified type (if any): "${customOtherLabel}"

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "category": "<one of: road, water, electricity, sanitation, other>",
  "priority": "<one of: low, medium, high, critical>",
  "reasoning": "<one sentence explaining why>"
}
`.trim();
};

// ─── Response Parser ──────────────────────────────────────────────────────────

const parseGeminiResponse = (rawText) => {
    try {
        // Strip any accidental markdown fences if present
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        const category = VALID_CATEGORIES.includes(parsed.category)
            ? parsed.category
            : "other";

        const priority = VALID_PRIORITIES.includes(parsed.priority)
            ? parsed.priority
            : "medium";

        console.log(`✅ AI classified: category=${category}, priority=${priority} — ${parsed.reasoning}`);

        return {
            category,
            priority,
            reasoning: parsed.reasoning || "",
            aiClassified: true
        };
    } catch (error) {
        console.error("Failed to parse Gemini response:", rawText, error.message);
        return FALLBACK_RESULT;
    }
};

/**
 * Rule-based fallback priority calculator (used when AI is skipped)
 * Kept here so user_issue controller only imports from one place.
 */
export const calculatePriorityFromCategory = (category) => {
    const priorityMap = {
        "road": "high",
        "water": "high",
        "electricity": "high",
        "sanitation": "medium",
        "other": "low"
    };
    return priorityMap[category] || "medium";
};