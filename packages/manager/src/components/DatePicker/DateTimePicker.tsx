import { TextField } from '@linode/ui';
import { Box } from '@linode/ui';
import { Divider } from '@linode/ui';
import { Grid, Popover } from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import React, { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import { TimeZoneSelect } from './TimeZoneSelect';

import type { TextFieldProps } from '@linode/ui';
import type { DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';
import type { DateTime } from 'luxon';

export interface DateTimePickerProps {
  /** Additional props for the DateCalendar */
  dateCalendarProps?: Partial<DateCalendarProps<DateTime>>;
  /** Error text for the date picker filed */
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
  onChange?: (dateTime: DateTime | null) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Whether to show the time selector */
  showTime?: boolean;
  /** Whether to show the timezone selector */
  showTimeZone?: boolean;
  /** Props for customizing the TimePicker component */
  timeSelectProps?: {
    label?: string;
    onChange?: (time: string) => void;
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
  placeholder = 'yyyy-MM-dd HH:mm',
  showTime = true,
  showTimeZone = true,
  timeSelectProps,
  timeZoneSelectProps,
  value = null,
}: DateTimePickerProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dateTime, setDateTime] = useState<DateTime | null>(value);
  const [timezone, setTimezone] = useState<null | string>(
    timeZoneSelectProps?.value || null
  );

  const textFieldProps: TextFieldProps = {
    label: timeSelectProps?.label ?? 'Select Time',
    noMarginTop: true,
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleApply = () => {
    setAnchorEl(null);
    if (onChange) {
      onChange(dateTime);
    }
    if (onApply) {
      onApply();
    }
  };

  const handleDateChange = (newDate: DateTime | null) => {
    setDateTime((prev) =>
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
      setDateTime((prev) => {
        if (prev) {
          // Ensure hour and minute are valid numbers
          const newHour = newTime.hour;
          const newMinute = newTime.minute;

          if (typeof newHour === 'number' && typeof newMinute === 'number') {
            return prev.set({ hour: newHour, minute: newMinute });
          }
        }
        // Return the current `prev` value if newTime is invalid
        return prev;
      });
    }
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    setDateTime((prev) => (prev ? prev.setZone(newTimezone) : null));
    if (timeZoneSelectProps?.onChange) {
      timeZoneSelectProps.onChange(newTimezone);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Box>
        <TextField
          value={
            dateTime
              ? `${dateTime.toFormat(format)}${
                  timezone ? ` (${timezone})` : ''
                }`
              : ''
          }
          InputProps={{ readOnly: true }}
          errorText={errorText}
          label={label}
          onClick={handleOpen}
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
            sx={(theme) => ({
              '& .MuiDayCalendar-weekContainer, & .MuiDayCalendar-header': {
                justifyContent: 'space-between',
              },
              '& .MuiDayCalendar-weekDayLabel': {
                fontSize: '0.875rem',
              },
              '& .MuiPickersCalendarHeader-label': {
                fontFamily: theme.font.bold,
              },
              '& .MuiPickersCalendarHeader-root': {
                borderBottom: `1px solid ${theme.borderColors.divider}`,
                fontSize: '0.875rem',
                paddingBottom: theme.spacing(1),
              },
              '& .MuiPickersDay-root': {
                fontSize: '0.875rem',
                margin: `${theme.spacing(0.5)}px`,
              },
              borderRadius: `${theme.spacing(2)}`,
              borderWidth: '0px',
            })}
            onChange={handleDateChange}
            value={dateTime}
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
                    openPickerButton: {
                      sx: {
                        padding: 0, // Remove padding for the icon
                      },
                    },
                    textField: textFieldProps,
                  }}
                  onChange={handleTimeChange}
                  slots={{ textField: TextField }}
                  value={dateTime}
                />
              </Grid>
            )}
            {showTimeZone && (
              <Grid item xs={7}>
                <TimeZoneSelect
                  label={timeZoneSelectProps?.label || 'Timezone'}
                  noMarginTop
                  onChange={handleTimezoneChange}
                  value={timezone}
                />
              </Grid>
            )}
          </Grid>
        </Box>
        <Divider />
        <Box display="flex" justifyContent="flex-end">
          <ActionsPanel
            primaryButtonProps={{
              label: 'Apply',
              onClick: handleApply,
            }}
            secondaryButtonProps={{
              buttonType: 'outlined',
              label: 'Cancel',
              onClick: handleClose,
            }}
            sx={(theme) => ({
              marginBottom: theme.spacing(1),
              marginRight: theme.spacing(2),
            })}
          />
        </Box>
      </Popover>
    </LocalizationProvider>
  );
};
