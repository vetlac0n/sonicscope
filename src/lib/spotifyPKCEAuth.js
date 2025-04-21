const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
];


function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join('');
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function redirectToSpotifyLogin() {
  console.log("🟢 Spotify Login gestartet");
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem('spotify_code_verifier', verifier);

  const scopes = encodeURIComponent(SCOPES.join(' '));
  const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&code_challenge_method=S256&code_challenge=${challenge}`;

  window.location.href = url;
}

export async function handleSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const verifier = localStorage.getItem('spotify_code_verifier');

  console.log("📍 Callback-Code:", code);
  console.log("📍 Stored Verifier:", verifier);

  // ✅ Direkt nach dem Code die URL bereinigen!
  if (code) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (!code) {
    console.warn("🔎 Kein Code in URL – vermutlich kein Spotify Callback");
    return null;
  }

  if (!verifier) {
    console.warn("🔐 Kein PKCE Verifier vorhanden! Leerer LocalStorage oder Seitenreload?");
    alert("Bitte versuche den Login erneut – Sicherheitsdaten waren abgelaufen.");
    return null;
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await response.json();
  console.log("📦 Spotify Antwort:", data);

  if (response.ok && data.access_token) {
    localStorage.setItem('spotify_access_token', data.access_token);
    localStorage.removeItem('spotify_code_verifier'); // 🛡️ WICHTIG!
    return data.access_token;
  } else {
    console.error("❌ Fehler bei der Token-Antwort:", data);
    localStorage.removeItem('spotify_code_verifier'); // 🧹 Auch bei Fehlern!
    return null;
  }
}
