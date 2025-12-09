import { evenizeNumber } from '@linode/utilities';
import { DateTime } from 'luxon';

export const initWindows = (timezone: string, unshift?: boolean) => {
  let windows = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((hour) => {
    const start = DateTime.fromObject({ hour }, { zone: 'utc' }).setZone(
      timezone,
    );
    const finish = start.plus({ hours: 2 });
    return [
      `${start.toFormat('HH:mm')} - ${finish.toFormat('HH:mm')}`,
      `W${evenizeNumber(start.setZone('utc').hour)}`,
    ];
  });

  windows = windows.sort((a, b) => a[0].localeCompare(b[0]));

  if (unshift) {
    windows.unshift(['Choose a time', 'Scheduling']);
  }

  return windows;
};
