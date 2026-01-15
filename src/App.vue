<template>
  <div class="app-root">
    <StarfieldBackground />
    <div class="app-content">
      <CountdownTimer />
    </div>
  </div>
</template>

<script setup>
import CountdownTimer from './components/CountdownTimer.vue'
import StarfieldBackground from './components/StarfieldBackground.vue'
</script>

<style scoped>
.app-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-content {
  position: relative;
  z-index: 1;
  height: 100%;
}
</style>
