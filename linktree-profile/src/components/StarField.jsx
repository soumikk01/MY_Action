import { useEffect, useRef } from 'react'

const StarField = () => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationFrameId
        let stars = []

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        // Star class
        class Star {
            constructor() {
                this.reset()
            }

            reset() {
                this.x = Math.random() * canvas.width
                this.y = Math.random() * canvas.height
                this.z = Math.random() * canvas.width
                this.size = Math.random() * 2 + 0.5
                this.speed = Math.random() * 0.5 + 0.2
                this.opacity = Math.random() * 0.5 + 0.3
                this.twinkleSpeed = Math.random() * 0.02 + 0.01
                this.twinklePhase = Math.random() * Math.PI * 2
            }

            update() {
                // Move star towards viewer (z-axis)
                this.z -= this.speed * 2

                // Reset if star passes viewer
                if (this.z <= 0) {
                    this.z = canvas.width
                    this.x = Math.random() * canvas.width
                    this.y = Math.random() * canvas.height
                }

                // Twinkle effect
                this.twinklePhase += this.twinkleSpeed
                this.currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.twinklePhase))
            }

            draw() {
                // Project 3D to 2D
                const scale = canvas.width / this.z
                const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2
                const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2
                const size2d = this.size * scale * 0.5

                // Only draw if on screen
                if (x2d < 0 || x2d > canvas.width || y2d < 0 || y2d > canvas.height) {
                    return
                }

                // Draw star with glow
                const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size2d * 3)
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.currentOpacity})`)
                gradient.addColorStop(0.3, `rgba(200, 220, 255, ${this.currentOpacity * 0.5})`)
                gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')

                ctx.beginPath()
                ctx.arc(x2d, y2d, size2d * 3, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()

                // Draw core
                ctx.beginPath()
                ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${this.currentOpacity})`
                ctx.fill()
            }
        }

        // Initialize stars
        const initStars = () => {
            stars = []
            const numStars = Math.floor((canvas.width * canvas.height) / 3000)
            for (let i = 0; i < numStars; i++) {
                stars.push(new Star())
            }
        }

        // Animation loop
        const animate = () => {
            // Create trail effect
            ctx.fillStyle = 'rgba(10, 10, 15, 0.15)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Update and draw stars
            stars.forEach(star => {
                star.update()
                star.draw()
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        // Handle resize
        const handleResize = () => {
            resizeCanvas()
            initStars()
        }

        // Initialize
        resizeCanvas()
        initStars()

        // Initial fill
        ctx.fillStyle = '#0a0a0f'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        animate()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    )
}

export default StarField
