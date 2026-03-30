/**
 * notificationFetcher.js — Hourly cron that fetches AI notifications via Gemini
 * and stores them in the ai_notifications table.
 */
const pool = require('./db');
const { fetchNotificationsForCategory, CATEGORY_CONTEXT } = require('./gemini');

const CATEGORIES = Object.keys(CATEGORY_CONTEXT);
const FETCH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if a category was fetched within the last hour.
 */
async function wasFetchedRecently(category) {
  const result = await pool.query(
    `SELECT last_fetched_at FROM fetch_log WHERE category = $1`,
    [category]
  );
  if (result.rows.length === 0) return false;
  const lastFetch = new Date(result.rows[0].last_fetched_at);
  return (Date.now() - lastFetch.getTime()) < FETCH_INTERVAL_MS;
}

/**
 * Fetch and store notifications for a single category.
 */
async function fetchAndStoreCategory(category) {
  try {
    console.log(`📡 Fetching AI notifications for: ${category}`);
    const notifications = await fetchNotificationsForCategory(category);

    if (!notifications || notifications.length === 0) {
      console.log(`⚠️  No notifications returned for ${category}`);
      return;
    }

    // Upsert each notification (skip duplicates by title+category)
    for (const n of notifications) {
      await pool.query(
        `INSERT INTO ai_notifications (category, title, description, source_url, published_date, fetched_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (category, title) DO UPDATE SET
           description = EXCLUDED.description,
           source_url = EXCLUDED.source_url,
           published_date = EXCLUDED.published_date,
           fetched_at = NOW()`,
        [category, n.title, n.description, n.source_url, n.published_date]
      );
    }

    // Update fetch_log
    await pool.query(
      `INSERT INTO fetch_log (category, last_fetched_at)
       VALUES ($1, NOW())
       ON CONFLICT (category) DO UPDATE SET last_fetched_at = NOW()`,
      [category]
    );

    console.log(`✅ Stored ${notifications.length} notifications for ${category}`);
  } catch (err) {
    console.error(`❌ Error fetching ${category}:`, err.message);
  }
}

/**
 * Fetch all categories that haven't been updated in the last hour.
 */
async function fetchAllCategories(force = false) {
  console.log('\n--- 📡 Starting AI Notification Fetch Cycle ---');

  for (const category of CATEGORIES) {
    if (!force && await wasFetchedRecently(category)) {
      console.log(`⏭️  Skipping ${category} (fetched recently)`);
      continue;
    }

    await fetchAndStoreCategory(category);

    // Delay between categories to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('--- ✅ AI Notification Fetch Cycle Complete ---\n');
}

/**
 * Start the notification fetcher. Runs once immediately, then every hour.
 */
function startNotificationFetcher() {
  // Fetch on startup (with a 5-second delay to let DB settle)
  setTimeout(() => {
    fetchAllCategories().catch(err => console.error('Fetch cycle error:', err));
  }, 5000);

  // Then every hour
  setInterval(() => {
    fetchAllCategories().catch(err => console.error('Fetch cycle error:', err));
  }, FETCH_INTERVAL_MS);

  console.log('🔄 Notification fetcher started (every 60 minutes)');
}

module.exports = { startNotificationFetcher, fetchAndStoreCategory, fetchAllCategories, CATEGORY_CONTEXT };
