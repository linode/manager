import { Box } from '@linode/ui';
import { DateTime } from 'luxon';
import React, { useState } from 'react';

import { DateTimePicker } from './DateTimePicker';

interface DateTimeRangePickerProps {
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
  /** Whether to show the timezone field for the end date picker */
  showEndTimeZone?: boolean;
  /** Initial or controlled value for the start date-time */
  startDateTimeValue?: DateTime | null;
  /** Custom labels for the start and end date/time fields */
  startLabel?: string;
  /** Initial or controlled value for the start timezone */
  startTimeZoneValue?: null | string;
}

export const DateTimeRangePicker = ({
  endDateTimeValue = null,
  endLabel = 'End Date and Time',
  format = 'yyyy-MM-dd HH:mm',
  onChange,
  showEndTimeZone = false,
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

  const handleStartDateTimeChange = (newStart: DateTime | null) => {
    setStartDateTime(newStart);

    if (endDateTime && newStart && endDateTime >= newStart) {
      setError(undefined); // Clear error if valid
    }

    if (onChange) {
      onChange(newStart, endDateTime, startTimeZone);
    }
  };

  const handleEndDateTimeChange = (newEnd: DateTime | null) => {
    if (startDateTime && newEnd && newEnd < startDateTime) {
      setError('End date/time must be after the start date/time.');
    } else {
      setEndDateTime(newEnd);
      setError(undefined);
    }

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
        timeSelectProps={{ label: 'Start Time' }}
        value={startDateTime}
      />

      {/* End DateTime Picker */}
      <DateTimePicker
        timeZoneSelectProps={{
          value: startTimeZone, // Automatically reflect the start timezone
        }}
        dateCalendarProps={{ minDate: startDateTime ?? DateTime.now() }}
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
