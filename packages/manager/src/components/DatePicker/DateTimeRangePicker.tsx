import { Autocomplete, Box, StyledActionButton } from '@linode/ui';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DateTime } from 'luxon';
import React, { useState } from 'react';

import { DateTimePicker } from './DateTimePicker';

import type { SxProps, Theme } from '@mui/material/styles';

export interface DateTimeRangePickerProps {
  /** Properties for the end date field */
  endDateProps?: {
    /** Custom error message for invalid end date */
    errorMessage?: string;
    /** Label for the end date field */
    label?: string;
    /** placeholder for the end date field */
    placeholder?: string;
    /** Whether to show the timezone selector for the end date */
    showTimeZone?: boolean;
    /** Initial or controlled value for the end date-time */
    value?: DateTime | null;
  };

  /** Format for displaying the date-time */
  format?: string;

  /** Callback when the date-time range changes,
   * this returns start date, end date in ISO formate,
   * preset value and timezone
   * */
  onChange?: (params: {
    end: null | string;
    preset?: string;
    start: null | string;
    timeZone?: null | string;
  }) => void;

  /** Additional settings for the presets dropdown */
  presetsProps?: {
    /** Default value for the presets field */
    defaultValue?: { label: string; value: string };
    /** If true, shows the date presets field instead of the date pickers */
    enablePresets?: boolean;
    /** Label for the presets field */
    label?: string;
    /** placeholder for the presets field */
    placeholder?: string;
  };

  /** Properties for the start date field */
  startDateProps?: {
    /** Custom error message for invalid start date */
    errorMessage?: string;
    /** Label for the start date field */
    label?: string;
    /** placeholder for the start date field */
    placeholder?: string;
    /** Whether to show the timezone selector for the start date */
    showTimeZone?: boolean;
    /** Initial or controlled value for the start timezone */
    timeZoneValue?: null | string;
    /** Initial or controlled value for the start date-time */
    value?: DateTime | null;
  };

  /** Any additional styles to apply to the root element */
  sx?: SxProps<Theme>;
}

type DatePresetType =
  | '7days'
  | '24hours'
  | '30days'
  | 'custom_range'
  | 'last_month'
  | 'this_month';

const presetsOptions: { label: string; value: DatePresetType }[] = [
  { label: 'Last 24 Hours', value: '24hours' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom', value: 'custom_range' },
];

export const DateTimeRangePicker = (props: DateTimeRangePickerProps) => {
  const {
    endDateProps: {
      errorMessage: endDateErrorMessage = 'End date/time cannot be before the start date/time.',
      label: endLabel = 'End Date and Time',
      placeholder: endDatePlaceholder,
      showTimeZone: showEndTimeZone = false,
      value: endDateTimeValue = null,
    } = {},

    format = 'yyyy-MM-dd HH:mm',

    onChange,

    presetsProps: {
      defaultValue: presetsDefaultValue = { label: '', value: '' },
      enablePresets = false,
      label: presetsLabel = 'Time Range',
      placeholder: presetsPlaceholder = 'Select a preset',
    } = {},
    startDateProps: {
      errorMessage: startDateErrorMessage = 'Start date/time cannot be after the end date/time.',
      label: startLabel = 'Start Date and Time',
      placeholder: startDatePlaceholder,
      showTimeZone: showStartTimeZone = false,
      timeZoneValue: startTimeZoneValue = null,
      value: startDateTimeValue = null,
    } = {},
    sx,
  } = props;

  const [startDateTime, setStartDateTime] = useState<DateTime | null>(
    startDateTimeValue
  );
  const [endDateTime, setEndDateTime] = useState<DateTime | null>(
    endDateTimeValue
  );
  const [presetValue, setPresetValue] = useState<{
    label: string;
    value: string;
  }>(presetsDefaultValue);
  const [startTimeZone, setStartTimeZone] = useState<null | string>(
    startTimeZoneValue
  );
  const [startDateError, setStartDateError] = useState<null | string>(null);
  const [endDateError, setEndDateError] = useState<null | string>(null);
  const [showPresets, setShowPresets] = useState(enablePresets);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

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

  const handlePresetSelection = (value: DatePresetType) => {
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
    setPresetValue(
      presetsOptions.find((option) => option.value === value) ??
        presetsDefaultValue
    );

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
              handlePresetSelection(selection.value as DatePresetType);
            }
          }}
          defaultValue={presetsDefaultValue}
          disableClearable
          fullWidth
          label={presetsLabel}
          noMarginTop
          options={presetsOptions}
          placeholder={presetsPlaceholder}
          value={presetValue}
        />
      ) : (
        <Box
          display="flex"
          flexDirection={isSmallScreen ? 'column' : 'row'}
          gap={2}
        >
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
            placeholder={startDatePlaceholder}
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
            placeholder={endDatePlaceholder}
            showTimeZone={showEndTimeZone}
            timeSelectProps={{ label: 'End Time' }}
            value={endDateTime}
          />
          <Box
            alignContent={
              startDateError || endDateError ? 'center' : 'flex-end'
            }
          >
            <StyledActionButton
              onClick={() => {
                setShowPresets(true);
                setPresetValue(presetsDefaultValue);
              }}
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
