import { Box } from '@linode/ui';
import React, { useState } from 'react';

import { DateTimePicker } from './DateTimePicker';

import type { SxProps, Theme } from '@mui/material/styles';
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
  onChange: (
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
  /**
   * Any additional styles to apply to the root element.
   */
  sx?: SxProps<Theme>;
}

export const DateTimeRangePicker = ({
  endDateErrorMessage,
  endDateTimeValue = null,
  endLabel = 'End Date and Time',
  format = 'yyyy-MM-dd HH:mm',
  onChange,
  showEndTimeZone = false,
  showStartTimeZone = false,
  startDateErrorMessage,
  startDateTimeValue = null,
  startLabel = 'Start Date and Time',
  startTimeZoneValue = null,
  sx,
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

  const [startDateError, setStartDateError] = useState<string>();
  const [endDateError, setEndDateError] = useState<string>();

  const validateDates = (
    start: DateTime | null,
    end: DateTime | null,
    source: 'end' | 'start'
  ) => {
    if (start && end) {
      if (source === 'start' && start > end) {
        setStartDateError('Start date/time cannot be after the end date/time.');
        setEndDateError(undefined);
        return;
      }
      if (source === 'end' && end < start) {
        setEndDateError('End date/time cannot be before the start date/time.');
        setStartDateError(undefined);
        return;
      }
    }
    // Reset validation errors if valid
    setStartDateError(undefined);
    setEndDateError(undefined);
  };

  const handleStartDateTimeChange = (newStart: DateTime | null) => {
    setStartDateTime(newStart);
    validateDates(newStart, endDateTime, 'start');

    onChange(newStart, endDateTime, startTimeZone);
  };

  const handleEndDateTimeChange = (newEnd: DateTime | null) => {
    setEndDateTime(newEnd);
    validateDates(startDateTime, newEnd, 'end');

    onChange(startDateTime, newEnd, startTimeZone);
  };

  const handleStartTimeZoneChange = (newTimeZone: null | string) => {
    setStartTimeZone(newTimeZone);

    onChange(startDateTime, endDateTime, newTimeZone);
  };

  return (
    <Box display="flex" gap={2} sx={sx}>
      {/* Start DateTime Picker */}
      <DateTimePicker
        timeZoneSelectProps={{
          label: 'Start TimeZone',
          onChange: handleStartTimeZoneChange,
          value: startTimeZone,
        }}
        errorText={startDateError ?? startDateErrorMessage}
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
        errorText={endDateError ?? endDateErrorMessage}
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
import { Autocomplete, Box, Button } from '@linode/ui';
import { DateTime } from 'luxon';
import React, { useState } from 'react';

import { DateTimePicker } from './DateTimePicker';

interface DateTimeRangePickerProps {
  /** If true, shows the date presets field instead of the date pickers */
  enablePresets?: boolean;
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
  /** Whether to show the start timezone field for the start date picker */
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
  enablePresets = false,
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
  const [showPresets, setShowPresets] = useState(enablePresets);

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

  const handlePresetSelection = (value: string) => {
    const now = DateTime.now();
    let newStartDateTime: DateTime | null = null;
    let newEndDateTime: DateTime | null = null;

    switch (value) {
      case '24hours':
        newStartDateTime = now.minus({ hours: 24 });
        newEndDateTime = now;
        break;
      case '7days':
        newStartDateTime = now.minus({ days: 7 });
        newEndDateTime = now;
        break;
      case '30days':
        newStartDateTime = now.minus({ days: 30 });
        newEndDateTime = now;
        break;
      case 'this_month':
        newStartDateTime = now.startOf('month');
        newEndDateTime = now.endOf('month');
        break;
      case 'last_month':
        const lastMonth = now.minus({ months: 1 });
        newStartDateTime = lastMonth.startOf('month');
        newEndDateTime = lastMonth.endOf('month');
        break;
      case 'custom_range':
        newStartDateTime = null;
        newEndDateTime = null;
        break;
      default:
        return;
    }

    setStartDateTime(newStartDateTime);
    setEndDateTime(newEndDateTime);

    if (onChange) {
      onChange(newStartDateTime, newEndDateTime, startTimeZone);
    }

    // Show date pickers after selecting a preset
    if (value !== 'custom_range') {
      setShowPresets(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {showPresets ? (
        <Autocomplete
          onChange={(_, selection) => {
            if (selection) {
              handlePresetSelection(selection.value);
            }
          }}
          options={[
            { label: 'Last 24 Hours', value: '24hours' },
            { label: 'Last 7 Days', value: '7days' },
            { label: 'Last 30 Days', value: '30days' },
            { label: 'This Month', value: 'this_month' },
            { label: 'Last Month', value: 'last_month' },
            { label: 'Custom Range', value: 'custom_range' },
          ]}
          value={{
            label: 'Select a preset',
            value: '',
          }}
          fullWidth
          label="Date Presets"
          placeholder="Select Date"
        />
      ) : (
        <>
          <Box display="flex" gap={2}>
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
            <DateTimePicker
              timeZoneSelectProps={{
                value: startTimeZone,
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
          <Button
            onClick={() => setShowPresets(true)}
            style={{ alignSelf: 'flex-start' }}
            variant="text"
          >
            Back to Presets
          </Button>
        </>
      )}
    </Box>
  );
};
