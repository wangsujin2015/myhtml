<template>
  <canvas ref="canvasRef" class="starfield-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let animationId = null
let stars = []
let size = { width: 0, height: 0, dpr: 1 }

const STAR_DENSITY = 0.00012
const MIN_STAR_SIZE = 0.5
const MAX_STAR_SIZE = 1.9
const CENTER_CLEAR_RADIUS = 220
const EDGE_FADE_RADIUS = 420

const randomBetween = (min, max) => Math.random() * (max - min) + min

const getCanvasSize = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  return { width, height, dpr }
}

const buildStars = (width, height) => {
  const count = Math.floor(width * height * STAR_DENSITY)
  const cx = width / 2
  const cy = height / 2

  return Array.from({ length: count }, () => {
    const x = Math.random() * width
    const y = Math.random() * height
    const dist = Math.hypot(x - cx, y - cy)
    const fade = Math.min(1, Math.max(0, (dist - CENTER_CLEAR_RADIUS) / EDGE_FADE_RADIUS))

    return {
      x,
      y,
      radius: randomBetween(MIN_STAR_SIZE, MAX_STAR_SIZE),
      alpha: randomBetween(0.35, 1) * (0.5 + fade * 0.5),
      twinkleSpeed: randomBetween(0.4, 1.2),
      twinkleOffset: Math.random() * Math.PI * 2,
      hueShift: randomBetween(-12, 12),
    }
  })
}

const drawBackground = (ctx, width, height) => {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#05040e')
  gradient.addColorStop(0.45, '#0b1026')
  gradient.addColorStop(1, '#111827')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const softGlow = ctx.createRadialGradient(width * 0.2, height * 0.2, 0, width * 0.2, height * 0.2, width * 0.6)
  softGlow.addColorStop(0, 'rgba(94, 120, 255, 0.16)')
  softGlow.addColorStop(0.6, 'rgba(56, 68, 150, 0.06)')
  softGlow.addColorStop(1, 'rgba(10, 12, 35, 0)')
  ctx.fillStyle = softGlow
  ctx.fillRect(0, 0, width, height)

  const accentGlow = ctx.createRadialGradient(width * 0.8, height * 0.75, 0, width * 0.8, height * 0.75, width * 0.55)
  accentGlow.addColorStop(0, 'rgba(160, 110, 255, 0.14)')
  accentGlow.addColorStop(0.55, 'rgba(80, 60, 150, 0.06)')
  accentGlow.addColorStop(1, 'rgba(8, 10, 30, 0)')
  ctx.fillStyle = accentGlow
  ctx.fillRect(0, 0, width, height)

  const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7)
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
}

const render = (time) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = size
  ctx.clearRect(0, 0, width, height)
  drawBackground(ctx, width, height)

  const t = time * 0.001
  for (const star of stars) {
    const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.35 + 0.65
    const alpha = star.alpha * twinkle
    ctx.beginPath()
    ctx.fillStyle = `hsla(${210 + star.hueShift}, 80%, 90%, ${alpha})`
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  animationId = window.requestAnimationFrame(render)
}

const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  size = getCanvasSize()
  canvas.width = size.width * size.dpr
  canvas.height = size.height * size.dpr
  canvas.style.width = `${size.width}px`
  canvas.style.height = `${size.height}px`
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
  stars = buildStars(size.width, size.height)
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (prefersReducedMotion.matches) {
    render(0)
    return
  }
  animationId = window.requestAnimationFrame(render)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animationId) window.cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.starfield-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
