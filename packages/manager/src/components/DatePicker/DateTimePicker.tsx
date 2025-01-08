import { InputAdornment, TextField } from '@linode/ui';
import { Divider } from '@linode/ui';
import { Box } from '@linode/ui';
import { Grid, Popover, useTheme } from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import React, { useEffect, useState } from 'react';

import Calendar from 'src/assets/icons/calendar.svg';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import { TimeZoneSelect } from './TimeZoneSelect';

import type { TextFieldProps } from '@linode/ui';
import type { SxProps, Theme } from '@mui/material/styles';
import type { DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';
import type { DateTime } from 'luxon';

export interface DateTimePickerProps {
  /** Additional props for the DateCalendar */
  dateCalendarProps?: Partial<DateCalendarProps<DateTime>>;
  /** Error text for the date picker field */
  errorText?: string;
  /** Format for displaying the date-time */
  format?: string;
  /** Label for the input field */
  label?: string;
  /** Callback when the "Apply" button is clicked */
  onApply?: () => void;
  /** Callback when the "Cancel" button is clicked */
  onCancel?: () => void;
  /** Callback when date-time changes */
  onChange: (dateTime: DateTime | null) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Whether to show the time selector */
  showTime?: boolean;
  /** Whether to show the timezone selector */
  showTimeZone?: boolean;
  /**
   * Any additional styles to apply to the root element.
   */
  sx?: SxProps<Theme>;
  /** Props for customizing the TimePicker component */
  timeSelectProps?: {
    label?: string;
    onChange?: (time: null | string) => void;
    value?: null | string;
  };
  /** Props for customizing the TimeZoneSelect component */
  timeZoneSelectProps?: {
    label?: string;
    onChange?: (timezone: string) => void;
    value?: null | string;
  };
  /** Initial or controlled dateTime value */
  value?: DateTime | null;
}

export const DateTimePicker = ({
  dateCalendarProps = {},
  errorText = '',
  format = 'yyyy-MM-dd HH:mm',
  label = 'Select Date and Time',
  onApply,
  onCancel,
  onChange,
  placeholder = 'Select Date',
  showTime = true,
  showTimeZone = true,
  sx,
  timeSelectProps = {},
  timeZoneSelectProps = {},
  value = null,
}: DateTimePickerProps) => {
  const theme = useTheme<Theme>();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Current and original states
  const [selectedDateTime, setSelectedDateTime] = useState<DateTime | null>(
    value
  );
  const [selectedTimeZone, setSelectedTimeZone] = useState<null | string>(
    timeZoneSelectProps.value || null
  );

  const [originalDateTime, setOriginalDateTime] = useState<DateTime | null>(
    value
  );
  const [originalTimeZone, setOriginalTimeZone] = useState<null | string>(
    timeZoneSelectProps.value || null
  );

  const TimePickerFieldProps: TextFieldProps = {
    label: timeSelectProps?.label ?? 'Select Time',
    noMarginTop: true,
  };

  const handleDateChange = (newDate: DateTime | null) => {
    setSelectedDateTime((prev) =>
      newDate
        ? newDate.set({
            hour: prev?.hour || 0,
            minute: prev?.minute || 0,
          })
        : null
    );
  };

  const handleTimeChange = (newTime: DateTime | null) => {
    if (newTime) {
      setSelectedDateTime((prev) =>
        prev ? prev.set({ hour: newTime.hour, minute: newTime.minute }) : prev
      );
    }
  };

  const handleTimeZoneChange = (newTimeZone: string) => {
    setSelectedTimeZone(newTimeZone);
    if (timeZoneSelectProps.onChange) {
      timeZoneSelectProps.onChange(newTimeZone);
    }
  };

  const handleApply = () => {
    setAnchorEl(null);
    setOriginalDateTime(selectedDateTime);
    setOriginalTimeZone(selectedTimeZone);
    onChange(selectedDateTime);

    if (onApply) {
      onApply();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedDateTime(originalDateTime);
    setSelectedTimeZone(originalTimeZone);

    if (onCancel) {
      onCancel();
    }
  };

  useEffect(() => {
    if (timeZoneSelectProps.value) {
      setSelectedTimeZone(timeZoneSelectProps.value);
    }
  }, [timeZoneSelectProps.value]);

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Box sx={{ minWidth: '300px', ...sx }}>
        <TextField
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <Calendar />
              </InputAdornment>
            ),
            sx: { paddingLeft: theme.spacing() },
          }}
          value={
            selectedDateTime
              ? `${selectedDateTime.toFormat(format)}${
                  selectedTimeZone ? ` (${selectedTimeZone})` : ''
                }`
              : ''
          }
          errorText={errorText}
          label={label}
          noMarginTop
          onClick={(event) => setAnchorEl(event.currentTarget)}
          placeholder={placeholder}
        />
      </Box>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={handleClose}
        open={Boolean(anchorEl)}
        role="dialog"
      >
        <Box padding={2}>
          <DateCalendar
            onChange={handleDateChange}
            value={selectedDateTime || null}
            {...dateCalendarProps}
          />
          <Grid
            container
            spacing={2}
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            {showTime && (
              <Grid item xs={4}>
                <TimePicker
                  slotProps={{
                    textField: TimePickerFieldProps,
                  }}
                  onChange={handleTimeChange}
                  slots={{ textField: TextField }}
                  value={selectedDateTime || null}
                />
              </Grid>
            )}
            {showTimeZone && (
              <Grid item xs={7}>
                <TimeZoneSelect
                  label={timeZoneSelectProps?.label || 'Timezone'}
                  noMarginTop
                  onChange={handleTimeZoneChange}
                  value={selectedTimeZone}
                />
              </Grid>
            )}
          </Grid>
        </Box>
        <Divider />
        <Box display="flex" justifyContent="flex-end">
          <ActionsPanel
            secondaryButtonProps={{
              buttonType: 'outlined',
              label: 'Cancel',
              onClick: handleClose,
            }}
            sx={(theme: Theme) => ({
              marginBottom: theme.spacing(1),
              marginRight: theme.spacing(2),
            })}
            primaryButtonProps={{ label: 'Apply', onClick: handleApply }}
          />
        </Box>
      </Popover>
    </LocalizationProvider>
  );
};
