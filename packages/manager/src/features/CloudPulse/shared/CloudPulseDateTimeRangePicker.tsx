import { DateTime } from 'luxon';
import React from 'react';

import { DateTimeRangePicker } from 'src/components/DatePicker/DateTimeRangePicker';
import { useProfile } from 'src/queries/profile/profile';

import { convertToGmt } from '../Utils/CloudPulseDateTimePickerUtils';

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
      preset?: string | undefined;
      start: null | string;
      timezone?: null | string | undefined;
    }) => {
      const { end, preset, start } = params;
      if (!end || !start || !preset) {
        return;
      }
      handleStatsChange(
        {
          end: convertToGmt(end),
          preset,
          start: convertToGmt(start),
        },
        savePreferences
      );
    };

    const end = DateTime.fromISO(defaultSelected?.end, { zone: timezone });
    const start = DateTime.fromISO(defaultSelected?.start, { zone: timezone });

    return (
      <DateTimeRangePicker
        endDateProps={{
          label: 'End Date',
          placeholder: 'Select End Date',
          showTimeZone: true,
          value: end,
        }}
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
        disabledTimeZone
        enablePresets
        onChange={handleDateChange}
      />
    );
  }
);
