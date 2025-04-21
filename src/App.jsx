import React, { useEffect, useState } from 'react';
import { handleSpotifyCallback } from './lib/spotifyPKCEAuth';
import { fetchPlaylistTracks } from './lib/spotifyClient';
import LoginButton from './components/LoginButton';
import Cloud3D from './scenes/Cloud3D';
import { fetchAudioFeatures } from './lib/spotifyClient';
import { mapTrackToVisual } from './lib/mappingEngine';



function App() {
  const [userToken, setUserToken] = useState(null);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    async function checkToken() {

      const storedSongs = localStorage.getItem("saved_songs");
      if (storedSongs) {
        try {
          const parsed = JSON.parse(storedSongs);
          if (Array.isArray(parsed)) {
            console.log("☁️ Lokale Songs geladen");
            setSongs(parsed);
          }
        } catch (err) {
          console.warn("⚠️ Fehler beim Parsen der gespeicherten Songs:", err);
        }
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has("code");
  
      // Nur bei Callback versuchen wir den Austausch
      if (hasCode) {
        const token = await handleSpotifyCallback();
        if (token) {
          setUserToken(token);
          localStorage.setItem("spotify_access_token", token);
          return;
        }
      }
  
      // Fallback: Token ist evtl. schon vorhanden?
      const token = localStorage.getItem('spotify_access_token');
      if (token) {
        console.log("🧠 Bestehendes Token gefunden");
        setUserToken(token);
      }
    }
  
    checkToken();
  }, []);
  

  const handleLoadPlaylist = async () => {
    const playlistId = extractPlaylistId(playlistUrl);
    console.log("🎧 Extrahierte Playlist ID:", playlistId);
  
    if (!playlistId) {
      alert("Ungültiger Spotify-Link.");
      return;
    }
  
    try {
      const token = localStorage.getItem("spotify_access_token") || localStorage.getItem("access_token");
      if (!token) {
        alert("Token nicht gefunden. Bitte logge dich erneut ein.");
        return;
      }
  
      console.log("➡️ Hole Playlist mit Token:", token);
      const tracks = await fetchPlaylistTracks(playlistId, token);
  
      if (!tracks || !Array.isArray(tracks)) {
        console.error("❌ Kein valides Tracks-Array:", tracks);
        alert("Fehler beim Verarbeiten der Spotify-Daten.");
        return;
      }
  
      const updatedLog = JSON.parse(localStorage.getItem("update_log") || "[]");
      const currentSongs = [...songs];
  
      const trackIds = tracks.map((t) => t.track?.id).filter(Boolean);
      const featuresMap = await fetchAudioFeatures(trackIds, token);
      
      for (const item of tracks) {
        const id = item.track?.id;
        if (!id) continue;
      
        const features = featuresMap[id];
        if (!features) continue;
      
        const mapped = mapTrackToVisual({
          id,
          name: item.track?.name || 'Unbekannt',
          artist: item.track?.artists?.map((a) => a.name).join(', ') || 'Unbekannt',
          duration_ms: item.track?.duration_ms,
          trackId: item.track?.id || '',
          ...features,
        });
        
      
        const existing = currentSongs.find((s) => s.id === mapped.id);
      
        if (!existing) {
          currentSongs.push(mapped);
        } else {
          const diff =
            JSON.stringify(existing.position) !== JSON.stringify(mapped.position) ||
            existing.color !== mapped.color;
      
          if (diff) {
            updatedLog.push({
              name: mapped.name,
              artist: mapped.artist,
              old: { ...existing },
              new: { position: mapped.position, color: mapped.color },
              timestamp: new Date().toISOString(),
            });
      
            existing.position = mapped.position;
            existing.color = mapped.color;
          }
        }
      }
      
  
      setSongs(currentSongs);
      localStorage.setItem("saved_songs", JSON.stringify(currentSongs));
      localStorage.setItem("update_log", JSON.stringify(updatedLog));
  
      console.log("✅ Finaler Songbestand:", currentSongs);
      console.log("📒 Änderungsprotokoll:", updatedLog);
  
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
