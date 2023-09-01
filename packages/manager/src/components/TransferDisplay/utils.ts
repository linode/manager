import { DateTime } from 'luxon';

export const getDaysRemaining = () =>
  Math.floor(
    DateTime.local()
      .setZone('America/New_York')
      .endOf('month')
      .diffNow('days')
      .toObject().days ?? 0
  );
