<template>
  <el-dialog
    v-model="visible"
    title="选择日期"
    width="480px"
    :close-on-click-modal="true"
    class="custom-calendar-dialog"
    :show-close="true"
    append-to-body
    :modal="true"
  >
    <div class="custom-calendar">
      <!-- 日历头部 -->
      <div class="calendar-header">
        <el-button 
          circle 
          @click="prevMonth"
          :icon="ArrowLeft"
        />
        <div class="month-year">
          <span class="year">{{ currentYear }}年</span>
          <span class="month">{{ currentMonth }}月</span>
        </div>
        <el-button 
          circle 
          @click="nextMonth"
          :icon="ArrowRight"
        />
      </div>

      <!-- 星期标题 -->
      <div class="weekdays">
        <div 
          v-for="day in weekdays" 
          :key="day"
          class="weekday"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日期网格 -->
      <div class="days-grid">
        <div
          v-for="(day, index) in days"
          :key="index"
          class="day-cell"
          :class="getDayClass(day)"
          @click="selectDate(day)"
        >
          <div class="day-number">{{ day ? day.getDate() : '' }}</div>
          <div class="day-label" v-if="day">
            <span v-if="getDateInfo(day).isHoliday" class="holiday-label">休</span>
            <span v-else-if="getDateInfo(day).isWork" class="work-label">班</span>
            <span v-else-if="getDateInfo(day).isWeekend" class="weekend-label">末</span>
          </div>
          <div class="day-festival" v-if="day && getDateInfo(day).festival">
            {{ getDateInfo(day).festival }}
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="legend">
        <div class="legend-item">
          <span class="legend-color holiday"></span>
          <span>节假日</span>
        </div>
        <div class="legend-item">
          <span class="legend-color work"></span>
          <span>调休上班</span>
        </div>
        <div class="legend-item">
          <span class="legend-color weekend"></span>
          <span>周末</span>
        </div>
        <div class="legend-item">
          <span class="legend-color normal"></span>
          <span>工作日</span>
        </div>
      </div>
    </div>

  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElDialog, ElButton } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { getDateType, getFestival, getAllFestivals } from '../utils/festivals.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const currentDate = ref(new Date())
const tempSelectedDate = ref(null)

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 生成当前月份的日期数组
const days = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const firstDayWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const daysArray = []
  
  // 添加上个月的日期（填充第一周）
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    daysArray.push(new Date(year, month - 2, prevMonthLastDay - i))
  }
  
  // 添加当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(year, month - 1, i))
  }
  
  // 添加下个月的日期（填充最后一周，总共42个格子）
  const remaining = 42 - daysArray.length
  for (let i = 1; i <= remaining; i++) {
    daysArray.push(new Date(year, month, i))
  }
  
  return daysArray
})

// 获取日期信息
const getDateInfo = (date) => {
  if (!date) return {}
  
  const dateType = getDateType(date)
  const festival = getFestival(date)
  
  return {
    type: dateType,
    isHoliday: dateType === 'holiday',
    isWork: dateType === 'work',
    isWeekend: dateType === 'weekend',
    isNormal: dateType === 'normal',
    festival: festival
  }
}

// 获取日期单元格的类名
const getDayClass = (day) => {
  if (!day) return 'empty'
  
  const info = getDateInfo(day)
  const classes = []
  
  if (info.isHoliday) classes.push('holiday')
  if (info.isWork) classes.push('work')
  if (info.isWeekend && !info.isHoliday && !info.isWork) classes.push('weekend')
  if (info.isNormal) classes.push('normal')
  
  // 检查是否是当前选中的日期
  if (tempSelectedDate.value) {
    const selected = new Date(tempSelectedDate.value)
    selected.setHours(0, 0, 0, 0)
    const dayTime = new Date(day)
    dayTime.setHours(0, 0, 0, 0)
    if (dayTime.getTime() === selected.getTime()) {
      classes.push('selected')
    }
  }
  
  // 检查是否是今天
  const today = new Date()
  if (day.getFullYear() === today.getFullYear() &&
      day.getMonth() === today.getMonth() &&
      day.getDate() === today.getDate()) {
    classes.push('today')
  }
  
  // 检查是否是其他月份的日期
  if (day.getMonth() !== currentDate.value.getMonth()) {
    classes.push('other-month')
  }
  
  return classes.join(' ')
}

// 选择日期
const selectDate = (day) => {
  if (!day) return
  
  const year = day.getFullYear()
  const month = String(day.getMonth() + 1).padStart(2, '0')
  const date = String(day.getDate()).padStart(2, '0')
  tempSelectedDate.value = `${year}-${month}-${date}`
  
  // 选中日期后直接确认并关闭
  confirmSelect()
}

// 上一个月
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
}

// 下一个月
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

// 确认选择
const confirmSelect = () => {
  if (tempSelectedDate.value) {
    emit('confirm', tempSelectedDate.value)
    visible.value = false
  }
}

// 监听外部传入的选中日期
watch(() => props.selectedDate, (newVal) => {
  if (newVal) {
    tempSelectedDate.value = newVal
    const date = new Date(newVal)
    currentDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
  }
}, { immediate: true })
</script>

<style scoped>
/* 弹窗遮罩层 - 玻璃态效果 */
.custom-calendar-dialog :deep(.el-overlay) {
  background: rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* 弹窗主体 - 玻璃态卡片 */
.custom-calendar-dialog :deep(.el-dialog) {
  background: linear-gradient(140deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.78));
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(2, 6, 23, 0.7),
              0 6px 16px rgba(2, 6, 23, 0.4),
              inset 0 1px 0 rgba(148, 163, 184, 0.12);
  overflow: hidden;
}

