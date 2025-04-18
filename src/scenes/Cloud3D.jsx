import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const dummySongs = [
  {
    id: 1,
    name: 'Song A',
    artist: 'Artist 1',
    position: [20, 50, 30],
    color: '#ff6666',
  },
  {
    id: 2,
    name: 'Song B',
    artist: 'Artist 2',
    position: [70, 90, 10],
    color: '#66ccff',
  },
  {
    id: 3,
    name: 'Song C',
    artist: 'Artist 3',
    position: [10, 10, 90],
    color: '#88ff88',
  },
];

function SongPoint({ position, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function Cloud3D({ songs = [] }) {
  return (
    <div style={{ height: '500px', width: '100%', background: '#eeeeee' }}>
      <Canvas camera={{ position: [60, 60, 60] }}>
        <ambientLight intensity={1} />
        <directionalLight position={[50, 50, 50]} intensity={1.5} />
        <OrbitControls />
        {songs.map((song) => (
  <SongPoint
    key={song.id}
    position={song.position}
    color={song.color}
  />
))}
      </Canvas>
    </div>
  );
}
