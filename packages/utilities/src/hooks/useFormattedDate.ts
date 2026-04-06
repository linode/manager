import { DateTime } from 'luxon';
import { useMemo } from 'react';

export const useFormattedDate = () => {
  return useMemo(() => {
    const now = DateTime.local();
    return now.toFormat('yyyy-MM-dd');
  }, []);
};
