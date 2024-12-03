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
  onChange?: (start: DateTime | null, end: DateTime | null) => void;
  /** Initial or controlled value for the start date-time */
  startDateTimeValue?: DateTime | null;
  /** Custom labels for the start and end date/time fields */
  startLabel?: string;
}

export const DateTimeRangePicker = ({
  endDateTimeValue = null,
  endLabel = 'End Date and Time',
  format = 'yyyy-MM-dd HH:mm',
  onChange,
  startDateTimeValue = null,
  startLabel = 'Start Date',
}: DateTimeRangePickerProps) => {
  const [startDateTime, setStartDateTime] = useState<DateTime | null>(
    startDateTimeValue
  );
  const [endDateTime, setEndDateTime] = useState<DateTime | null>(
    endDateTimeValue
  );
  const [error, setError] = useState<string>();

  const handleStartDateTimeChange = (newStart: DateTime | null) => {
    setStartDateTime(newStart);

    // Reset error if the selection is valid
    if (endDateTime && newStart && endDateTime >= newStart) {
      setError(undefined);
    }

    if (onChange) {
      onChange(newStart, endDateTime);
    }
  };

  const handleEndDateTimeChange = (newEnd: DateTime | null) => {
    // Check if the end date is before the start date
    if (startDateTime && newEnd && newEnd < startDateTime) {
      setError('Invalid date and time');
    } else {
      setEndDateTime(newEnd);
      setError(undefined); // Clear the error if the selection is valid
    }

    if (onChange) {
      onChange(startDateTime, newEnd);
    }
  };

  return (
    <Box display="flex" gap={2}>
      <DateTimePicker
        errorText={error}
        format={format}
        label={startLabel}
        onChange={handleStartDateTimeChange}
        timeSelectProps={{ label: 'Start Time' }}
        timeZoneSelectProps={{ label: 'TimeZone' }}
        value={startDateTime}
      />
      <DateTimePicker
        dateCalendarProps={{ minDate: startDateTime ?? DateTime.now() }}
        errorText={error}
        format={format}
        label={endLabel}
        onChange={handleEndDateTimeChange}
        timeSelectProps={{ label: 'End Time' }}
        timeZoneSelectProps={{ label: 'TimeZone' }}
        value={endDateTime}
      />
    </Box>
  );
};
