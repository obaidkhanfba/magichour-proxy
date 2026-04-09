const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MH_BASE = 'https://api.magichour.ai';

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'The Health Lab — Magic Hour Proxy' });
});

// Create text-to-video job
app.post('/v1/text-to-video', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });

  try {
    const response = await fetch(`${MH_BASE}/v1/text-to-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get video job status
app.get('/v1/video-projects/:id', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });

  try {
    const response = await fetch(`${MH_BASE}/v1/video-projects/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Voice Generator
app.post('/v1/ai-voice-generator', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });

  try {
    const response = await fetch(`${MH_BASE}/v1/ai-voice-generator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audio job status
app.get('/v1/audio-projects/:id', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });

  try {
    const response = await fetch(`${MH_BASE}/v1/audio-projects/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
