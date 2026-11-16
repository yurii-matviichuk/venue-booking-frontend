import { useEffect, useRef, useState } from 'react';
import { keyToLocalDate, localDateKey } from '../lib/dates';

interface SlotCalendarProps {
  availableDates: string[];
  selectedDate: string;
  onSelect: (dateKey: string) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

const addDays = (key: string, days: number) => {
  const date = keyToLocalDate(key);
  return localDateKey(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days),
  );
};

// Same day of the neighbouring month, clamped (Jan 31 + 1 month -> Feb 28)
const addMonths = (key: string, months: number) => {
  const date = keyToLocalDate(key);
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + months + 1,
    0,
  ).getDate();
  return localDateKey(
    new Date(
      date.getFullYear(),
      date.getMonth() + months,
      Math.min(date.getDate(), lastDay),
    ),
  );
};

export default function SlotCalendar({
  availableDates,
  selectedDate,
  onSelect,
}: SlotCalendarProps) {
  const available = new Set(availableDates);
  const selected = keyToLocalDate(selectedDate);
  // availableDates arrives sorted, so the ends bound the months worth browsing
  const firstMonth = monthIndex(keyToLocalDate(availableDates[0]));
  const lastMonth = monthIndex(
    keyToLocalDate(availableDates[availableDates.length - 1]),
  );

  const [viewed, setViewed] = useState(monthIndex(selected));
  const [focusedDate, setFocusedDate] = useState(selectedDate);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef(false);

  useEffect(() => {
    if (pendingFocus.current) {
      pendingFocus.current = false;
      buttons.current.get(focusedDate)?.focus();
    }
  }, [focusedDate, viewed]);

  const year = Math.floor(viewed / 12);
  const month = viewed % 12;
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  // Roving tabindex: the calendar is one Tab stop, so pick a day that is on screen
  const tabStop = [focusedDate, selectedDate, ...availableDates].find(
    (key) => key.startsWith(monthPrefix) && available.has(key),
  );

  // Disabled days can't take focus, so jump to the closest available one in that direction
  const nearest = (target: string, direction: 1 | -1) =>
    direction === 1
      ? availableDates.find((key) => key >= target)
      : availableDates.findLast((key) => key <= target);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const origin = (event.target as HTMLElement).dataset.date;
    if (!origin) return;

    const weekStart = addDays(origin, -keyToLocalDate(origin).getDay());
    const weekEnd = addDays(weekStart, 6);

    let target: string | undefined;
    switch (event.key) {
      case 'ArrowLeft':
        target = nearest(addDays(origin, -1), -1);
        break;
      case 'ArrowRight':
        target = nearest(addDays(origin, 1), 1);
        break;
      case 'ArrowUp':
        target = nearest(addDays(origin, -7), -1);
        break;
      case 'ArrowDown':
        target = nearest(addDays(origin, 7), 1);
        break;
      case 'PageUp':
        target = nearest(addMonths(origin, -1), -1);
        break;
      case 'PageDown':
        target = nearest(addMonths(origin, 1), 1);
        break;
      case 'Home':
        target = nearest(weekStart, 1);
        if (target && target > weekEnd) target = undefined;
        break;
      case 'End':
        target = nearest(weekEnd, -1);
        if (target && target < weekStart) target = undefined;
        break;
      default:
        return;
    }

    event.preventDefault();
    if (!target || target === origin) return;
    pendingFocus.current = true;
    setFocusedDate(target);
    setViewed(monthIndex(keyToLocalDate(target)));
  };

  const navButton =
    'w-9 h-9 rounded-full text-lg hover:bg-indigo-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent';

  return (
    <div className="bg-white rounded-lg shadow p-4 inline-block">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          aria-label="Previous month"
          disabled={viewed <= firstMonth}
          onClick={() => setViewed(viewed - 1)}
          className={navButton}
        >
          ‹
        </button>
        <div className="font-bold" aria-live="polite">
          {new Date(year, month, 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <button
          type="button"
          aria-label="Next month"
          disabled={viewed >= lastMonth}
          onClick={() => setViewed(viewed + 1)}
          className={navButton}
        >
          ›
        </button>
      </div>

      <div
        role="group"
        aria-label="Choose a date"
        onKeyDown={handleKeyDown}
        className="grid grid-cols-7 gap-1 text-center"
      >
        {WEEKDAYS.map((day) => (
          <div key={day} className="w-10 text-xs text-gray-500 py-1">
            {day}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, month, i + 1);
          const key = localDateKey(date);
          const isSelected = key === selectedDate;

          return (
            <button
              key={key}
              ref={(element) => {
                if (element) buttons.current.set(key, element);
                else buttons.current.delete(key);
              }}
              type="button"
              data-date={key}
              tabIndex={key === tabStop ? 0 : -1}
              disabled={!available.has(key)}
              aria-pressed={isSelected}
              aria-label={date.toLocaleDateString('en-US', {
                dateStyle: 'full',
              })}
              onClick={() => {
                setFocusedDate(key);
                onSelect(key);
              }}
              className={`w-10 h-10 rounded-full text-sm ${
                isSelected
                  ? 'bg-indigo-600 text-white font-bold'
                  : available.has(key)
                    ? 'font-bold text-indigo-700 hover:bg-indigo-50 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
