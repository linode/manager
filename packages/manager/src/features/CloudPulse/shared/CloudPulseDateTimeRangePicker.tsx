import { DateTime } from 'luxon';
import React from 'react';

import { DateTimeRangePicker } from 'src/components/DatePicker/DateTimeRangePicker';

import type { FilterValue, TimeDurationDate } from '@linode/api-v4';

interface CloudPulseDateTimeRangePickerProps {
  defaultValue?: Partial<FilterValue>;

  handleStatsChange: (
    timeDuration: TimeDurationDate,
    savePref?: boolean
  ) => void;
  savePreferences?: boolean;
}
export const CloudPulseDateTimeRangePicker = (
  props: CloudPulseDateTimeRangePickerProps
) => {
  const { defaultValue, handleStatsChange, savePreferences } = props;
  const defaultSelected: TimeDurationDate = defaultValue as TimeDurationDate;

  React.useEffect(() => {
    if (defaultSelected) {
      handleStatsChange(defaultSelected);
    }
  }, []);

  const end = DateTime.fromISO(defaultSelected.end, { zone: 'GMT' });
  const start = DateTime.fromISO(defaultSelected.start, { zone: 'GMT' });

  return (
    <DateTimeRangePicker
      endDateProps={{
        value: end,
      }}
      onChange={({ end, preset, start }) => {
        if (!end || !start || !preset) {
          return;
        }

        handleStatsChange(
          {
            end: end.split('.')[0] + 'Z',
            preset,
            start: start.split('.')[0] + 'Z',
          },
          savePreferences
        );
      }}
      presetsProps={{
        defaultValue: defaultSelected.preset,
      }}
      startDateProps={{
        value: start,
      }}
      sx={{
        minWidth: '226px',
      }}
      enablePresets
    />
  );
};
