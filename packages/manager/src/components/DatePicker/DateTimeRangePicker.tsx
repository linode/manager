import { Box } from '@linode/ui';
import React, { useState } from 'react';

import { DateTimePicker } from './DateTimePicker';

import type { DateTime } from 'luxon';

interface DateTimeRangePickerProps {
  /** Custom error message for invalid end date */
  endDateErrorMessage?: string;
  /** Initial or controlled value for the end date-time */
  endDateTimeValue?: DateTime | null;
  /** Custom labels for the start and end date/time fields */
  endLabel?: string;
  /** Format for displaying the date-time */
  format?: string;
  /** Callback when the date-time range changes */
  onChange?: (
    start: DateTime | null,
    end: DateTime | null,
    startTimeZone?: null | string
  ) => void;
  /** Whether to show the end timezone field for the end date picker */
  showEndTimeZone?: boolean;
  /** Whether to show the start timezone field for the end date picker */
  showStartTimeZone?: boolean;
  /** Custom error message for invalid start date */
  startDateErrorMessage?: string;
  /** Initial or controlled value for the start date-time */
  startDateTimeValue?: DateTime | null;
  /** Custom labels for the start and end date/time fields */
  startLabel?: string;
  /** Initial or controlled value for the start timezone */
  startTimeZoneValue?: null | string;
}

export const DateTimeRangePicker = ({
  endDateErrorMessage = 'End date/time cannot be before the start date/time.',
  endDateTimeValue = null,
  endLabel = 'End Date and Time',
  format = 'yyyy-MM-dd HH:mm',
  onChange,
  showEndTimeZone = false,
  showStartTimeZone = false,
  startDateErrorMessage = 'Start date/time cannot be after the end date/time.',
  startDateTimeValue = null,
  startLabel = 'Start Date and Time',
  startTimeZoneValue = null,
}: DateTimeRangePickerProps) => {
  const [startDateTime, setStartDateTime] = useState<DateTime | null>(
    startDateTimeValue
  );
  const [endDateTime, setEndDateTime] = useState<DateTime | null>(
    endDateTimeValue
  );
  const [startTimeZone, setStartTimeZone] = useState<null | string>(
    startTimeZoneValue
  );
  const [error, setError] = useState<string>();

  const validateDates = (
    start: DateTime | null,
    end: DateTime | null,
    source: 'end' | 'start'
  ) => {
    if (start && end) {
      if (source === 'start' && start > end) {
        setError(startDateErrorMessage);
        return;
      }
      if (source === 'end' && end < start) {
        setError(endDateErrorMessage);
        return;
      }
    }
    setError(undefined); // Clear error if valid
  };

  const handleStartDateTimeChange = (newStart: DateTime | null) => {
    setStartDateTime(newStart);
    validateDates(newStart, endDateTime, 'start');

    if (onChange) {
      onChange(newStart, endDateTime, startTimeZone);
    }
  };

  const handleEndDateTimeChange = (newEnd: DateTime | null) => {
    setEndDateTime(newEnd);
    validateDates(startDateTime, newEnd, 'end');

    if (onChange) {
      onChange(startDateTime, newEnd, startTimeZone);
    }
  };

  const handleStartTimeZoneChange = (newTimeZone: null | string) => {
    setStartTimeZone(newTimeZone);

    if (onChange) {
      onChange(startDateTime, endDateTime, newTimeZone);
    }
  };

  return (
    <Box display="flex" gap={2}>
      {/* Start DateTime Picker */}
      <DateTimePicker
        timeZoneSelectProps={{
          label: 'Start TimeZone',
          onChange: handleStartTimeZoneChange,
          value: startTimeZone,
        }}
        errorText={error}
        format={format}
        label={startLabel}
        onChange={handleStartDateTimeChange}
        showTimeZone={showStartTimeZone}
        timeSelectProps={{ label: 'Start Time' }}
        value={startDateTime}
      />

      {/* End DateTime Picker */}
      <DateTimePicker
        timeZoneSelectProps={{
          value: startTimeZone, // Automatically reflect the start timezone
        }}
        dateCalendarProps={{ minDate: startDateTime ?? undefined }}
        format={format}
        label={endLabel}
        onChange={handleEndDateTimeChange}
        showTimeZone={showEndTimeZone}
        timeSelectProps={{ label: 'End Time' }}
        value={endDateTime}
      />
    </Box>
  );
};
