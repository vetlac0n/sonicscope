import React from 'react';
import { getSpotifyLoginUrl } from '../lib/spotifyUserAuth';

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = getSpotifyLoginUrl();
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
    >
      Login mit Spotify
    </button>
  );
}
