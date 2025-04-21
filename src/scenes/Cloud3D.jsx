import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

function SongPoint({ song, isHovered, onHover, onLeave }) {
  return (
    <mesh
      position={song.position}
      onPointerOver={() => onHover(song)}
      onPointerOut={onLeave}
    >
      <sphereGeometry args={[2, 16, 16]} />
      <meshStandardMaterial color={song.color} />

      {isHovered && (
        <Html distanceFactor={10}>
          <div className="tooltip">
            <strong>{song.name}</strong><br />
            {song.artist}<br />
            <a
              href={`https://open.spotify.com/track/${song.trackId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1DB954' }}
            >
              🎧 Spotify
            </a>
          </div>
        </Html>
      )}
    </mesh>
  );
}

export default function Cloud3D({ songs = [] }) {
  const [hoveredSong, setHoveredSong] = useState(null);

  return (
    <div style={{ height: '500px', width: '100%', background: '#eeeeee' }}>
      <Canvas camera={{ position: [60, 60, 60] }}>
        <ambientLight intensity={1} />
        <directionalLight position={[50, 50, 50]} intensity={1.5} />
        <OrbitControls />

        {songs.map((song) => (
          <SongPoint
            key={song.id}
            song={song}
            isHovered={hoveredSong?.id === song.id}
            onHover={setHoveredSong}
            onLeave={() => setHoveredSong(null)}
          />
        ))}
      </Canvas>
    </div>
  );
}
