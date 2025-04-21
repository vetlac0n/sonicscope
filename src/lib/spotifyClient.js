async function getClientCredentialsToken() {
  try {
    const res = await fetch('/api/spotify-token');
    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.error("❌ Fehler beim Abrufen des Client-Credentials-Tokens:", err);
    throw err;
  }
}

export async function fetchPlaylistTracks(playlistId, userToken = null) {
  let tokenToUse = userToken;

  async function tryFetch(token) {
    let allTracks = [];
    let offset = 0;
    const limit = 100;
  
    while (true) {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorData;
        try {
          errorData = contentType && contentType.includes("application/json")
            ? await res.json()
            : await res.text();
        } catch (e) {
          errorData = "Unbekannter Fehler beim Parsen der Fehlermeldung";
        }
        throw new Error(
          `Spotify API Fehler (${res.status}): ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`
        );
      }
  
      const data = await res.json();
      allTracks.push(...data.items);
  
      if (!data.next) break;
      offset += limit;
    }
  
    return allTracks;
  }
  

  try {
    console.log("🔑 Versuche mit User-Token:", tokenToUse?.slice(0, 30));
    return await tryFetch(tokenToUse);
  } catch (err) {
    console.warn("⚠️ User-Token fehlgeschlagen. Versuche Client-Credentials...");

    try {
      const clientToken = await getClientCredentialsToken();
      console.log("🔄 Neuer Client-Token:", clientToken?.slice(0, 30));
      return await tryFetch(clientToken);
    } catch (clientErr) {
      console.error("❌ Beide Token fehlgeschlagen:", clientErr);
      throw clientErr;
    }
  }
}

export async function fetchAudioFeatures(trackIds, token) {
  const featuresMap = {};

  if (!trackIds.length) return featuresMap;

  const batches = [];
  for (let i = 0; i < trackIds.length; i += 100) {
    batches.push(trackIds.slice(i, i + 100));
  }

  for (const batch of batches) {
    const idsParam = batch.join(',');
    const res = await fetch(`https://api.spotify.com/v1/audio-features?ids=${idsParam}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = await res.text();
      }
      console.error("⚠️ Fehler beim Laden von Audio Features:", errorData);
      throw new Error(`Spotify Audio Features API Error: ${res.status} | ${JSON.stringify(errorData)}`);
    }
    

    const data = await res.json();
    (data.audio_features || []).forEach((f) => {
      if (f && f.id) {
        featuresMap[f.id] = f;
      }
    });
  }

  return featuresMap;
}

