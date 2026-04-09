const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const MH_BASE = 'https://api.magichour.ai';
const SS_BASE = 'https://api.shotstack.io/edit/v1';

// Cloudinary config — stored server-side, never exposed to browser
const CLOUDINARY_CLOUD = 'dofkzl5ay';
const CLOUDINARY_KEY = '767287758274272';
const CLOUDINARY_SECRET = 'HrbdjxDikAex2pK1zFmijBSnTGg';

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'The Health Lab — Full Pipeline Proxy v2' });
});

// ─── CLOUDINARY ───────────────────────────────────────────

// Upload image to Cloudinary (accepts base64)
app.post('/cloudinary/upload', async (req, res) => {
  const { image, public_id } = req.body;
  if (!image || !public_id) return res.status(400).json({ error: 'Missing image or public_id' });

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'healthlab';
    const str = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${CLOUDINARY_SECRET}`;
    const signature = crypto.createHash('sha1').update(str).digest('hex');

    const formData = new URLSearchParams();
    formData.append('file', image);
    formData.append('public_id', public_id);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp);
    formData.append('api_key', CLOUDINARY_KEY);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get stored image URL from Cloudinary
app.get('/cloudinary/url/:public_id', async (req, res) => {
  const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/healthlab/${req.params.public_id}`;
  res.json({ url });
});

// List stored assets
app.get('/cloudinary/list', async (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const str = `timestamp=${timestamp}${CLOUDINARY_SECRET}`;
    const signature = crypto.createHash('sha1').update(str).digest('hex');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/resources/image?prefix=healthlab/&max_results=20`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${CLOUDINARY_KEY}:${CLOUDINARY_SECRET}`).toString('base64')
        }
      }
    );
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch image from Cloudinary and return as base64 for Claude Vision
app.post('/cloudinary/fetch-base64', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing url' });
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    res.json({ base64, mediaType: contentType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

app.post('/v1/image-to-video', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });
  try {
    const response = await fetch(`${MH_BASE}/v1/image-to-video`, {
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
