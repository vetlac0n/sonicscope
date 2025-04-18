import React, { useEffect, useState } from 'react';
import { getAccessTokenFromUrl } from './lib/spotifyUserAuth';
import { fetchPlaylistTracks } from './lib/spotifyClient';
import LoginButton from './components/LoginButton';
import Cloud3D from './scenes/Cloud3D';

function App() {
  const [userToken, setUserToken] = useState(null);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const token = getAccessTokenFromUrl();
    if (token) {
      setUserToken(token);
      window.history.pushState({}, null, '/');
    }
  }, []);

  const handleLoadPlaylist = async () => {
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      alert("Ungültiger Spotify-Link.");
      return;
    }
  
    try {
      const tracks = await fetchPlaylistTracks(playlistId, userToken);
  
      if (!tracks || !Array.isArray(tracks)) {
        console.error("❌ Kein valides Tracks-Array:", tracks);
        alert("Fehler beim Verarbeiten der Spotify-Daten.");
        return;
      }
  
      const simplified = tracks.map((item, index) => ({
        id: index,
        name: item.track?.name || 'Unbekannt',
        artist: item.track?.artists?.map((a) => a.name).join(', ') || 'Unbekannt',
        position: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      }));
  
      console.log("✅ Tracks geladen:", simplified);
      setSongs(simplified);
  
    } catch (err) {
      console.error("❌ Fehler beim Abrufen der Playlist:", err);
      alert("Fehler beim Laden der Playlist. Bitte prüfe den Link oder deine API-Schlüssel.");
    }
  };
  
  function extractPlaylistId(url) {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">🎵 SonicScope</h1>
      {!userToken && <LoginButton />}
      {userToken && (
        <p className="text-green-700 mb-4">✅ Eingeloggt mit Spotify</p>
      )}

      <input
        type="text"
        placeholder="Spotify Playlist-Link einfügen..."
        value={playlistUrl}
        onChange={(e) => setPlaylistUrl(e.target.value)}
        className="w-full max-w-md p-2 border rounded mb-4"
      />

      <button
        onClick={handleLoadPlaylist}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
      >
        Playlist laden
      </button>

      <Cloud3D songs={songs} />
    </div>
  );
}

export default App;
