import { useProfile } from '@linode/queries';
import { DateTime } from 'luxon';
import React from 'react';

import { DateTimeRangePicker } from 'src/components/DatePicker/DateTimeRangePicker';

import type { DateTimeWithPreset, FilterValue } from '@linode/api-v4';

interface CloudPulseDateTimeRangePickerProps {
  defaultValue?: Partial<FilterValue>;

  handleStatsChange: (
    timeDuration: DateTimeWithPreset,
    savePref?: boolean
  ) => void;
  savePreferences?: boolean;
}

export const CloudPulseDateTimeRangePicker = React.memo(
  (props: CloudPulseDateTimeRangePickerProps) => {
    const { defaultValue, handleStatsChange, savePreferences } = props;
    const { data: profile } = useProfile();
    const timezone = profile?.timezone ?? DateTime.local().zoneName;
    const defaultSelected = defaultValue as DateTimeWithPreset;
    React.useEffect(() => {
      if (defaultSelected) {
        handleStatsChange(defaultSelected);
      }
    }, []);

    const handleDateChange = (params: {
      end: null | string;
      preset?: string;
      start: null | string;
      timezone?: null | string;
    }) => {
      const { end, preset, start } = params;
      if (!end || !start || !preset) {
        return;
      }
      handleStatsChange(
        {
          end,
          preset,
          start,
        },
        savePreferences
      );
    };

    const end = defaultSelected?.start
      ? DateTime.fromISO(defaultSelected?.end, { zone: timezone })
      : undefined;
    const start = defaultSelected?.end
      ? DateTime.fromISO(defaultSelected?.start, { zone: timezone })
      : end;

    return (
      <DateTimeRangePicker
        disabledTimeZone
        enablePresets
        endDateProps={{
          label: 'End Date',
          placeholder: 'Select End Date',
          showTimeZone: true,
          value: end,
        }}
        format="yyyy-MM-dd hh:mm a"
        onChange={handleDateChange}
        presetsProps={{
          defaultValue: defaultSelected?.preset,
        }}
        startDateProps={{
          label: 'Start Date',
          placeholder: 'Select Start Date',
          showTimeZone: true,
          timeZoneValue: timezone,
          value: start,
        }}
        sx={{
          minWidth: '226px',
        }}
      />
    );
  }
);
