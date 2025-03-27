import React, { useState, useEffect, useRef } from 'react';
import AiAnalyticsButton from '../ai-analytics/AiAnalyticsButton';
import AiAnalyticsPanel from '../ai-analytics/AiAnalyticsPanel';
import { formatDate, formatDateForInput } from './dateUtils';
import { 
  generateCalendar, 
  groupIntoWeeks, 
  applyPresetRange
} from './calendarUtils';
import { DatePickerUI } from './DatePickerUI';

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

  // Generate calendars for current and next month
  const currentMonthCalendar = generateCalendar(currentMonth, currentYear);
  const nextMonthCalendar = generateCalendar(
    currentMonth + 1 === 12 ? 0 : currentMonth + 1, 
    currentMonth + 1 === 12 ? currentYear + 1 : currentYear
  );

  // Group days into weeks
  const currentMonthWeeks = groupIntoWeeks(currentMonthCalendar);
  const nextMonthWeeks = groupIntoWeeks(nextMonthCalendar);

  // Handle preset range application
  const handlePresetRange = (range) => {
    applyPresetRange(
      range, 
      onStartDateChange, 
      onEndDateChange, 
      setCurrentMonth, 
      setCurrentYear
    );
  };

  return (
    <div className="mb-4 p-4 bg-gray-700 mt-4 rounded-md relative">
      {/* Date range display and controls */}
      <div className="flex flex-wrap justify-between items-center w-full gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              readOnly
              value={startDate ? formatDate(new Date(startDate)) : "Start Date"}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="p-2 px-4 bg-white border rounded-md text-black w-40 cursor-pointer text-sm h-[36px]"
              aria-label="Start date"
            />
            <span className="flex items-center text-white text-sm">to</span>
            <input
              type="text"
              readOnly
              value={endDate ? formatDate(new Date(endDate)) : "End Date"}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="p-2 px-4 bg-white border rounded-md text-black w-40 cursor-pointer text-sm h-[36px]"
              aria-label="End date"
            />
          </div>
          
          <button
            onClick={onClearFilters}
            className="px-3 h-[36px] bg-gray-600 hover:bg-gray-500 rounded-md text-sm  bounce-effect "
          >
            Clear Filters
          </button>
          
          {resultsCount !== undefined && (
            <div className="text-sm">
              {/* <span className="font-medium">Results: </span> */}
              {/* <span>{resultsCount} tickets</span> */}
            </div>
          )}
        </div>
  
        <AiAnalyticsButton 
          onClick={() => setIsAnalyticsOpen(true)} 
          disabled={isLoadingData}
          className="h-[36px] bounce-effect"
        />
      </div>

      {/* Date picker dropdown */}
      {isDatePickerOpen && (
        <div className="absolute z-20 mt-2 bg-white rounded-lg shadow-lg border" ref={datePickerRef}>
          <DatePickerUI 
            currentMonth={currentMonth}
            currentYear={currentYear}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            currentMonthWeeks={currentMonthWeeks}
            nextMonthWeeks={nextMonthWeeks}
            handleDateClick={handleDateClick}
            startDate={startDate}
            endDate={endDate}
            selectionType={selectionType}
            applyPresetRange={handlePresetRange}
          />
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