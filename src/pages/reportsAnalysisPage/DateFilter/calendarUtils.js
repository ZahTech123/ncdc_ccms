import { formatDateForInput } from './dateUtils';

// Generate calendar for a specific month
export const generateCalendar = (month, year) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
  
  const prevMonthDays = [];
  for (let i = firstDayAdjusted - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
    prevMonthDays.push({
      date: prevDate,
      day: daysInPrevMonth - i,
      isCurrentMonth: false
    });
  }
  
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(year, month, i);
    currentMonthDays.push({
      date: currentDate,
      day: i,
      isCurrentMonth: true
    });
  }
  
  const totalDaysDisplayed = Math.ceil((firstDayAdjusted + daysInMonth) / 7) * 7;
  const nextMonthDays = [];
  for (let i = 1; i <= totalDaysDisplayed - (prevMonthDays.length + currentMonthDays.length); i++) {
    const nextDate = new Date(year, month + 1, i);
    nextMonthDays.push({
      date: nextDate,
      day: i,
      isCurrentMonth: false
    });
  }
  
  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
};

// Group days into weeks
export const groupIntoWeeks = (calendar) => {
  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }
  return weeks;
};

// Pre-defined date ranges
export const applyPresetRange = (range, onStartDateChange, onEndDateChange, setCurrentMonth, setCurrentYear) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let newStartDate, newEndDate;
  
  switch(range) {
    case 'today':
      newStartDate = new Date(today);
      newEndDate = new Date(today);
      break;
    case 'yesterday':
      newStartDate = new Date(today);
      newStartDate.setDate(today.getDate() - 1);
      newEndDate = new Date(newStartDate);
      break;
    case 'thisWeek':
      newStartDate = new Date(today);
      newStartDate.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      newEndDate = new Date(today);
      break;
    case 'lastWeek':
      newStartDate = new Date(today);
      newStartDate.setDate(today.getDate() - today.getDay() - 6);
      newEndDate = new Date(today);
      newEndDate.setDate(today.getDate() - today.getDay());
      break;
    case 'thisMonth':
      newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
      newEndDate = new Date(today);
      break;
    case 'lastMonth':
      newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      newEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'thisYear':
      newStartDate = new Date(today.getFullYear(), 0, 1);
      newEndDate = new Date(today);
      break;
    default:
      return;
  }
  
  onStartDateChange({ target: { value: formatDateForInput(newStartDate) } });
  onEndDateChange({ target: { value: formatDateForInput(newEndDate) } });
  
  setCurrentMonth(newStartDate.getMonth());
  setCurrentYear(newStartDate.getFullYear());
};

// Date selection helpers
export const isDateSelected = (date, startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = new Date(new Date(startDate).setHours(0, 0, 0, 0));
  const end = new Date(new Date(endDate).setHours(0, 0, 0, 0));
  return dateOnly >= start && dateOnly <= end;
};

export const isStartDate = (date, startDate) => {
  if (!startDate) return false;
  const start = new Date(startDate);
  return date.getFullYear() === start.getFullYear() && 
         date.getMonth() === start.getMonth() && 
         date.getDate() === start.getDate();
};

export const isEndDate = (date, endDate) => {
  if (!endDate) return false;
  const end = new Date(endDate);
  return date.getFullYear() === end.getFullYear() && 
         date.getMonth() === end.getMonth() && 
         date.getDate() === end.getDate();
};