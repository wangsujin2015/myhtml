<template>
  <div class="countdown-container">
    <el-card class="countdown-card" shadow="hover">
      <template #header>
        <h1 class="title">春节放假</h1>
      </template>
      
      <div class="date-picker-section">
        <div class="date-input-wrapper">
          <el-input
            :model-value="targetDate"
            placeholder="选择目标日期"
            readonly
            size="large"
            class="date-input"
            @click="showCustomCalendar = true"
          >
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-input>
          <el-button 
            type="primary" 
            size="large"
            @click="showCustomCalendar = true"
          >
            选择日期
          </el-button>
        </div>
        
        <div v-if="selectedFestival" class="festival-info">
          <el-tag type="success" size="large">
            <span style="margin-right: 5px;">🎉</span>
            {{ selectedFestival }}
          </el-tag>
        </div>
      </div>

      <!-- 自定义日历弹窗 -->
      <CustomCalendar
        v-model="showCustomCalendar"
        :selected-date="targetDate"
        @confirm="handleCalendarConfirm"
      />

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
import { ElCard, ElInput, ElButton, ElText, ElTag, ElIcon } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'
import { getFestival, getAllFestivals, getDateType } from '../utils/festivals.js'
import CustomCalendar from './CustomCalendar.vue'

const targetDate = ref('')
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer = null
const festivals = ref({})
const showCustomCalendar = ref(false)

const selectedFestival = computed(() => {
  if (!targetDate.value) return null
  return getFestival(targetDate.value)
})



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
    // 更新节日数据（加载当前年份和前后各一年的数据）
    const year = new Date(targetDate.value).getFullYear()
    const currentYearFestivals = getAllFestivals(year)
    const prevYearFestivals = getAllFestivals(year - 1)
    const nextYearFestivals = getAllFestivals(year + 1)
    festivals.value = { ...prevYearFestivals, ...currentYearFestivals, ...nextYearFestivals }
  }
}

// 处理自定义日历确认
const handleCalendarConfirm = (date) => {
  targetDate.value = date
  handleDateChange()
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
  
  // 初始化节日数据（加载当前年份和前后各一年的数据，以便切换月份时也能显示）
  const year = new Date(targetDate.value).getFullYear()
  const currentYearFestivals = getAllFestivals(year)
  const prevYearFestivals = getAllFestivals(year - 1)
  const nextYearFestivals = getAllFestivals(year + 1)
  festivals.value = { ...prevYearFestivals, ...currentYearFestivals, ...nextYearFestivals }
  
  
  calculateTimeLeft()
  timer = setInterval(calculateTimeLeft, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.countdown-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: visible;
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
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
  width: 100%;
}

.date-input-wrapper {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
}

.date-input {
  width: 300px;
  cursor: pointer;
}

.date-input :deep(.el-input__inner) {
  cursor: pointer;
}

.festival-info {
  margin-top: 15px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 节日日期标记样式 - 使用更具体的选择器 */
:deep(.el-date-table .festival-day) {
  position: relative;
}

:deep(.el-date-table .festival-day .el-date-table__cell) {
  color: #f56c6c !important;
  font-weight: 600;
  position: relative;
}

:deep(.el-date-table .festival-day .el-date-table__cell .el-date-table__cell-text) {
  color: #f56c6c !important;
  font-weight: 600;
}

:deep(.el-date-table .festival-day .el-date-table__cell::after) {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: #f56c6c;
  border-radius: 50%;
  z-index: 10;
  display: block;
}

/* 当前选中日期如果是节日，也要显示标记 */
:deep(.el-date-table__cell.current.festival-day) {
  border-color: #f56c6c !important;
}

/* 确保节日标记在悬停时也可见 */
:deep(.festival-day .el-date-table__cell:hover) {
  color: #f56c6c !important;
}

/* 确保节日日期文字始终是红色 */
:deep(.festival-day .el-date-table__cell-text) {
  color: #f56c6c !important;
}

/* 全局样式 - 确保节日标记在所有情况下都显示 */
:deep(.festival-day) {
  position: relative;
}

:deep(.festival-day .el-date-table__cell) {
  color: #f56c6c !important;
}

:deep(.festival-day .el-date-table__cell-text) {
  color: #f56c6c !important;
  font-weight: 600;
}

:deep(.festival-day .el-date-table__cell::after) {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: #f56c6c;
  border-radius: 50%;
  z-index: 10;
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