.custom-calendar-dialog :deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  margin: 0;
}

.custom-calendar-dialog :deep(.el-dialog__title) {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #F8FAFC;
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.25);
  line-height: 1.5;
}

.custom-calendar-dialog :deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.custom-calendar-dialog :deep(.el-dialog__headerbtn:hover) {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(99, 102, 241, 0.6);
  transform: scale(1.05);
}

.custom-calendar-dialog :deep(.el-dialog__close) {
  color: #E2E8F0;
  font-size: 18px;
  font-weight: 600;
}

.custom-calendar-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
  background: transparent;
}

.custom-calendar {
  width: 100%;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.12);
}

.calendar-header :deep(.el-button) {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #E2E8F0;
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(2, 6, 23, 0.4);
}

.calendar-header :deep(.el-button:hover) {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(96, 165, 250, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(2, 6, 23, 0.5);
}

.calendar-header :deep(.el-button:active) {
  transform: translateY(0);
}

.month-year {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: #E2E8F0;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
}

.year {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
}

.month {
  font-size: 22px;
  font-weight: 700;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.weekday {
  font-family: 'Open Sans', sans-serif;
  text-align: center;
  padding: 10px 4px;
  font-weight: 600;
  color: #94A3B8;
  font-size: 13px;
  text-shadow: 0 0 8px rgba(15, 23, 42, 0.6);
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  padding: 0 4px;
}

.day-cell {
  aspect-ratio: 1;
  min-height: 52px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(2, 6, 23, 0.45),
              inset 0 1px 0 rgba(148, 163, 184, 0.12);
}

.day-cell:hover {
  background: rgba(30, 41, 59, 0.75);
  border-color: rgba(96, 165, 250, 0.7);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 20px rgba(2, 6, 23, 0.6),
              0 0 0 2px rgba(59, 130, 246, 0.25),
              inset 0 1px 0 rgba(148, 163, 184, 0.2);
  z-index: 1;
}

.day-cell.empty {
  border: none;
  cursor: default;
}

.day-cell.other-month {
  opacity: 0.35;
  background: rgba(15, 23, 42, 0.2);
}

.day-cell.today {
  border-color: #60A5FA;
  border-width: 2px;
  background: rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3),
              inset 0 1px 0 rgba(148, 163, 184, 0.2);
}

.day-cell.today .day-number {
  color: #93C5FD;
  font-weight: 700;
}

.day-cell.selected {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.85), rgba(139, 92, 246, 0.85));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: #fff;
  border-color: rgba(139, 92, 246, 0.9);
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.55),
              0 0 0 2px rgba(139, 92, 246, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.day-cell.selected .day-number {
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.day-cell.selected .day-number {
  color: #fff;
  font-weight: 700;
}

.day-cell.selected .day-label span {
  background: rgba(255, 255, 255, 0.35);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.day-cell.selected .day-festival {
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 节假日样式 */
.day-cell.holiday {
  background: rgba(127, 29, 29, 0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-color: rgba(248, 113, 113, 0.45);
  box-shadow: inset 0 1px 0 rgba(248, 113, 113, 0.2);
}

.day-cell.holiday .day-number {
  color: #FCA5A5;
  font-weight: 700;
}

/* 调休上班样式 */
.day-cell.work {
  background: rgba(30, 58, 138, 0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-color: rgba(96, 165, 250, 0.45);
  box-shadow: inset 0 1px 0 rgba(96, 165, 250, 0.2);
}

.day-cell.work .day-number {
  color: #BFDBFE;
  font-weight: 700;
}

/* 周末样式 */
.day-cell.weekend {
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.day-cell.weekend .day-number {
  color: #94A3B8;
}

/* 工作日样式 */
.day-cell.normal {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.day-number {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #E2E8F0;
  margin-bottom: 1px;
  text-shadow: 0 0 8px rgba(15, 23, 42, 0.6);
}

.day-label {
  font-size: 9px;
  margin-bottom: 1px;
}

.day-label span {
  display: inline-block;
  padding: 1px 3px;
  border-radius: 2px;
  font-size: 9px;
  font-weight: 600;
}

.holiday-label {
  background: rgba(220, 38, 38, 0.9);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.work-label {
  background: rgba(37, 99, 235, 0.9);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.weekend-label {
  background: rgba(100, 116, 139, 0.9);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.day-festival {
  font-family: 'Open Sans', sans-serif;
  font-size: 9px;
  color: #FCA5A5;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-top: 2px;
  line-height: 1.2;
  text-shadow: 0 0 8px rgba(15, 23, 42, 0.6);
}

.legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.12);
}

.legend-item {
  font-family: 'Open Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94A3B8;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(15, 23, 42, 0.6);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.legend-color.holiday {
  background: rgba(127, 29, 29, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-color: rgba(248, 113, 113, 0.5);
  box-shadow: inset 0 1px 0 rgba(248, 113, 113, 0.15);
}

.legend-color.work {
  background: rgba(30, 58, 138, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: inset 0 1px 0 rgba(96, 165, 250, 0.15);
}

.legend-color.weekend {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-color: rgba(148, 163, 184, 0.25);
  box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.12);
}

.legend-color.normal {
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-color: rgba(148, 163, 184, 0.22);
  box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.12);
}
</style>
