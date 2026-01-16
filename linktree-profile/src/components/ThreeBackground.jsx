import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader, extend } from '@react-three/fiber'
import { OrbitControls, Stars, shaderMaterial, Trail } from '@react-three/drei'
import * as THREE from 'three'
import './ThreeBackground.css'

// Earth textures from online sources (NASA/ESA free textures)
const EARTH_TEXTURES = {
    albedo: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    bump: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    ocean: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
    night: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png',
}

// Custom hook for mouse position
function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return mousePosition
}

// Custom hook for scroll position
function useScrollPosition() {
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return scrollY
}

// Atmosphere shader material
const AtmosphereMaterial = shaderMaterial(
    {
        atmOpacity: 0.7,
        atmPowFactor: 4.1,
        atmMultiplier: 9.5,
    },
    // Vertex shader
    `
    varying vec3 vNormal;
    varying vec3 eyeVector;

    void main() {
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      eyeVector = normalize(mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
    // Fragment shader
    `
    varying vec3 vNormal;
    varying vec3 eyeVector;
    uniform float atmOpacity;
    uniform float atmPowFactor;
    uniform float atmMultiplier;

    void main() {
      float dotP = dot(vNormal, eyeVector);
      float factor = pow(dotP, atmPowFactor) * atmMultiplier;
      vec3 atmColor = vec3(0.35 + dotP/4.5, 0.35 + dotP/4.5, 1.0);
      gl_FragColor = vec4(atmColor, atmOpacity) * factor;
    }
  `
)

extend({ AtmosphereMaterial })

// Earth component with all effects
function Earth({ mouseX, mouseY, scrollY, isIntro = false }) {
    const earthRef = useRef()
    const cloudsRef = useRef()
    const atmosRef = useRef()
    const groupRef = useRef()
    const nightRef = useRef()
    const introProgress = useRef(0)

    // Load all textures
    const [albedoMap, bumpMap, oceanMap, cloudsMap, nightMap] = useLoader(
        THREE.TextureLoader,
        [
            EARTH_TEXTURES.albedo,
            EARTH_TEXTURES.bump,
            EARTH_TEXTURES.ocean,
            EARTH_TEXTURES.clouds,
            EARTH_TEXTURES.night,
        ]
    )

    // Set texture properties
    useMemo(() => {
        albedoMap.colorSpace = THREE.SRGBColorSpace
        nightMap.colorSpace = THREE.SRGBColorSpace
    }, [albedoMap, nightMap])

    useFrame((state) => {
        const elapsed = state.clock.elapsedTime

        // Calculate scroll progress (0 to 1 based on page height)
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollProgress = Math.min(scrollY / Math.max(docHeight, 1), 1)

        if (earthRef.current) {
            // Dynamic rotation speed - faster when scrolling through middle sections
            const baseRotationSpeed = 0.15
            const scrollBoost = Math.sin(scrollProgress * Math.PI) * 0.1 // Peak at middle
            earthRef.current.rotation.y = elapsed * (baseRotationSpeed + scrollBoost)
        }

        if (cloudsRef.current) {
            // Clouds have extra dynamic rotation
            const cloudSpeed = 0.17 + Math.sin(elapsed * 0.5) * 0.02
            cloudsRef.current.rotation.y = elapsed * cloudSpeed
        }

        if (groupRef.current) {
            // Earth's axial tilt with subtle wobble
            const axialTilt = (23.5 / 360) * 2 * Math.PI
            const wobble = Math.sin(elapsed * 0.3) * 0.03

            // Enhanced mouse interaction with smooth damping
            const targetRotationX = mouseY * 0.15
            const targetRotationY = mouseX * 0.15

            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x,
                targetRotationY + wobble,
                0.03 // Slower, smoother
            )
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                -targetRotationX,
                0.03
            )
            groupRef.current.rotation.z = axialTilt + Math.sin(elapsed * 0.2) * 0.02

            // ===== ENHANCED SCROLL-BASED POSITION ANIMATION =====

            // Earth X position: Smooth sine curve movement (more organic)
            const easeProgress = (1 - Math.cos(scrollProgress * Math.PI)) / 2 // Ease in-out
            const targetX = 4 - (easeProgress * 8) // 4 → 0 → -4

            // Earth Y position: Floating effect + scroll parallax
            const floatingY = Math.sin(elapsed * 0.5) * 0.15 // Gentle floating
            const scrollY_offset = -scrollProgress * 1.5
            const targetY = floatingY + scrollY_offset

            // Earth Z position: Depth movement for 3D effect
            const depthCurve = Math.sin(scrollProgress * Math.PI * 2) * 1.5 // Wave pattern
            const targetZ = depthCurve

            // Super smooth lerping for buttery animations
            groupRef.current.position.x = THREE.MathUtils.lerp(
                groupRef.current.position.x,
                targetX,
                0.04 // Very smooth
            )
            groupRef.current.position.y = THREE.MathUtils.lerp(
                groupRef.current.position.y,
                targetY,
                0.06
            )
            groupRef.current.position.z = THREE.MathUtils.lerp(
                groupRef.current.position.z,
                targetZ,
                0.05
            )

            // Dynamic scale: Breathe effect + scroll-based size
            const breathe = 1 + Math.sin(elapsed * 0.4) * 0.02
            const scrollScale = 1 + Math.sin(scrollProgress * Math.PI) * 0.2
            const targetScale = breathe * scrollScale

            groupRef.current.scale.setScalar(
                THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.03)
            )

            // Sync uv_xOffset for cloud shadows
            if (earthRef.current.material && earthRef.current.material.userData.shader) {
                const shader = earthRef.current.material.userData.shader
                shader.uniforms.uv_xOffset.value += 0.0001
            }
        }
    })

    const moonRef = useRef()
    useFrame((state) => {
        if (moonRef.current) {
            const t = state.clock.elapsedTime * 0.1
            moonRef.current.position.x = Math.cos(t) * 10
            moonRef.current.position.z = Math.sin(t) * 10
            moonRef.current.rotation.y += 0.002
        }
    })

    return (
        <group ref={groupRef} position={[3, 0, 0]}>
            {/* Main Earth sphere */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    map={albedoMap}
                    bumpMap={bumpMap}
                    bumpScale={0.05}
                    roughnessMap={oceanMap}
                    metalness={0.5}
                    metalnessMap={oceanMap}
                    emissiveMap={nightMap}
                    emissive={new THREE.Color(0xffaa55)} // Warmer city lights
                    onBeforeCompile={(shader) => {
                        shader.uniforms.tClouds = { value: cloudsMap }
                        shader.uniforms.tClouds.value.wrapS = THREE.RepeatWrapping
                        shader.uniforms.uv_xOffset = { value: 0 }

                        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
                            #include <common>
                            uniform sampler2D tClouds;
                            uniform float uv_xOffset;
                        `);

                        shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `
                            float roughnessFactor = roughness;
                            #ifdef USE_ROUGHNESSMAP
                                vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
                                // Reversing because ocean map is white for water
                                texelRoughness = vec4(1.0) - texelRoughness;
                                // Make oceans very shiny (0.15), land rough (1.0)
                                roughnessFactor *= clamp(texelRoughness.g, 0.15, 1.0);
                            #endif
                        `);

                        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
                            #ifdef USE_EMISSIVEMAP
                                vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
                                // Show lights only on dark side
                                #if NUM_DIR_LIGHTS > 0
                                    float lightMix = 1.0 - smoothstep(-0.1, 0.2, dot(vNormal, directionalLights[0].direction));
                                    emissiveColor *= lightMix;
                                #endif
                                totalEmissiveRadiance *= emissiveColor.rgb * 1.5; // Boost light intensity
                            #endif

                            // Cloud shadows
                            float cloudsMapValue = texture2D(tClouds, vec2(vMapUv.x - uv_xOffset, vMapUv.y)).r;
                            diffuseColor.rgb *= max(1.0 - cloudsMapValue, 0.2);

                            // Atmospheric fresnel on Earth surface
                            float intensity = 1.3 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );
                            vec3 atmosphere = vec3( 0.3, 0.6, 1.0 ) * pow(intensity, 4.0);
                            diffuseColor.rgb += atmosphere * 0.5;
                        `);

                        earthRef.current.material.userData.shader = shader
                    }}
                />
            </mesh>

            {/* Clouds layer - Separate mesh for floating effect */}
            <mesh ref={cloudsRef} scale={1.01}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    alphaMap={cloudsMap}
                    transparent
                    opacity={0.4}
                    depthWrite={false}
                />
            </mesh>

            {/* Realistic Atmosphere Halo */}
            <mesh ref={atmosRef} scale={1.2}>
                <sphereGeometry args={[2, 32, 32]} />
                <atmosphereMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    atmOpacity={0.3}
                    atmPowFactor={3.5}
                    atmMultiplier={8.0}
                />
            </mesh>

            {/* Simple Moon */}
            <mesh ref={moonRef} scale={0.15}>
                <sphereGeometry args={[1, 12, 12]} />
                <meshStandardMaterial color="#cccccc" roughness={0.9} />
            </mesh>

            {/* Visual Moon Orbit Path */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[10, 0.02, 16, 100]} />
                <meshBasicMaterial color="#ffffff" opacity={0.1} transparent />
            </mesh>
        </group>
    )
}

// Floating particles around Earth
function CosmicParticles({ mouseX, mouseY, scrollY }) {
    const particlesRef = useRef()
    const count = 300

    const [positions, colors, sizes] = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)

        const colorPalette = [
            new THREE.Color('#a3e635'),
            new THREE.Color('#22d3ee'),
            new THREE.Color('#a855f7'),
            new THREE.Color('#ffffff'),
        ]

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            // Spread particles around
            const radius = 5 + Math.random() * 15
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = radius * Math.cos(phi) - 5

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
            colors[i3] = color.r
            colors[i3 + 1] = color.g
            colors[i3 + 2] = color.b

            sizes[i] = Math.random() * 0.1 + 0.02
        }

        return [positions, colors, sizes]
    }, [])

    useFrame((state) => {
        if (particlesRef.current) {
            const elapsed = state.clock.elapsedTime

            // Calculate scroll progress
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollProgress = Math.min(scrollY / Math.max(docHeight, 1), 1)

            // Dynamic rotation - particles swirl as you scroll
            const baseRotation = elapsed * 0.02
            const scrollRotation = scrollProgress * Math.PI * 0.5 // Extra rotation based on scroll
            particlesRef.current.rotation.y = baseRotation + scrollRotation + mouseX * 0.15
            particlesRef.current.rotation.x = Math.sin(elapsed * 0.3) * 0.1 + mouseY * 0.15

            // Particles follow Earth's X journey
            const particleX = 2 - (scrollProgress * 4) // Slight offset from Earth
            particlesRef.current.position.x = THREE.MathUtils.lerp(
                particlesRef.current.position.x,
                particleX,
                0.03
            )
            particlesRef.current.position.y = -scrollProgress * 1 + Math.sin(elapsed * 0.4) * 0.2

            // Pulse scale effect
            const pulse = 1 + Math.sin(elapsed * 0.8) * 0.1
            particlesRef.current.scale.setScalar(pulse)
        }
    })

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}





// Animated Comet
function Comet() {
    const cometRef = useRef()

    useFrame((state) => {
        if (cometRef.current) {
            // Move comet
            cometRef.current.position.x -= 0.15
            cometRef.current.position.y -= 0.05
            cometRef.current.position.z += 0.05

            // Reset when out of view
            if (cometRef.current.position.x < -15) {
                const randomDelay = Math.random() * 5
                cometRef.current.position.x = 15 + Math.random() * 10 + randomDelay
                cometRef.current.position.y = 10 + Math.random() * 5
                cometRef.current.position.z = -10 + Math.random() * 5
            }
        }
    })

    return (
        <mesh ref={cometRef} position={[20, 10, -10]}>
            {/* Dynamic light from comet */}
            <pointLight distance={25} intensity={5} color="#22d3ee" decay={2} />

            <Trail
                width={3}
                length={12}
                color={new THREE.Color('#22d3ee')}
                attenuation={(t) => t * t}
            >
                <mesh>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
            </Trail>

            {/* Glow effect */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} />
            </mesh>
        </mesh>
    )
}

// Detailed Satellite (ISS-like)
function Satellite({ radius = 4.5, speed = 0.2, tilt = 0, initialAngle = 0, scale = 0.15 }) {
    const satRef = useRef()
    const solarRef = useRef()

    useFrame((state) => {
        if (satRef.current) {
            // Orbit logic
            const time = state.clock.elapsedTime * speed + initialAngle

            // Parametric orbit equation
            satRef.current.position.x = Math.sin(time) * radius + 3.5
            satRef.current.position.z = Math.cos(time) * radius
            satRef.current.position.y = Math.cos(time * 0.5) * (radius * 0.3)

            // Rotation
            satRef.current.rotation.y = time
            satRef.current.rotation.z = Math.sin(time) * 0.2
            satRef.current.rotation.x = tilt
        }
    })

    // Blinking light logic
    const [blink, setBlink] = useState(false)
    useEffect(() => {
        const interval = setInterval(() => setBlink(b => !b), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <group ref={satRef} scale={scale}>
            {/* Main Body - Foil covered */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 2.5, 8]} />
                <meshStandardMaterial color="#e0c090" metalness={0.9} roughness={0.3} />
            </mesh>

            {/* Habitation Module */}
            <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
                <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Docking Port */}
            <mesh position={[2.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Solar Array Truss */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
                <meshStandardMaterial color="#888888" />
            </mesh>

            {/* Solar Panels (Detailed) */}
            <group ref={solarRef}>
                {/* Left Arrays */}
                <mesh position={[0, 0, 2]}>
                    <boxGeometry args={[1.2, 0.02, 3]} />
                    <meshStandardMaterial color="#102050" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
                </mesh>

                {/* Right Arrays */}
                <mesh position={[0, 0, -2]}>
                    <boxGeometry args={[1.2, 0.02, 3]} />
                    <meshStandardMaterial color="#102050" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Comms Dish */}
            <group position={[-0.8, 0.8, 0]} rotation={[0, 0, Math.PI / 3]}>
                <mesh>
                    <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
                    <meshStandardMaterial color="#eeeeee" side={THREE.DoubleSide} metalness={0.5} />
                </mesh>
                <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.4]} />
                    <meshBasicMaterial color="#333333" />
                </mesh>
            </group>

            {/* Blinking Navigation Light */}
            <mesh position={[1.8, 0.4, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color={blink ? "#ff0000" : "#330000"} />
                {blink && <pointLight color="#ff0000" intensity={1} distance={2} />}
            </mesh>
        </group>
    )
}

// Enhanced Sun with Glow and Orbit - Hidden Mesh
function Sun() {
    const sunGroup = useRef()

    useFrame((state) => {
        if (sunGroup.current) {
            const time = state.clock.elapsedTime * 0.05 // Very slow orbit
            sunGroup.current.position.x = Math.sin(time) * 60
            sunGroup.current.position.z = Math.cos(time) * 60 - 20
            sunGroup.current.position.y = 20 + Math.cos(time * 0.5) * 10

            sunGroup.current.lookAt(0, 0, 0)
        }
    })

    return (
        <group ref={sunGroup}>
            {/* Light Source - Only this remains */}
            <directionalLight intensity={2.5} color="#ffffff" castShadow />
        </group>
    )
}

// Main scene
function Scene({ mouseX, mouseY, scrollY, isIntro }) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.05} />
            {/* Directional Light moved to Sun component for correct shadows/shading direction */}

            {/* Stars background - use Drei's optimized component */}
            <Stars
                radius={200}
                depth={50}
                count={7000}
                factor={4}
                saturation={0}
                fade
                speed={0.2}
            />

            {/* Enhanced Sun */}
            <Sun />

            {/* Main Earth */}
            <Earth mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} isIntro={isIntro} />

            {/* Satellite Station */}
            <Satellite radius={4.5} speed={0.2} tilt={0} initialAngle={0} scale={0.15} />
            <Satellite radius={5.5} speed={0.15} tilt={0.5} initialAngle={Math.PI} scale={0.1} />

            {/* Cosmic particles */}
            <CosmicParticles mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />

            {/* Animated Comet */}
            <Comet />




        </>
    )
}

// Canvas wrapper
function CanvasContent({ isIntro }) {
    const mousePosition = useMousePosition()
    const scrollY = useScrollPosition()

    return <Scene mouseX={mousePosition.x} mouseY={mousePosition.y} scrollY={scrollY} isIntro={isIntro} />
}

// Loading fallback
function Loader() {
    return (
        <mesh>
            <sphereGeometry args={[2, 16, 16]} />
            <meshBasicMaterial color="#1a1a2e" wireframe />
        </mesh>
    )
}

export default function ThreeBackground({ isIntro = false }) {
    return (
        <div className="three-background">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
                <React.Suspense fallback={<Loader />}>
                    <CanvasContent isIntro={isIntro} />
                </React.Suspense>
            </Canvas>
        </div>
    )
}

