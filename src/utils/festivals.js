// 节日数据（固定日期）
const fixedFestivals = {
  '01-01': '元旦',
  '02-14': '情人节',
  '03-08': '妇女节',
  '03-12': '植树节',
  '04-01': '愚人节',
  '05-01': '劳动节',
  '05-04': '青年节',
  '06-01': '儿童节',
  '07-01': '建党节',
  '08-01': '建军节',
  '09-10': '教师节',
  '10-01': '国庆节',
  '12-25': '圣诞节',
}

// 计算农历节日（简化版，仅包含主要节日）
function getLunarFestival(year, month, day) {
  // 这里使用简化的农历节日计算
  // 实际项目中可以使用专业的农历库如 lunar-javascript
  const lunarFestivals = {
    // 春节（农历正月初一，这里用近似日期）
    // 2024年春节：2月10日
    // 2025年春节：1月29日
    // 简化处理：根据年份计算
  }
  
  return null
}

// 获取指定日期的节日信息
export function getFestival(date) {
  if (!date) return null
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const key = `${month}-${day}`
  const dateKey = `${year}-${month}-${day}`
  
  // 先检查所有节日（包括农历节日）
  const allFestivals = getAllFestivals(year)
  if (allFestivals[dateKey]) {
    return allFestivals[dateKey]
  }
  
  // 检查固定节日
  if (fixedFestivals[key]) {
    return fixedFestivals[key]
  }
  
  return null
}

// 调休上班数据（周末需要上班的日期）
const workDays = {
  // 2024年调休上班
  2024: [
    '2024-02-04', // 春节调休
    '2024-02-18',
    '2024-04-07',
    '2024-04-28',
    '2024-05-11',
    '2024-09-14',
    '2024-09-29',
    '2024-10-12',
  ],
  // 2025年调休上班
  2025: [
    '2025-01-26', // 春节调休
    '2025-02-08',
    '2025-04-27',
    '2025-05-06',
    '2025-09-28',
    '2025-10-11',
  ],
  // 2026年调休上班
  2026: [
    '2026-02-07', // 春节调休
    '2026-02-20',
    '2026-04-26',
    '2026-05-09',
    '2026-09-27',
    '2026-10-10',
  ],
}

// 节假日数据（需要放假的日期，包括周末）
const holidays = {
  // 2024年节假日
  2024: [
    '2024-01-01', // 元旦
    '2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13', '2024-02-14', '2024-02-15', '2024-02-16', '2024-02-17', // 春节
    '2024-04-04', '2024-04-05', '2024-04-06', // 清明节
    '2024-05-01', '2024-05-02', '2024-05-03', '2024-05-04', '2024-05-05', // 劳动节
    '2024-06-10', // 端午节
    '2024-09-15', '2024-09-16', '2024-09-17', // 中秋节
    '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-05', '2024-10-06', '2024-10-07', // 国庆节
  ],
  // 2025年节假日
  2025: [
    '2025-01-01', // 元旦
    '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04', // 春节
    '2025-04-04', '2025-04-05', '2025-04-06', // 清明节
    '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05', // 劳动节
    '2025-05-31', // 端午节
    '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', // 国庆节+中秋节
  ],
  // 2026年节假日
  2026: [
    '2026-01-01', // 元旦
    '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23', // 春节
    '2026-04-05', '2026-04-06', '2026-04-07', // 清明节
    '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05', // 劳动节
    '2026-06-19', // 端午节
    '2026-09-25', '2026-09-26', '2026-09-27', // 中秋节
    '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', // 国庆节
  ],
}

// 获取日期类型：holiday(节假日), work(调休上班), weekend(周末), normal(工作日)
export function getDateType(date) {
  if (!date) return 'normal'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  // 检查是否是节假日
  if (holidays[year] && holidays[year].includes(dateStr)) {
    return 'holiday'
  }
  
  // 检查是否是调休上班
  if (workDays[year] && workDays[year].includes(dateStr)) {
    return 'work'
  }
  
  // 检查是否是周末
  const dayOfWeek = dateObj.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'weekend'
  }
  
  return 'normal'
}

// 获取所有节日数据（用于日期选择器标记）
export function getAllFestivals(year) {
  const festivals = {}
  
  // 添加固定节日
  Object.keys(fixedFestivals).forEach(key => {
    const [month, day] = key.split('-')
    const dateKey = `${year}-${month}-${day}`
    festivals[dateKey] = fixedFestivals[key]
  })
  
  // 添加农历节日（需要根据年份计算）
  // 2024年
  if (year === 2024) {
    festivals['2024-02-10'] = '春节'
    festivals['2024-02-24'] = '元宵节'
    festivals['2024-04-04'] = '清明节'
    festivals['2024-06-10'] = '端午节'
    festivals['2024-08-15'] = '中秋节'
    festivals['2024-10-11'] = '重阳节'
  }
  
  // 2025年
  if (year === 2025) {
    festivals['2025-01-29'] = '春节'
    festivals['2025-02-12'] = '元宵节'
    festivals['2025-04-04'] = '清明节'
    festivals['2025-05-31'] = '端午节'
    festivals['2025-10-06'] = '中秋节'
    festivals['2025-10-30'] = '重阳节'
  }
  
  // 2026年
  if (year === 2026) {
    festivals['2026-02-17'] = '春节'
    festivals['2026-03-03'] = '元宵节'
    festivals['2026-04-05'] = '清明节'
    festivals['2026-06-19'] = '端午节'
    festivals['2026-09-25'] = '中秋节'
    festivals['2026-10-20'] = '重阳节'
  }
  
  return festivals
}

// 获取调休上班日期列表
export function getWorkDays(year) {
  return workDays[year] || []
}

// 获取节假日列表
export function getHolidays(year) {
  return holidays[year] || []
}
