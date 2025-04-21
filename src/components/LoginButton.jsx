import React from 'react';
import { redirectToSpotifyLogin } from '../lib/spotifyPKCEAuth';

export default function LoginButton() {
  return (
    <button
      onClick={redirectToSpotifyLogin}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Login mit Spotify
    </button>
  );
}
