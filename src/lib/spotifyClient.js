export async function fetchPlaylistTracks(playlistId, userToken) {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Spotify API Fehler: ${res.status} – ${errorData}`);
  }

  const data = await res.json();
  return data.items;
}
