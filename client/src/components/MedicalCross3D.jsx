import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const MedicalCross3D = (props) => {
  const group = useRef();

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
      group.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group ref={group} {...props}>
      {/* Vertical part of the cross */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#82d8a5" metalness={0.5} roughness={0.2} emissive="#07a9b0" emissiveIntensity={0.2} />
      </mesh>
      {/* Horizontal part of the cross */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 1, 1]} />
        <meshStandardMaterial color="#82d8a5" metalness={0.5} roughness={0.2} emissive="#07a9b0" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

export default MedicalCross3D;
