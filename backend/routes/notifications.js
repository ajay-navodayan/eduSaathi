const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { fetchAndStoreCategory, CATEGORY_CONTEXT } = require('../notificationFetcher');

// ──────────────────────────────────────────
// PINNED (admin-created) notifications
// ──────────────────────────────────────────

// GET /notifications (public) — admin-pinned notifications
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /notifications (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, description, link } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notifications (title, description, link) VALUES ($1, $2, $3) RETURNING *',
      [title, description, link]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /notifications/:id (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────
// AI-FETCHED notifications
// ──────────────────────────────────────────

// GET /notifications/ai/categories — list all categories with last-fetched timestamps
router.get('/ai/categories', async (req, res) => {
  try {
    const categories = Object.keys(CATEGORY_CONTEXT || {});
    const result = await pool.query('SELECT category, last_fetched_at FROM fetch_log');
    const logMap = {};
    result.rows.forEach(r => { logMap[r.category] = r.last_fetched_at; });

    const data = categories.map(cat => ({
      category: cat,
      last_fetched_at: logMap[cat] || null,
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /notifications/ai?category=jee — get AI notifications for a category
router.get('/ai', async (req, res) => {
  const { category } = req.query;
  try {
    let query, params;
    if (category) {
      query = 'SELECT * FROM ai_notifications WHERE category = $1 ORDER BY fetched_at DESC, id DESC LIMIT 20';
      params = [category.toLowerCase()];
    } else {
      query = 'SELECT * FROM ai_notifications ORDER BY fetched_at DESC, id DESC LIMIT 50';
      params = [];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /notifications/ai/refresh (admin only) — force-refresh a category
router.post('/ai/refresh', authMiddleware, adminMiddleware, async (req, res) => {
  const { category } = req.body;
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }
  try {
    await fetchAndStoreCategory(category.toLowerCase());
    res.json({ message: `Refreshed notifications for ${category}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refresh' });
  }
});

// DELETE /notifications/ai/:id (admin only)
router.delete('/ai/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM ai_notifications WHERE id = $1', [req.params.id]);
    res.json({ message: 'AI Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
