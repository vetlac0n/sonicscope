const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
];

export function getSpotifyLoginUrl() {
  const scopes = encodeURIComponent(SCOPES.join(' '));
  return `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
}

export function getAccessTokenFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}
