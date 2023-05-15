import { useMemo } from 'react';
import { DateTime } from 'luxon';

export const useFormattedDate = () => {
  return useMemo(() => {
    const now = DateTime.local();
    return now.toFormat('yyyy-MM-dd');
  }, []);
};
