import { Canvas } from '@react-three/fiber';
import {
  PerspectiveCamera,
  OrbitControls,
  Text,
} from '@react-three/drei';
import { useEffect, useState } from 'react';

export interface DeskData {
  id: string;
  position: [number, number, number];
  occupied: boolean;
  label?: string;
  floor: number;
  room?: string;
  occupiedBy?: string;
}

function Desk({
  position,
  occupied,
  label,
}: {
  position: [number, number, number];
  occupied: boolean;
  label?: string;
}) {

  return (
    <group position={position}>
      {/* Desk frame - realistic */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.03, 0.32]} />
        <meshStandardMaterial
          color={occupied ? '#2563eb' : '#d1d5db'}
          metalness={0.1}
          roughness={0.4}
          emissive={occupied ? '#0ea5e9' : '#000000'}
          emissiveIntensity={occupied ? 0.2 : 0}
        />
      </mesh>

      {/* Desk legs - sleek metal frame */}
      {[[-0.2, -0.15], [0.2, -0.15]].map((pos, idx) => (
        <mesh key={`leg-${idx}`} position={[pos[0], -0.16, pos[1]]} castShadow>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Monitor - modern thin bezels */}
      <mesh position={[0, 0.28, -0.08]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.3, 0.04]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.7}
          roughness={0.2}
          emissive={occupied ? '#1e3a8a' : '#000000'}
          emissiveIntensity={occupied ? 0.4 : 0}
        />
      </mesh>

      {/* Monitor screen glow */}
      {occupied && (
        <mesh position={[0, 0.28, -0.06]}>
          <planeGeometry args={[0.38, 0.26]} />
          <meshBasicMaterial
            color="#0ea5e9"
            transparent
            opacity={0.15}
          />
        </mesh>
      )}

      {/* Monitor stand - thin aluminum look */}
      <mesh position={[0, 0.1, -0.08]} castShadow>
        <boxGeometry args={[0.1, 0.18, 0.08]} />
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Keyboard tray - slightly raised */}
      <mesh position={[0, 0.05, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.02, 0.14]} />
        <meshStandardMaterial color="#555555" metalness={0.15} roughness={0.6} />
      </mesh>

      {/* Status indicator - small dot */}
      <mesh position={[0.22, 0.04, 0.12]}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
        <meshStandardMaterial
          color={occupied ? '#0ea5e9' : '#9ca3af'}
          emissive={occupied ? '#0ea5e9' : '#000000'}
          emissiveIntensity={occupied ? 0.6 : 0}
        />
      </mesh>

      {/* Glow for occupied desks */}
      {occupied && (
        <>
          <pointLight
            position={[0, 0.15, 0]}
            intensity={0.5}
            distance={1.2}
            color="#0ea5e9"
            castShadow
          />
        </>
      )}

      {/* Label - clean typography */}
      {label && (
        <Text
          position={[0, 0.38, 0]}
          fontSize={0.05}
          color={occupied ? '#e0e7ff' : '#6b7280'}
          anchorX="center"
          anchorY="bottom"
          fontWeight="600"
          outlineWidth={0.003}
          outlineColor="#1f2937"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function ConferenceRoom({
  position,
  size,
  name,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  name: string;
  color?: string;
}) {
  const roomColor = color || '#cffafe';
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Room floor - distinct surface */}
      <mesh
        castShadow
        receiveShadow
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[size[0], 0.025, size[2]]} />
        <meshStandardMaterial
          color={hovered ? '#b3e5fc' : roomColor}
          metalness={0.08}
          roughness={0.85}
          emissive={hovered ? '#0097a7' : '#000000'}
          emissiveIntensity={hovered ? 0.1 : 0}
        />
      </mesh>

      {/* Room walls - glass/semi-transparent appearance */}
      {/* Front wall */}
      <mesh
        position={[0, size[1] / 2, -size[2] / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[size[0], size[1], 0.08]} />
        <meshStandardMaterial
          color={roomColor}
          metalness={0.3}
          roughness={0.5}
          emissive={hovered ? '#4dd0e1' : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0.05}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Back wall */}
      <mesh
        position={[0, size[1] / 2, size[2] / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[size[0], size[1], 0.08]} />
        <meshStandardMaterial
          color={roomColor}
          metalness={0.3}
          roughness={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-size[0] / 2, size[1] / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.08, size[1], size[2]]} />
        <meshStandardMaterial
          color={roomColor}
          metalness={0.3}
          roughness={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[size[0] / 2, size[1] / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.08, size[1], size[2]]} />
        <meshStandardMaterial
          color={roomColor}
          metalness={0.3}
          roughness={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Door frame - prominent accent */}
      <mesh
        position={[-size[0] / 2 + 0.35, size[1] / 2 - 0.2, 0]}
        castShadow
      >
        <boxGeometry args={[0.08, size[1] * 0.85, 0.15]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Door handle accent */}
      <mesh position={[-size[0] / 2 + 0.43, size[1] / 2 - 0.4, 0.1]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Room label */}
      <Text
        position={[0, size[1] / 2 + 0.3, 0]}
        fontSize={0.13}
        color="#0369a1"
        anchorX="center"
        anchorY="bottom"
        fontWeight="700"
        outlineWidth={0.005}
        outlineColor="#ffffff"
      >
        {name}
      </Text>
    </group>
  );
}

