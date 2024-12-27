import React from 'react';

import { DateTimeRangePicker } from 'src/components/DatePicker/DateTimeRangePicker';

import type { TimeDurationDate } from '@linode/api-v4';

interface CloudPulseDateTimeRangePickerProps {
  handleStatsChange: (
    timeDuration: TimeDurationDate,
    savePref?: boolean
  ) => void;
}
export const CloudPulseDateTimeRangePicker = (
  props: CloudPulseDateTimeRangePickerProps
) => {
  const { handleStatsChange } = props;
  return (
    <DateTimeRangePicker
      onChange={({ end, start }) => {
        if (!end || !start) {
          return;
        }

        handleStatsChange({
          end: end.split('.')[0] + 'Z',
          start: start.split('.')[0] + 'Z',
        });
      }}
      sx={{
        minWidth: '226px',
      }}
      enablePresets
    />
  );
};
