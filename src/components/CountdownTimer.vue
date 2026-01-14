<template>
  <div class="countdown-container">
    <el-card class="countdown-card" shadow="hover">
      <template #header>
        <h1 class="title">距离春节放假</h1>
      </template>
      
      <div class="date-picker-section">
        <el-date-picker
          v-model="targetDate"
          type="date"
          placeholder="选择目标日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          size="large"
          class="date-picker"
        />
      </div>

      <div class="countdown-grid">
        <div class="time-box">
          <div class="number" :key="timeLeft.days">{{ timeLeft.days }}</div>
          <div class="label">天</div>
        </div>
        <div class="time-box">
          <div class="number" :key="timeLeft.hours">{{ String(timeLeft.hours).padStart(2, '0') }}</div>
          <div class="label">时</div>
        </div>
        <div class="time-box">
          <div class="number" :key="timeLeft.minutes">{{ String(timeLeft.minutes).padStart(2, '0') }}</div>
          <div class="label">分</div>
        </div>
        <div class="time-box">
          <div class="number" :key="timeLeft.seconds">{{ String(timeLeft.seconds).padStart(2, '0') }}</div>
          <div class="label">秒</div>
        </div>
      </div>

      <div class="target-date-info">
        <el-text type="info" size="large">
          目标日期：{{ formattedTargetDate }}
        </el-text>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElCard, ElDatePicker, ElText } from 'element-plus'

const targetDate = ref('')
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer = null

const formattedTargetDate = computed(() => {
  if (!targetDate.value) return ''
  const date = new Date(targetDate.value)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const calculateTimeLeft = () => {
  if (!targetDate.value) return
  
  const now = new Date()
  const target = new Date(targetDate.value + 'T23:59:59')
  const diff = target - now

  if (diff <= 0) {
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  timeLeft.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
}

const handleDateChange = () => {
  if (targetDate.value) {
    localStorage.setItem('targetDate', targetDate.value)
    calculateTimeLeft()
  }
}

onMounted(() => {
  const saved = localStorage.getItem('targetDate')
  if (saved) {
    targetDate.value = saved
  } else {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    targetDate.value = defaultDate.toISOString().split('T')[0]
    localStorage.setItem('targetDate', targetDate.value)
  }
  
  calculateTimeLeft()
  timer = setInterval(calculateTimeLeft, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.countdown-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.countdown-card {
  max-width: 900px;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

:deep(.el-card__header) {
  padding: 30px;
  text-align: center;
  border-bottom: none;
}

.title {
  font-size: 2.5rem;
  font-weight: 300;
  color: #333;
  margin: 0;
}

.date-picker-section {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.date-picker {
  width: 300px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #e0e0e0 inset;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #667eea inset, 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 40px 0;
}

.time-box {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 30px 20px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.time-box:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.number {
  font-size: 3.5rem;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  display: block;
}

.label {
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
}

.target-date-info {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .countdown-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .number {
    font-size: 2.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .countdown-card {
    margin: 10px;
  }
  
  :deep(.el-card__header) {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .countdown-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .time-box {
    padding: 20px 15px;
  }
  
  .number {
    font-size: 2rem;
  }
  
  .label {
    font-size: 0.9rem;
  }
}
</style>
