import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

export interface DeskData {
  position: [number, number, number]
  occupied: boolean
  label: string
  occupiedBy?: string
  floor: string
  room?: string
}

interface DeskProps {
  position: [number, number, number]
  occupied: boolean
  label: string
}

function Desk({ position, occupied, label }: DeskProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      {/* Desk surface */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.8, 0.1, 0.5]} />
        <meshStandardMaterial
          color={occupied ? hovered ? '#ef4444' : '#dc2626' : hovered ? '#22c55e' : '#16a34a'}
          emissive={occupied ? hovered ? '#ef4444' : '#dc2626' : hovered ? '#22c55e' : '#16a34a'}
          emissiveIntensity={hovered ? 0.5 : 0.3}
        />
      </mesh>

      {/* Desk label */}
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        {label}
      </Text>

      {/* Status indicator - glowing sphere */}
      <mesh position={[0.4, 0.12, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial
          color={occupied ? '#ef4444' : '#22c55e'}
          emissive={occupied ? '#ef4444' : '#22c55e'}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[12, 10]} />
      <meshStandardMaterial color="#f5f5f5" />
    </mesh>
  )
}

function Walls() {
  return (
    <>
      {/* Back wall */}
      <mesh position={[0, 1.5, -5]}>
        <boxGeometry args={[12, 3, 0.2]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-6, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, 10]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      {/* Right wall */}
      <mesh position={[6, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, 10]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
    </>
  )
}

function ConferenceRoom({ label, position }: { label: string, position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[2.5, 0.1, 2]} />
        <meshStandardMaterial
          color={hovered ? '#3b82f6' : '#1e40af'}
          emissive={hovered ? '#60a5fa' : '#1e40af'}
          emissiveIntensity={0.4}
        />
      </mesh>
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        {label}
      </Text>
    </group>
  )
}

interface FloorMap3DProps {
  desks: DeskData[]
  selectedFloor?: string
}

export function FloorMap3D({ desks, selectedFloor = 'Floor 1' }: FloorMap3DProps) {
  // Filter desks by selected floor
  const filteredDesks = desks.filter(desk => desk.floor === selectedFloor)

  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 3.5, 7]} fov={50} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={1.5}
        maxDistance={20}
        minDistance={3}
      />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />

      {/* Environment */}
      <Floor />
      <Walls />

      {/* Conference Rooms */}
      <ConferenceRoom label="Meeting Room A" position={[4, 0.05, -3.5]} />
      <ConferenceRoom label="Meeting Room B" position={[4, 0.05, 0]} />
      <ConferenceRoom label="Collaboration Space" position={[4, 0.05, 3.5]} />

      {/* Desks */}
      {filteredDesks.map((desk) => (
        <Desk
          key={desk.label}
          position={desk.position}
          occupied={desk.occupied}
          label={desk.label}
        />
      ))}

      {/* Grid helper for reference */}
      <gridHelper args={[12, 24]} position={[0, 0.001, 0]} />
    </Canvas>
  )
}

