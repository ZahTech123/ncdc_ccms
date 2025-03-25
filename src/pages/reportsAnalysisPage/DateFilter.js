import React, { useState, useEffect, useRef } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import AiAnalyticsButton from './ai-analytics/AiAnalyticsButton';
import AiAnalyticsPanel from './ai-analytics/AiAnalyticsPanel';

const DateFilter = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  onClearFilters, 
  resultsCount,
  ticketData,
  isLoadingData = false
}) => {
  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    startDate ? new Date(startDate).getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    startDate ? new Date(startDate).getFullYear() : new Date().getFullYear()
  );
  const [selectionType, setSelectionType] = useState('range');
  const datePickerRef = useRef(null);

  // AI Analytics state
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Month names and day abbreviations
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Helper to check if a date is selected
  const isDateSelected = (date) => {
    if (!startDate || !endDate) return false;
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    const end = new Date(new Date(endDate).setHours(0, 0, 0, 0));
    return dateOnly >= start && dateOnly <= end;
  };

  // Check if date is at boundary of selection
  const isStartDate = (date) => {
    if (!startDate) return false;
    const start = new Date(startDate);
    return date.getFullYear() === start.getFullYear() && 
           date.getMonth() === start.getMonth() && 
           date.getDate() === start.getDate();
  };

  const isEndDate = (date) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    return date.getFullYear() === end.getFullYear() && 
           date.getMonth() === end.getMonth() && 
           date.getDate() === end.getDate();
  };

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Format date for input value (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date click
  const handleDateClick = (date) => {
    const formattedDate = formatDateForInput(date);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startDateOnly = startDate && new Date(new Date(startDate).setHours(0, 0, 0, 0));
    const endDateOnly = endDate && new Date(new Date(endDate).setHours(0, 0, 0, 0));
    
    if (selectionType === 'start' || 
        (selectionType === 'range' && (!endDateOnly || dateOnly > endDateOnly)) ||
        (!startDate && !endDate)) {
      onStartDateChange({ target: { value: formattedDate } });
      onEndDateChange({ target: { value: "" } });
      setSelectionType('end');
    } else if (selectionType === 'end' || 
               (selectionType === 'range' && (!startDateOnly || dateOnly < startDateOnly))) {
      onEndDateChange({ target: { value: formattedDate } });
      setSelectionType('range');
    } else {
      if (startDateOnly && dateOnly.getTime() === startDateOnly.getTime()) {
        onEndDateChange({ target: { value: formattedDate } });
        setSelectionType('range');
      } else {
        if (startDateOnly && endDateOnly) {
          if (Math.abs(dateOnly.getTime() - startDateOnly.getTime()) <= 
              Math.abs(dateOnly.getTime() - endDateOnly.getTime())) {
            onStartDateChange({ target: { value: formattedDate } });
          } else {
            onEndDateChange({ target: { value: formattedDate } });
          }
        }
      }
    }
  };

  // Pre-defined date ranges
  const applyPresetRange = (range) => {
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

  // Generate calendar for a specific month
  const generateCalendar = (month, year) => {
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

  // Generate calendars for current and next month
  const currentMonthCalendar = generateCalendar(currentMonth, currentYear);
  const nextMonthCalendar = generateCalendar(
    currentMonth + 1 === 12 ? 0 : currentMonth + 1, 
    currentMonth + 1 === 12 ? currentYear + 1 : currentYear
  );

  // Group days into weeks
  const groupIntoWeeks = (calendar) => {
    const weeks = [];
    for (let i = 0; i < calendar.length; i += 7) {
      weeks.push(calendar.slice(i, i + 7));
    }
    return weeks;
  };

  const currentMonthWeeks = groupIntoWeeks(currentMonthCalendar);
  const nextMonthWeeks = groupIntoWeeks(nextMonthCalendar);

  return (
    <div className="mb-4 p-4 bg-gray-700 mt-4 rounded-md relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Filter by Date Range</h3>
        <AiAnalyticsButton 
          onClick={() => setIsAnalyticsOpen(true)} 
          disabled={isLoadingData}
        />
      </div>

      {/* Date range display and controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={startDate ? formatDate(new Date(startDate)) : "Start Date"}
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="p-2 px-4 bg-white border rounded-md text-black w-40 cursor-pointer"
            aria-label="Start date"
          />
          <span className="flex items-center text-white">to</span>
          <input
            type="text"
            readOnly
            value={endDate ? formatDate(new Date(endDate)) : "End Date"}
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="p-2 px-4 bg-white border rounded-md text-black w-40 cursor-pointer"
            aria-label="End date"
          />
        </div>
        
        <button
          onClick={onClearFilters}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm"
        >
          Clear Filters
        </button>
        
        {resultsCount !== undefined && (
          <div className="ml-4 text-sm">
            <span className="font-medium">Results: </span>
            <span>{resultsCount} tickets</span>
          </div>
        )}
      </div>

      {/* Date picker dropdown */}
      {isDatePickerOpen && (
        <div className="absolute z-20 mt-2 bg-white rounded-lg shadow-lg border" ref={datePickerRef}>
          <div className="flex">
            {/* Quick selection options */}
            <div className="w-48 border-r">
              <div className="p-2 mb-2 text-center text-black bg-yellow-500 hover:bg-yellow-400 rounded-md mx-2 mt-2 font-medium">Custom</div>
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-black" onClick={() => applyPresetRange('today')}>Today</div>
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-black" onClick={() => applyPresetRange('yesterday')}>Yesterday</div>
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-black" onClick={() => applyPresetRange('thisWeek')}>This Week</div>
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-black" onClick={() => applyPresetRange('lastWeek')}>Last week</div>
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-black" onClick={() => applyPresetRange('thisMonth')}>This month</div>
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-black" onClick={() => applyPresetRange('lastMonth')}>Last month</div>
              <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-black" onClick={() => applyPresetRange('thisYear')}>This year</div>
            </div>

            {/* Calendar view */}
            <div className="flex-1 p-4">
              <div className="flex">
                {/* Current month */}
                <div className="flex-1 mx-2">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-1">
                      <IoChevronBack size={20} className="text-black" />
                    </button>
                    <div className="font-medium text-black">{months[currentMonth]} {currentYear}</div>
                    <div className="w-6"></div>
                  </div>
                  
                  <div className="grid grid-cols-7 text-center">
                    {days.map(day => (
                      <div key={day} className="text-sm font-medium text-black">{day}</div>
                    ))}
                  </div>
                  
                  <div className="mt-1">
                    {currentMonthWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 text-center">
                        {week.map((day, dayIndex) => (
                          <div 
                            key={dayIndex}
                            onClick={() => handleDateClick(day.date)}
                            className={`p-1 text-sm cursor-pointer ${
                              !day.isCurrentMonth ? 'text-black opacity-50' : 
                              isDateSelected(day.date) ? 
                                (isStartDate(day.date) || isEndDate(day.date)) ? 
                                  'bg-yellow-500 text-black font-medium rounded-full' : 
                                  'bg-yellow-100 text-black' : 
                                selectionType === 'end' && startDate && 
                                day.date.getTime() === new Date(startDate).setHours(0, 0, 0, 0) ?
                                  'bg-yellow-300 text-black rounded-full' :
                                'text-black'
                            }`}
                          >
                            {day.day}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Next month */}
                <div className="flex-1 mx-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-6"></div>
                    <div className="font-medium text-black">
                      {months[currentMonth + 1 === 12 ? 0 : currentMonth + 1]} {currentMonth + 1 === 12 ? currentYear + 1 : currentYear}
                    </div>
                    <button onClick={nextMonth} className="p-1">
                      <IoChevronForward size={20} className="text-black" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 text-center">
                    {days.map(day => (
                      <div key={day} className="text-sm font-medium text-black">{day}</div>
                    ))}
                  </div>
                  
                  <div className="mt-1">
                    {nextMonthWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 text-center">
                        {week.map((day, dayIndex) => (
                          <div 
                            key={dayIndex}
                            onClick={() => handleDateClick(day.date)}
                            className={`p-1 text-sm cursor-pointer ${
                              !day.isCurrentMonth ? 'text-black opacity-50' : 
                              isDateSelected(day.date) ? 
                                (isStartDate(day.date) || isEndDate(day.date)) ? 
                                  'bg-yellow-500 text-black font-medium rounded-full' : 
                                  'bg-yellow-100 text-black' : 
                                selectionType === 'end' && startDate && 
                                day.date.getTime() === new Date(startDate).setHours(0, 0, 0, 0) ?
                                  'bg-yellow-300 text-black rounded-full' :
                                'text-black'
                            }`}
                          >
                            {day.day}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analytics Panel */}
      <AiAnalyticsPanel
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        ticketData={ticketData}
        startDate={startDate}
        endDate={endDate}
        isLoadingData={isLoadingData}
      />

      {/* Hidden inputs for form submission */}
      <input
        type="hidden"
        name="startDate"
        value={startDate || ''}
      />
      <input
        type="hidden"
        name="endDate"
        value={endDate || ''}
      />
    </div>
  );
};

export default DateFilter;