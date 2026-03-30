/**
 * gemini.js — Google Gemini API client for fetching exam notifications.
 * Uses the REST API directly (no SDK dependency).
 */
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Category display names + search context for better prompts
const CATEGORY_CONTEXT = {
  govt:        'Indian Government job notifications (SSC, UPSC, State PSC, Central Govt jobs)',
  jee:         'JEE Main and JEE Advanced exam notifications, registration, results, counselling',
  neet:        'NEET UG and NEET PG exam notifications, registration, results, counselling',
  railway:     'Indian Railway recruitment (RRB NTPC, Group D, ALP, JE, RPF)',
  ssc:         'SSC CGL, SSC CHSL, SSC MTS, SSC GD, SSC JE — Staff Selection Commission exams',
  navodaya:    'Jawahar Navodaya Vidyalaya Selection Test (JNVST) — Class 6 and Class 9 entrance exam',
  netarhat:    'Netarhat Vidyalaya (Jharkhand) entrance exam for Class 6 admission',
  scholarship: 'Indian scholarship notifications — NSP, state scholarships, merit cum means, minority scholarships',
};

/**
 * Ask Gemini for the latest notifications for a given category.
 * Returns an array of { title, description, source_url, published_date }.
 */
async function fetchNotificationsForCategory(category) {
  if (!GEMINI_API_KEY) {
    console.error('⚠️  GEMINI_API_KEY not set in .env');
    return [];
  }

  const context = CATEGORY_CONTEXT[category] || category;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `You are an Indian education news aggregator. Today is ${today}.

Return the latest 6-8 important notifications/updates for: ${context}

Rules:
- Focus on REAL, CURRENT notifications from ${new Date().getFullYear()}
- Include exam dates, registration deadlines, result announcements, admit card releases, counselling updates
- title: Short headline (max 80 chars)
- description: 1-2 sentence summary with key dates/details
- source_url: Official website URL (like nta.ac.in, ssc.nic.in, navodaya.gov.in etc). Use the direct relevant page URL if known, otherwise use the homepage of the official body.
- published_date: Approximate date like "March 2026" or "28 March 2026"

Return ONLY a valid JSON array, no markdown, no explanation:
[{"title":"...","description":"...","source_url":"...","published_date":"..."}]`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Gemini API error (${res.status}) for ${category}:`, errText);
      return [];
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON array from response (handles markdown code fences)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error(`Gemini returned non-JSON for ${category}:`, text.substring(0, 200));
      return [];
    }

    const notifications = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    return notifications
      .filter(n => n.title && typeof n.title === 'string')
      .map(n => ({
        title: n.title.substring(0, 200),
        description: (n.description || '').substring(0, 500),
        source_url: n.source_url || '',
        published_date: n.published_date || '',
      }));
  } catch (err) {
    console.error(`Error fetching Gemini notifications for ${category}:`, err.message);
    return [];
  }
}

module.exports = { fetchNotificationsForCategory, CATEGORY_CONTEXT };
