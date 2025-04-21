import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import https from 'https';
import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log("CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID); // Muss "bd42..." sein


const app = express();
app.use(cors());

app.get('/api/spotify-token', async (req, res) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  
  const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  console.log("▶️ Versuche Client Credentials mit:");
console.log("bd42698839a64d1bad5b71bb463b2a4c", client_id);
console.log("4b4f98a4b2814f26adc4d7ed87d67b95", client_secret);
console.log("AUTH:", auth);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  if (response.ok) {
    res.json(data);
  } else {
    console.error("❌ Fehler beim Abrufen von Client Credentials:", data);
    res.status(500).json({ error: 'Token konnte nicht geholt werden', details: data });
  }
});

const httpsOptions = {
  key: fs.readFileSync('./127.0.0.1-key.pem'),
  cert: fs.readFileSync('./127.0.0.1.pem'),
};

https.createServer(httpsOptions, app).listen(3001, () => {
  console.log('✅ HTTPS-Server läuft auf https://localhost:3001');
});
