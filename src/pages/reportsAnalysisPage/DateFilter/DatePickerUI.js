import React from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { months, days } from './dateUtils';
import { 
  isDateSelected, 
  isStartDate, 
  isEndDate 
} from './calendarUtils';

export const DatePickerUI = ({ 
  currentMonth, 
  currentYear, 
  prevMonth, 
  nextMonth, 
  currentMonthWeeks, 
  nextMonthWeeks, 
  handleDateClick, 
  startDate, 
  endDate, 
  selectionType,
  applyPresetRange
}) => {
  return (
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
                        isDateSelected(day.date, startDate, endDate) ? 
                          (isStartDate(day.date, startDate) || isEndDate(day.date, endDate)) ? 
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
                        isDateSelected(day.date, startDate, endDate) ? 
                          (isStartDate(day.date, startDate) || isEndDate(day.date, endDate)) ? 
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
  );
};