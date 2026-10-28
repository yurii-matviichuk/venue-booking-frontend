import type { TimeSlot } from '../types';

const timeFormat: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  onSelect: (slot: TimeSlot) => void;
}

export default function TimeSlotSelector({
  slots,
  onSelect,
}: TimeSlotSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {slots.map((slot) => (
        <button
          key={slot.id}
          onClick={() => onSelect(slot)}
          disabled={!slot.available}
          className={`p-4 border-2 rounded-lg font-bold ${
            slot.available
              ? 'bg-white border-indigo-500 hover:bg-indigo-50 cursor-pointer'
              : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="text-xs font-normal">
            {new Date(slot.time).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="text-sm">
            {new Date(slot.time).toLocaleTimeString('en-US', timeFormat)} –{' '}
            {new Date(slot.endTime).toLocaleTimeString('en-US', timeFormat)}
          </div>
          <div className="text-lg">
            ${slot.price}
            <span className="text-xs font-normal"> / spot</span>
          </div>
          <div className="text-xs">
            {slot.available ? `${slot.spotsRemaining} spots` : 'Full'}
          </div>
        </button>
      ))}
    </div>
  );
}
