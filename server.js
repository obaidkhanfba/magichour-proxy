const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MH_BASE = 'https://api.magichour.ai';
const SS_BASE = 'https://api.shotstack.io/edit/v1';

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'The Health Lab — Magic Hour + Shotstack Proxy' });
});

// ─── MAGIC HOUR ───────────────────────────────────────────

app.post('/v1/text-to-video', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });
  try {
    const response = await fetch(`${MH_BASE}/v1/text-to-video`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.status(response.status).json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/v1/video-projects/:id', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });
  try {
    const response = await fetch(`${MH_BASE}/v1/video-projects/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    res.status(response.status).json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/v1/ai-voice-generator', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });
  try {
    const response = await fetch(`${MH_BASE}/v1/ai-voice-generator`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.status(response.status).json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/v1/audio-projects/:id', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });
  try {
    const response = await fetch(`${MH_BASE}/v1/audio-projects/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    res.status(response.status).json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SHOTSTACK ────────────────────────────────────────────

app.post('/shotstack/render', async (req, res) => {
  const apiKey = req.headers['x-shotstack-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-shotstack-key header' });
  try {
    const response = await fetch(`${SS_BASE}/render`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.status(response.status).json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/shotstack/render/:id', async (req, res) => {
  const apiKey = req.headers['x-shotstack-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-shotstack-key header' });
  try {
    const response = await fetch(`${SS_BASE}/render/${req.params.id}`, {
      headers: { 'x-api-key': apiKey }
    });
    res.status(response.status).json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
