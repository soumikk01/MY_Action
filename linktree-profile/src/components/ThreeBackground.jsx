import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader, extend } from '@react-three/fiber'
import { OrbitControls, Stars, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import './ThreeBackground.css'

// Earth textures from online sources (NASA/ESA free textures)
const EARTH_TEXTURES = {
    albedo: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    bump: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    ocean: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
    night: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png',
    galaxy: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/galaxy.jpg',
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
function Earth({ mouseX, mouseY, scrollY }) {
    const earthRef = useRef()
    const cloudsRef = useRef()
    const atmosRef = useRef()
    const groupRef = useRef()
    const nightRef = useRef()

    // Load all textures
    const [albedoMap, bumpMap, oceanMap, cloudsMap, nightMap, galaxyMap] = useLoader(
        THREE.TextureLoader,
        [
            EARTH_TEXTURES.albedo,
            EARTH_TEXTURES.bump,
            EARTH_TEXTURES.ocean,
            EARTH_TEXTURES.clouds,
            EARTH_TEXTURES.night,
            EARTH_TEXTURES.galaxy,
        ]
    )

    // Set texture properties
    useMemo(() => {
        albedoMap.colorSpace = THREE.SRGBColorSpace
        nightMap.colorSpace = THREE.SRGBColorSpace
    }, [albedoMap, nightMap])

    useFrame((state) => {
        const elapsed = state.clock.elapsedTime

        if (earthRef.current) {
            // Slow rotation
            earthRef.current.rotation.y = elapsed * 0.05
        }

        if (cloudsRef.current) {
            // Clouds rotate slightly faster
            cloudsRef.current.rotation.y = elapsed * 0.07
        }

        if (groupRef.current) {
            // Earth's axial tilt is 23.5 degrees
            const axialTilt = (23.5 / 360) * 2 * Math.PI

            // Subtle mouse interaction
            const targetRotationX = mouseY * 0.1
            const targetRotationY = mouseX * 0.1

            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x,
                targetRotationY, // Note: Switching X/Y for more natural feel on desktop
                0.05
            )
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                -targetRotationX,
                0.05
            )
            groupRef.current.rotation.z = axialTilt

            // Scroll parallax - move Earth and add slight rotation
            const scrollOffset = scrollY * 0.002
            groupRef.current.position.y = THREE.MathUtils.lerp(
                groupRef.current.position.y,
                -scrollOffset,
                0.1
            )

            // Sync uv_xOffset for cloud shadows
            if (earthRef.current.material && earthRef.current.material.userData.shader) {
                const shader = earthRef.current.material.userData.shader
                // Use a constant delta for smooth linear progression
                const offset = (0.016 * 0.02) / (2 * Math.PI) // 60fps estimate for offset
                shader.uniforms.uv_xOffset.value += offset % 1
            }
        }
    })

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Main Earth sphere */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    map={albedoMap}
                    bumpMap={bumpMap}
                    bumpScale={0.03}
                    roughnessMap={oceanMap}
                    metalness={0.1}
                    metalnessMap={oceanMap}
                    emissiveMap={nightMap}
                    emissive={new THREE.Color(0xffff88)}
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
                                roughnessFactor *= clamp(texelRoughness.g, 0.5, 1.0);
                            #endif
                        `);

                        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
                            #ifdef USE_EMISSIVEMAP
                                vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
                                // Show lights only on dark side
                                #if NUM_DIR_LIGHTS > 0
                                    float lightMix = 1.0 - smoothstep(-0.02, 0.0, dot(vNormal, directionalLights[0].direction));
                                    emissiveColor *= lightMix;
                                #endif
                                totalEmissiveRadiance *= emissiveColor.rgb;
                            #endif

                            // Cloud shadows
                            float cloudsMapValue = texture2D(tClouds, vec2(vMapUv.x - uv_xOffset, vMapUv.y)).r;
                            diffuseColor.rgb *= max(1.0 - cloudsMapValue, 0.2);

                            // Atmospheric fresnel on Earth surface
                            float intensity = 1.4 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );
                            vec3 atmosphere = vec3( 0.3, 0.6, 1.0 ) * pow(intensity, 5.0);
                            diffuseColor.rgb += atmosphere;
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

            {/* Atmospheric glow - Outer Rim */}
            <mesh ref={atmosRef} scale={1.12}>
                <sphereGeometry args={[2, 64, 64]} />
                <atmosphereMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    atmOpacity={0.6}
                    atmPowFactor={4.1}
                    atmMultiplier={9.5}
                />
            </mesh>

            {/* Atmosphere Halo - Extra Bloom/Detail */}
            <mesh scale={1.2}>
                <sphereGeometry args={[2, 64, 64]} />
                <atmosphereMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    atmOpacity={0.2}
                    atmPowFactor={2.0}
                    atmMultiplier={3.0}
                />
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
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02 + mouseX * 0.1
            particlesRef.current.rotation.x = mouseY * 0.1
            particlesRef.current.position.y = -scrollY * 0.002
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

// Orbital ring decoration
function OrbitalRing({ radius, color, rotationSpeed, tilt }) {
    const ringRef = useRef()

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed
        }
    })

    return (
        <mesh ref={ringRef} rotation={[tilt, 0, 0]} position={[3, 0, 0]}>
            <torusGeometry args={[radius, 0.02, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
    )
}

// Floating geometric accents
function FloatingAccent({ position, color, mouseX, mouseY }) {
    const meshRef = useRef()
    const initialPos = useMemo(() => new THREE.Vector3(...position), [position])

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.3
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2

            meshRef.current.position.x = initialPos.x + mouseX * 0.5
            meshRef.current.position.y = initialPos.y + mouseY * 0.5 + Math.sin(state.clock.elapsedTime) * 0.3
        }
    })

    return (
        <mesh ref={meshRef} position={position}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
        </mesh>
    )
}

// Main scene
function Scene({ mouseX, mouseY, scrollY }) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.1} />
            <directionalLight
                position={[-10, 5, 5]}
                intensity={2}
                color="#ffffff"
            />
            <pointLight position={[10, 10, 10]} intensity={0.3} color="#a3e635" />

            {/* Galaxy Background */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
                <sphereGeometry args={[100, 64, 64]} />
                <meshBasicMaterial
                    map={galaxyMap}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Main Earth */}
            <Earth mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />

            {/* Cosmic particles */}
            <CosmicParticles mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />

            {/* Orbital rings */}
            <OrbitalRing radius={3} color="#a3e635" rotationSpeed={0.1} tilt={Math.PI / 4} />
            <OrbitalRing radius={3.5} color="#22d3ee" rotationSpeed={-0.08} tilt={-Math.PI / 3} />

            {/* Floating accents */}
            <FloatingAccent position={[4, 2, -3]} color="#a3e635" mouseX={mouseX} mouseY={mouseY} />
            <FloatingAccent position={[5, -2, -2]} color="#22d3ee" mouseX={mouseX} mouseY={mouseY} />
            <FloatingAccent position={[3, 3, -4]} color="#a855f7" mouseX={mouseX} mouseY={mouseY} />
        </>
    )
}

// Canvas wrapper
function CanvasContent() {
    const mousePosition = useMousePosition()
    const scrollY = useScrollPosition()

    return <Scene mouseX={mousePosition.x} mouseY={mousePosition.y} scrollY={scrollY} />
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

export default function ThreeBackground() {
    return (
        <div className="three-background">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
                <React.Suspense fallback={<Loader />}>
                    <CanvasContent />
                </React.Suspense>
            </Canvas>
        </div>
    )
}