function CollaborationArea({
  position,
  radius,
  name,
}: {
  position: [number, number, number];
  radius: number;
  name: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Collaboration zone floor - warm ambient */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial
          color={hovered ? '#fed7aa' : '#fef08a'}
          metalness={0.05}
          roughness={0.9}
          emissive={hovered ? '#f59e0b' : '#000000'}
          emissiveIntensity={hovered ? 0.08 : 0}
        />
      </mesh>

      {/* Boundary border - accent ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        castShadow
      >
        <torusGeometry args={[radius, 0.08, 8, 32]} />
        <meshStandardMaterial
          color="#d97706"
          metalness={0.3}
          roughness={0.5}
          emissive="#d97706"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Round table - modern wood finish */}
      <mesh
        position={[0, 0.35, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, 0.8, 32]} />
        <meshStandardMaterial
          color="#92400e"
          metalness={0.15}
          roughness={0.7}
          emissive={hovered ? '#b45309' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0.1}
        />
      </mesh>

      {/* Table center column - metallic base */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.3, 16]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Seating indicators - small dots around table */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
        <mesh
          key={`seat-${idx}`}
          position={[
            radius * 0.65 * Math.cos(angle),
            0.38,
            radius * 0.65 * Math.sin(angle),
          ]}
          castShadow
        >
          <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
          <meshStandardMaterial
            color="#ea580c"
            metalness={0.2}
            roughness={0.6}
            emissive={hovered ? '#ea580c' : '#000000'}
            emissiveIntensity={hovered ? 0.3 : 0.15}
          />
        </mesh>
      ))}

      {/* Label */}
      <Text
        position={[0, 0.85, 0]}
        fontSize={0.11}
        color="#92400e"
        anchorX="center"
        anchorY="bottom"
        fontWeight="700"
        outlineWidth={0.004}
        outlineColor="#fef08a"
      >
        {name}
      </Text>
    </group>
  );
}

function Stairwell({ position }: { position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Stairwell container base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[1.0, 1.0]} />
        <meshStandardMaterial
          color="#e5e7eb"
          metalness={0.05}
          roughness={0.9}
          emissive={hovered ? '#9ca3af' : '#000000'}
          emissiveIntensity={hovered ? 0.1 : 0}
        />
      </mesh>

      {/* Stair case steps - realistic geometry */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={`step-${i}`}
          position={[0, i * 0.15, i * 0.13]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.9, 0.1, 0.28]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.2}
            roughness={0.8}
            emissive={hovered ? '#94a3b8' : '#000000'}
            emissiveIntensity={hovered ? 0.15 : 0.05}
          />
        </mesh>
      ))}

      {/* Step nosing - anti-slip edge accent */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={`nosing-${i}`}
          position={[0, i * 0.15 + 0.055, i * 0.13 + 0.16]}
          castShadow
        >
          <boxGeometry args={[0.9, 0.01, 0.04]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* Handrail - cylindrical posts */}
      <mesh position={[0.48, 0.5, 0.65]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.8, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Handrail - top rail */}
      <mesh position={[0.48, 0.75, 0.65]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Stairwell border - accent frame */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.0, 1.0, 0.1]} />
        <meshStandardMaterial
          color="#6b7280"
          metalness={0.5}
          roughness={0.5}
          emissive={hovered ? '#9ca3af' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0.08}
        />
      </mesh>

      {/* Stairwell label */}
      <Text
        position={[0, 0.95, -0.3]}
        fontSize={0.12}
        color="#1f2937"
        fontWeight="700"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.005}
        outlineColor="#ffffff"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        STAIRS
      </Text>
    </group>
  );
}

interface FloorMap3DProps {
  desks: DeskData[];
  floor?: number;
  selectedFloor?: string;
}

