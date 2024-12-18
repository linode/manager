import { Autocomplete, Box, StyledActionButton } from '@linode/ui';
import { DateTime } from 'luxon';
import React, { useState } from 'react';

import { DateTimePicker } from './DateTimePicker';

import type { SxProps, Theme } from '@mui/material/styles';

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
  onChange?: (params: {
    end: null | string;
    preset?: string;
    start: null | string;
    timeZone?: null | string;
  }) => void;
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
  /** Any additional styles to apply to the root element */
  sx?: SxProps<Theme>;
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
  sx,
}: DateTimeRangePickerProps) => {
  const [startDateTime, setStartDateTime] = useState<DateTime | null>(
    startDateTimeValue
  );
  const [endDateTime, setEndDateTime] = useState<DateTime | null>(
    endDateTimeValue
  );
  const [presetValue, setPresetValue] = useState<string>('');
  const [startTimeZone, setStartTimeZone] = useState<null | string>(
    startTimeZoneValue
  );
  const [startDateError, setStartDateError] = useState<null | string>(null);
  const [endDateError, setEndDateError] = useState<null | string>(null);
  const [showPresets, setShowPresets] = useState(enablePresets);

  const validateDates = (
    start: DateTime | null,
    end: DateTime | null,
    source: 'end' | 'start'
  ) => {
    if (start && end) {
      if (source === 'start' && start > end) {
        setStartDateError(startDateErrorMessage);
        return;
      }
      if (source === 'end' && end < start) {
        setEndDateError(endDateErrorMessage);
        return;
      }
    }
    // Reset validation errors
    setStartDateError(null);
    setEndDateError(null);
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
    setPresetValue(value);

    if (onChange) {
      onChange({
        end: newEndDateTime?.toISO() ?? null,
        preset: value,
        start: newStartDateTime?.toISO() ?? null,
        timeZone: startTimeZone,
      });
    }

    setShowPresets(value !== 'custom_range');
  };

  const handleStartDateTimeChange = (newStart: DateTime | null) => {
    setStartDateTime(newStart);
    validateDates(newStart, endDateTime, 'start');

    if (onChange) {
      onChange({
        end: endDateTime?.toISO() ?? null,
        preset: 'custom_range',
        start: newStart?.toISO() ?? null,
        timeZone: startTimeZone,
      });
    }
  };

  const handleEndDateTimeChange = (newEnd: DateTime | null) => {
    setEndDateTime(newEnd);
    validateDates(startDateTime, newEnd, 'end');

    if (onChange) {
      onChange({
        end: newEnd?.toISO() ?? null,
        preset: 'custom_range',
        start: startDateTime?.toISO() ?? null,
        timeZone: startTimeZone,
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} sx={sx}>
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
            { label: 'Custom', value: 'custom_range' },
          ]}
          value={
            presetValue
              ? { label: presetValue.replace('_', ' '), value: presetValue }
              : null
          }
          fullWidth
          label="Date Presets"
          placeholder="Select a preset"
        />
      ) : (
        <Box display="flex" gap={2}>
          <DateTimePicker
            timeZoneSelectProps={{
              label: 'Start TimeZone',
              onChange: (value) => setStartTimeZone(value),
              value: startTimeZone,
            }}
            errorText={startDateError ?? undefined}
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
            errorText={endDateError ?? undefined}
            format={format}
            label={endLabel}
            onChange={handleEndDateTimeChange}
            showTimeZone={showEndTimeZone}
            timeSelectProps={{ label: 'End Time' }}
            value={endDateTime}
          />
          <Box alignContent="flex-end">
            <StyledActionButton
              onClick={() => setShowPresets(true)}
              style={{ alignSelf: 'flex-start' }}
              variant="text"
            >
              Presets
            </StyledActionButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};
