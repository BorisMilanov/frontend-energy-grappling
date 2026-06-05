export interface ScheduleItem {
  key: string;
  time: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
}

export const scheduleData: ScheduleItem[] = [
  { key: '1', time: '17:00 - 18:30', mon: 'MMA', tue: 'No-Gi', wed: 'GI', thu: 'No-Gi', fri: 'NO-Gi' },
];

const CLASS_STATUS: Record<string, 'success' | 'warning'> = {
  'MMA': 'success',
  'No-Gi': 'warning',
  'Open Mat': 'success',
};

const DAY_KEYS: (keyof Omit<ScheduleItem, 'key' | 'time'>)[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

// Returns a map of ISO weekday number (1=Mon … 5=Fri) → { time, label, status }
export function buildWeeklySchedule(data: ScheduleItem[]) {
  const result: Record<number, { time: string; label: string; status: 'success' | 'warning' }> = {};
  for (const row of data) {
    DAY_KEYS.forEach((key, i) => {
      const label = row[key];
      if (label) {
        result[i + 1] = { time: row.time, label, status: CLASS_STATUS[label] ?? 'success' };
      }
    });
  }
  return result;
}
