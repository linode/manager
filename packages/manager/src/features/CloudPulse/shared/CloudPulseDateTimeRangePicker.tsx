import { useProfile } from '@linode/queries';
import { DateTimeRangePicker } from '@linode/ui';
import { DateTime } from 'luxon';
import React from 'react';

import type { DateTimeWithPreset, FilterValue } from '@linode/api-v4';

interface DateChangeProps {
  endDate: null | string;
  selectedPreset: null | string;
  startDate: null | string;
}

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

    const handleDateChange = (params: DateChangeProps) => {
      const { endDate, selectedPreset, startDate } = params;
      if (!endDate || !startDate || !selectedPreset) {
        return;
      }
      handleStatsChange(
        {
          end: endDate,
          preset: selectedPreset,
          start: startDate,
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
        endDateProps={{
          label: 'End Date',
          placeholder: 'Select End Date',
          showTimeZone: true,
          value: end,
        }}
        format="yyyy-MM-dd hh:mm a"
        onApply={handleDateChange}
        presetsProps={{
          defaultValue: defaultSelected?.preset,
          enablePresets: true,
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
