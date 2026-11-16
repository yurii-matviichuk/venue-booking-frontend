import { formatTimeRange } from '../lib/dates';
import type { TimeSlot } from '../types';

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  timeZone: string;
  onSelect: (slot: TimeSlot) => void;
}

export default function TimeSlotSelector({
  slots,
  timeZone,
  onSelect,
}: TimeSlotSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
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
          <div className="text-sm">
            {formatTimeRange(slot.time, slot.endTime, timeZone)}
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
