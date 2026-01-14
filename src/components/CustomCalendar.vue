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
.custom-calendar-dialog :deep(.el-dialog__body) {
  padding: 15px 20px;
}

.custom-calendar-dialog :deep(.el-dialog__header) {
  padding: 15px 20px 10px;
}

.custom-calendar {
  width: 100%;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 5px;
}

.month-year {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.year {
  font-size: 18px;
}

.month {
  font-size: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  padding: 6px 4px;
  font-weight: 600;
  color: #666;
  font-size: 13px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  min-height: 50px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 3px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #fff;
}

.day-cell:hover {
  background: #f5f7fa;
  border-color: #409eff;
  transform: scale(1.05);
  z-index: 1;
}

.day-cell.empty {
  border: none;
  cursor: default;
}

.day-cell.other-month {
  opacity: 0.3;
}

.day-cell.today {
  border-color: #409eff;
  border-width: 2px;
}

.day-cell.selected {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.day-cell.selected .day-number {
  color: #fff;
  font-weight: 700;
}

.day-cell.selected .day-label span {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.day-cell.selected .day-festival {
  color: #fff;
}

/* 节假日样式 */
.day-cell.holiday {
  background: #fef0f0;
  border-color: #f56c6c;
}

.day-cell.holiday .day-number {
  color: #f56c6c;
  font-weight: 600;
}

/* 调休上班样式 */
.day-cell.work {
  background: #ecf5ff;
  border-color: #409eff;
}

.day-cell.work .day-number {
  color: #409eff;
  font-weight: 600;
}

/* 周末样式 */
.day-cell.weekend {
  background: #fafafa;
}

.day-cell.weekend .day-number {
  color: #909399;
}

/* 工作日样式 */
.day-cell.normal {
  background: #fff;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 1px;
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
  background: #f56c6c;
  color: #fff;
}

.work-label {
  background: #409eff;
  color: #fff;
}

.weekend-label {
  background: #909399;
  color: #fff;
}

.day-festival {
  font-size: 9px;
  color: #f56c6c;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-top: 1px;
  line-height: 1.2;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid #e4e7ed;
}

.legend-color.holiday {
  background: #fef0f0;
  border-color: #f56c6c;
}

.legend-color.work {
  background: #ecf5ff;
  border-color: #409eff;
}

.legend-color.weekend {
  background: #fafafa;
  border-color: #909399;
}

.legend-color.normal {
  background: #fff;
  border-color: #e4e7ed;
}
</style>
