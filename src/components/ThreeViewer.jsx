'use client'
import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  useAnimations,
  useGLTF,
  Bounds,
  Center,
  AsciiRenderer,
  Outlines,
} from '@react-three/drei'
import * as THREE from 'three'

/**
 * ThreeViewer
 * Props:
 * - modelUrl: string (GLB/GLTF recommended to preserve materials & animations)
 * - autoPlay: boolean (default true)
 * - resumeDelayMs: number (default 5000)
 * - orbitTarget: [x,y,z] (default auto-centered)
 * - minDistance, maxDistance: number (default 0.5, 10)
 * - minPolarAngle, maxPolarAngle: number (optional constraints)
 * - fov: number (default 45)
 * - background: CSS color (default transparent)
 *
 * Notes:
 * - If the model has animations, a timeline slider is shown and loops by default.
 * - When the user interacts with the slider, playback pauses; if idle for resumeDelayMs, playback resumes.
 * - If the model has no animations, the slider is hidden.
 */
export function ThreeViewer({
  modelUrl,
  autoPlay = true,
  resumeDelayMs = 5000,
  orbitTarget = null,
  minDistance = 0.5,
  maxDistance = 10,
  minPolarAngle,
  maxPolarAngle,
  fov = 45,
  background = 'transparent',
  style,
  className = '',
}) {
  const [playing, setPlaying] = useState(autoPlay)
  const currentTime = useRef()

  //TODO: convert to state
  const hasAnims = true

  return (
    <div
      className={`relative w-full h-full min-h-[40vh] rounded-lg p-4 ${className}`}
      style={style}
    >
      <Canvas camera={{ fov }} shadows gl={{ antialias: true, alpha: true }}>
        {/* transparent canvas: leave scene.background = null */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 5]} intensity={2.9} castShadow />
        <directionalLight position={[-3, 5, 5]} intensity={0.9} castShadow />
        <Suspense fallback={null}>
          {modelUrl ? (
            <Model
              modelUrl={modelUrl}
              playing={playing}
              setPlaying={setPlaying}
              orbitTarget={orbitTarget}
              minDistance={minDistance}
              maxDistance={maxDistance}
              minPolarAngle={minPolarAngle}
              maxPolarAngle={maxPolarAngle}
            />
          ) : null}
        </Suspense>
      </Canvas>

      {hasAnims && (
        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 bg-background/70 backdrop-blur rounded-md px-3 py-2">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="px-2 py-1 text-sm rounded border border-primary/40 hover:border-primary/60"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </div>
  )
}

function Model({
  modelUrl,
  playing,
  orbitTarget,
  minDistance,
  maxDistance,
  minPolarAngle,
  maxPolarAngle,
  setHasAnims = () => {},
}) {
  const group = useRef()
  const { scene, animations } = useGLTF('' + modelUrl)
  const { actions, mixer, clips } = useAnimations(animations, group)

  // Setup animation
  useEffect(() => {
    if (clips && clips.length > 0) {
      mixer.clipAction(clips[0]).play()
      setHasAnims(true)
    } else {
      setHasAnims(false)
    }
    return () => {
      mixer.paused = true
    }
  }, [])

  // handle play/pause (button press)
  useEffect(() => {
    mixer.clipAction(clips[0]).paused = !playing
  }, [playing])

  // Compute bounds and center
  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    return { box, size, center }
  }, [scene])

  return (
    <>
      <group ref={group}>
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
      <Bounds fit clip observe margin={0.1} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        target={
          orbitTarget || [bounds.center.x, bounds.center.y, bounds.center.z]
        }
        minDistance={minDistance}
        maxDistance={maxDistance}
        {...(minPolarAngle !== undefined ? { minPolarAngle } : {})}
        {...(maxPolarAngle !== undefined ? { maxPolarAngle } : {})}
      />
    </>
  )
}

useGLTF.preload = (url) => {}
