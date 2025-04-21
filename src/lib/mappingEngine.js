function mapTrackToVisual(track, features, index) {
    if (!features || !track) return null;
  
    const {
      tempo = 0,
      time_signature = 4,
      danceability = 0,
      energy = 0,
      valence = 0,
      duration_ms = 180000,
      acousticness = 0,
      instrumentalness = 0,
      speechiness = 0,
      mode = 1,
      liveness = 0
    } = features;
  
    // Für Normalisierung
    const maxDuration = 10 * 60 * 1000; // 10 Min
  
    // === ACHSEN ===
    const rhythmik = normalize(0.5 * tempo + 0.3 * danceability * 100 + 0.2 * energy * 100);
    const dramaturgie = normalize(0.4 * energy * 100 + 0.3 * (1 - valence) * 100 + 0.3 * (duration_ms / maxDuration) * 100);
    const klangfarbe = normalize(
      0.4 * acousticness * 100 +
      0.3 * instrumentalness * 100 +
      0.2 * (1 - speechiness) * 100 +
      0.1 * (mode === 1 ? 100 : 0)
    );
  
    // === FARBE AUS INSTRUMENTIERUNG ===
    const r = Math.floor(instrumentalness * 255);
    const g = Math.floor((1 - acousticness) * 255);
    const b = Math.floor(liveness * 255);
    const color = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  
    return {
      id: track.id || index,
      name: track.name || 'Unbekannt',
      artist: track.artists?.map(a => a.name).join(', ') || 'Unbekannt',
      position: [dramaturgie, klangfarbe, rhythmik],
      color
    };
  }
  
  // Hilfsfunktion zur Normierung in 0–100
  function normalize(val, min = 0, max = 100) {
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  }
  
  export { mapTrackToVisual, normalize };

