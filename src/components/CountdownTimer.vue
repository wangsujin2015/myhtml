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
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: visible;
  z-index: 1;
}

.countdown-card {
  max-width: 900px;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(30, 41, 59, 0.72));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 12px 32px rgba(2, 6, 23, 0.6),
              inset 0 1px 0 rgba(148, 163, 184, 0.12);
  transition: all 0.3s ease;
}

.countdown-card:hover {
  background: linear-gradient(135deg, rgba(24, 32, 50, 0.95), rgba(39, 48, 72, 0.78));
  box-shadow: 0 16px 40px rgba(2, 6, 23, 0.65),
              inset 0 1px 0 rgba(148, 163, 184, 0.16);
}

:deep(.el-card__header) {
  padding: 30px;
  text-align: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: transparent;
}

:deep(.el-card__body) {
  background: transparent;
}

.title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0;
  text-shadow: 0 0 12px rgba(148, 163, 184, 0.35);
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

.date-input-wrapper :deep(.el-button--primary) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(124, 58, 237, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #F8FAFC;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.date-input-wrapper :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(139, 92, 246, 1));
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.45);
  transform: translateY(-1px);
}

.date-input {
  width: 300px;
  cursor: pointer;
}

.date-input :deep(.el-input__inner) {
  cursor: pointer;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #E2E8F0;
  font-weight: 500;
  transition: all 0.2s ease;
}

.date-input :deep(.el-input__inner:hover) {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(148, 163, 184, 0.35);
}

.date-input :deep(.el-input__inner:focus) {
  background: rgba(15, 23, 42, 0.9);
  border-color: #60A5FA;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
}

.festival-info {
  margin-top: 15px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.festival-info :deep(.el-tag) {
  background: rgba(16, 185, 129, 0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #D1FAE5;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(5, 46, 22, 0.45);
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
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.12);
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(148, 163, 184, 0.35);
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(15, 23, 42, 0.9);
  border-color: #60A5FA;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35),
              inset 0 1px 0 rgba(148, 163, 184, 0.15);
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 40px 0;
}

.time-box {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 30px 20px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(2, 6, 23, 0.5),
              inset 0 1px 0 rgba(148, 163, 184, 0.12);
  cursor: pointer;
}

.time-box:hover {
  transform: translateY(-4px);
  background: rgba(23, 31, 55, 0.7);
  box-shadow: 0 10px 26px rgba(2, 6, 23, 0.6),
              inset 0 1px 0 rgba(148, 163, 184, 0.18);
  border-color: rgba(148, 163, 184, 0.35);
}

.number {
  font-family: 'Poppins', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: #F8FAFC;
  line-height: 1;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  display: block;
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.35);
}

.label {
  font-family: 'Open Sans', sans-serif;
  font-size: 1.1rem;
  color: #94A3B8;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(15, 23, 42, 0.6);
}

.target-date-info {
  text-align: center;
  margin-top: 20px;
}

.target-date-info :deep(.el-text) {
  color: #CBD5F5;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(15, 23, 42, 0.6);
}

@media (max-width: 1024px) {
  .countdown-card {
    max-width: 95%;
  }
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
    border-radius: 20px;
  }
  
  :deep(.el-card__header) {
    padding: 20px;
  }
  
  .time-box {
    padding: 20px 15px;
  }
}

@media (max-width: 480px) {
  .countdown-container {
    padding: 10px;
  }
  
  .countdown-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .time-box {
    padding: 20px 15px;
    min-height: 80px;
  }
  
  .number {
    font-size: 2rem;
  }
  
  .label {
    font-size: 0.9rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .date-input-wrapper {
    flex-direction: column;
    width: 100%;
  }
  
  .date-input {
    width: 100%;
  }
  
  .date-input-wrapper :deep(.el-button) {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .countdown-container,
  .time-box,
  .number,
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