export function FloorMap3DV2({ desks, floor = 1 }: FloorMap3DProps) {
  const [autoRotate, setAutoRotate] = useState(true);

  const filteredDesks = floor ? desks.filter((d) => d.floor === floor) : desks;

  useEffect(() => {
    const timer = setTimeout(() => setAutoRotate(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Canvas
      className="w-full h-full"
      dpr={[1, 2]}
      shadows
      gl={{
        antialias: true,
        stencil: false,
        depth: true,
      }}
    >
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 8, 35]} />

      <PerspectiveCamera
        makeDefault
        position={[12, 9, 14]}
        fov={50}
        near={0.1}
        far={100}
      />
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        minDistance={8}
        maxDistance={30}
        enablePan
        enableZoom
        dampingFactor={0.08}
      />

      {/* Professional 3-point lighting setup */}
      {/* Key light - strong directional from top-front */}
      <directionalLight
        position={[14, 16, 10]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={50}
        shadow-radius={4}
        shadow-bias={-0.001}
      />

      {/* Fill light - softer from opposite side */}
      <directionalLight
        position={[-10, 12, -8]}
        intensity={0.5}
        castShadow={false}
        color="#a5f3fc"
      />

      {/* Rim light - accent from back */}
      <directionalLight
        position={[0, 8, -15]}
        intensity={0.4}
        castShadow={false}
        color="#fef08a"
      />

      {/* Ambient light - fills shadows naturally */}
      <ambientLight intensity={0.6} color="#f8fafc" />

      {/* Point lights for room accents */}
      <pointLight
        position={[-7, 5, 3]}
        intensity={0.25}
        distance={12}
        color="#cffafe"
        decay={2}
      />
      <pointLight
        position={[7, 5, -3]}
        intensity={0.25}
        distance={12}
        color="#fed7aa"
        decay={2}
      />

      {/* Main floor plane - professional appearance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial
          color="#f1f5f9"
          metalness={0.02}
          roughness={0.98}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>

      {/* Floor grid - subtle reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshBasicMaterial
          color="#000000"
          wireframe
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Perimeter walls - modern design */}
      {/* Front wall - entrance side */}
      <mesh position={[0, 1.5, 8.5]} castShadow receiveShadow>
        <boxGeometry args={[20.5, 3.2, 0.12]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.85}
          emissive="#0f172a"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -8.5]} castShadow receiveShadow>
        <boxGeometry args={[20.5, 3.2, 0.12]} />
        <meshStandardMaterial
          color="#d1d5db"
          metalness={0.08}
          roughness={0.85}
        />
      </mesh>

      {/* Left wall */}
      <mesh position={[-10.5, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 3.2, 17]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.08}
          roughness={0.85}
        />
      </mesh>

      {/* Right wall */}
      <mesh position={[10.5, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 3.2, 17]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.08}
          roughness={0.85}
        />
      </mesh>

      {/* Accent pillars - structural elements */}
      {[
        [-7, 0, 4],
        [7, 0, 4],
        [-7, 0, -4],
        [7, 0, -4],
      ].map((pos, idx) => (
        <mesh key={`pillar-${idx}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.25, 3.2, 0.25]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.15}
            roughness={0.75}
            emissive="#475569"
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}

      {/* Stairwell - Central */}
      <Stairwell position={[0, 0, 3.8]} />

      {/* Conference Rooms - Premium seating tier */}
      <ConferenceRoom
        position={[-6.5, 0, 6.8]}
        size={[2.4, 1.0, 2.0]}
        name="Conf A"
        color="#cffafe"
      />
      <ConferenceRoom
        position={[0, 0, 7.2]}
        size={[2.0, 1.0, 1.8]}
        name="Focus Room"
        color="#e0e7ff"
      />
      <ConferenceRoom
        position={[6.5, 0, 6.8]}
        size={[2.4, 1.0, 2.0]}
        name="Conf B"
        color="#cffafe"
      />

      {/* 1-on-1 Meeting Rooms */}
      <ConferenceRoom
        position={[-8.5, 0, 3.2]}
        size={[1.6, 0.85, 1.4]}
        name="1-on-1"
        color="#d1d5db"
      />
      <ConferenceRoom
        position={[8.5, 0, 3.2]}
        size={[1.6, 0.85, 1.4]}
        name="Quiet"
        color="#d1d5db"
      />

      {/* Collaboration Areas - Social zones */}
      <CollaborationArea position={[-7.5, 0, 1]} radius={0.8} name="Team 1" />
      <CollaborationArea position={[7.5, 0, 1]} radius={0.8} name="Team 2" />
      <CollaborationArea position={[-8, 0, -5]} radius={0.7} name="Break" />
      <CollaborationArea position={[8, 0, -5]} radius={0.7} name="Lunch" />

      {/* Render all desks with realistic spacing */}
      {filteredDesks.map((desk) => (
        <Desk
          key={desk.id}
          position={desk.position}
          occupied={desk.occupied}
          label={desk.label}
        />
      ))}

      {/* Performance grid - subtle helper */}
      <gridHelper
        args={[20, 20, '#ffffff', '#666666']}
        position={[0, 0.01, 0]}
      />
    </Canvas>
  );
}
