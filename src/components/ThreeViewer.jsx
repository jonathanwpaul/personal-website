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
export default function ThreeViewer({
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
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0) // 0..1
  const [hasAnims, setHasAnims] = useState(false)
  const resumeTimer = useRef(null)

  const onUserInteract = useCallback(() => {
    if (hasAnims) setPlaying(false)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      setPlaying(true)
    }, resumeDelayMs)
  }, [resumeDelayMs, hasAnims])

  useEffect(
    () => () => resumeTimer.current && clearTimeout(resumeTimer.current),
    [],
  )

  return (
    <div
      className={`relative w-full h-full min-h-[40vh] rounded-lg p-4 border border-primary/30 bg-background/80 ${className}`}
      style={style}
    >
      <Canvas camera={{ fov }} shadows gl={{ antialias: true, alpha: true }}>
        {/* transparent canvas: leave scene.background = null */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} castShadow />
        <Suspense fallback={null}>
          {modelUrl ? (
            <Scene
              modelUrl={modelUrl}
              playing={playing}
              progress={progress}
              setPlaying={setPlaying}
              setDuration={setDuration}
              setHasAnims={setHasAnims}
              onUserInteract={onUserInteract}
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
        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 bg-background/70 backdrop-blur rounded-md px-3 py-2 ">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="px-2 py-1 text-sm rounded border border-secondary/40 hover:border-secondary/60"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <input
            aria-label="Animation progress"
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            onInput={onUserInteract}
            onMouseDown={onUserInteract}
            onTouchStart={onUserInteract}
            className="w-full accent-secondary"
          />
          <span className="text-xs w-14 text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}

function Scene({
  modelUrl,
  playing,
  progress,
  setPlaying,
  setDuration,
  setHasAnims,
  onUserInteract,
  orbitTarget,
  minDistance,
  maxDistance,
  minPolarAngle,
  maxPolarAngle,
}) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelUrl)
  const { actions, mixer, clips } = useAnimations(animations, group)
  const actionRef = useRef(null)
  const durationRef = useRef(0)
  const progressRef = useRef(0)
  const lastTimeRef = useRef(0)
  const userDraggingRef = useRef(false)

  // keep internal progressRef synced from parent state
  useEffect(() => {
    progressRef.current = progress
    if (!playing && actionRef.current && durationRef.current) {
      const targetTime = progress * durationRef.current
      actionRef.current.time = targetTime
      mixer.setTime(targetTime)
    }
  }, [progress, playing, mixer])

  // Setup animation
  useEffect(() => {
    if (clips && clips.length > 0) {
      const clip = clips[0]
      durationRef.current = clip.duration || 0
      setDuration(durationRef.current)
      setHasAnims(true)
      // Create or reuse action
      const action = (actions[clip.name] ||= mixer.clipAction(
        clip,
        group.current,
      ))
      action.loop = THREE.LoopRepeat
      action.clampWhenFinished = false
      action.play()
      actionRef.current = action
      if (!playing) action.paused = true
    } else {
      setHasAnims(false)
    }
    return () => {
      mixer.stopAllAction()
    }
  }, [clips, actions, mixer, playing, setDuration, setHasAnims])

  // Reflect playing state into action pause
  useEffect(() => {
    if (actionRef.current) actionRef.current.paused = !playing
  }, [playing])

  // Drive animation when playing; sync slider
  useFrame((state, delta) => {
    if (!mixer || !actionRef.current || durationRef.current === 0) return
    if (playing) {
      mixer.update(delta)
      const time = actionRef.current.time % durationRef.current
      progressRef.current = time / durationRef.current
    } else {
      // When paused, keep mixer in sync with progressRef
      const targetTime = progressRef.current * durationRef.current
      actionRef.current.time = targetTime
      mixer.setTime(targetTime)
    }
  })

  // Compute bounds and center
  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    return { box, size, center }
  }, [scene])

  // Controls events to mark user drag (optional use)
  const onStart = () => onUserInteract && onUserInteract()

  return (
    <>
      <group ref={group}>
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
      <Bounds fit clip observe margin={0.1}>
        {/* bounds wrapper ensures model fits in view */}
      </Bounds>
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
        onStart={onStart}
        onChange={onStart}
      />
    </>
  )
}

useGLTF.preload = (url) => {}
