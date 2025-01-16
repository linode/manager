import { DateTime } from 'luxon';
import React from 'react';

import { DateTimeRangePicker } from 'src/components/DatePicker/DateTimeRangePicker';
import { useProfile } from 'src/queries/profile/profile';

import type { FilterValue, TimeDurationDate } from '@linode/api-v4';

interface CloudPulseDateTimeRangePickerProps {
  defaultValue?: Partial<FilterValue>;

  handleStatsChange: (
    timeDuration: TimeDurationDate,
    savePref?: boolean
  ) => void;
  savePreferences?: boolean;
}

export const CloudPulseDateTimeRangePicker = React.memo(
  (props: CloudPulseDateTimeRangePickerProps) => {
    const { defaultValue, handleStatsChange, savePreferences } = props;
    const { data: profile } = useProfile();
    const timezone = profile?.timezone ?? DateTime.local().zoneName;
    const defaultSelected = defaultValue as TimeDurationDate;
    React.useEffect(() => {
      if (defaultSelected) {
        handleStatsChange(defaultSelected);
      }
    }, []);

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
        onChange={({ end, preset, start }) => {
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
      />
    );
  }
);

export const defaultTimeDuration = (): TimeDurationDate => {
  const date = DateTime.now().setZone('GMT');

  const start = convertToGmt(date.minus({ minutes: 30 }).toISO() ?? '');
  const end = convertToGmt(date.toISO() ?? '');

  return {
    end,
    start,
  };
};

export const convertToGmt = (date: string): string => {
  const dateObject = DateTime.fromISO(date);
  const updatedDate = dateObject.setZone('GMT');
  return updatedDate.toISO()?.split('.')[0] + 'Z';
};
