import { ActionsPanel, InputAdornment, TextField } from '@linode/ui';
import { Divider } from '@linode/ui';
import { Box } from '@linode/ui';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Grid, Popover } from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import React, { useEffect, useState } from 'react';

import { timezones } from 'src/assets/timezones/timezones';

import { TimeZoneSelect } from './TimeZoneSelect';

import type { SxProps, Theme } from '@mui/material/styles';
import type { DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';
import type { DateTime } from 'luxon';

export interface DateTimePickerProps {
  /** Additional props for the DateCalendar */
  dateCalendarProps?: Partial<DateCalendarProps<DateTime>>;
  disabledTimeZone?: boolean;
  /** Error text for the date picker field */
  errorText?: string;
  /** Format for displaying the date-time */
  format?: string;
  /** Label for the input field */
  label?: string;
  /** Minimum date-time before which all date-time will be disabled */
  minDate?: DateTime;
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
  disabledTimeZone = false,
  errorText = '',
  format = 'yyyy-MM-dd HH:mm',
  label = 'Select Date and Time',
  minDate,
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
    if (newTime && !newTime.invalidReason) {
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
          errorText={errorText}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <CalendarTodayIcon
                  sx={{
                    color: '#c2c2ca !important',
                    fontSize: '20px !important',
                    left: '8px',
                    position: 'absolute',
                  }}
                />
              </InputAdornment>
            ),
            sx: { paddingLeft: '32px' },
          }}
          label={label}
          noMarginTop
          onClick={(event) => setAnchorEl(event.currentTarget)}
          placeholder={placeholder}
          value={
            selectedDateTime
              ? `${selectedDateTime.toFormat(format)}${generateTimeZone(
                  selectedTimeZone
                )}`
              : ''
          }
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
            minDate={minDate}
            onChange={handleDateChange}
            value={selectedDateTime || null}
            {...dateCalendarProps}
            // TODO: Move styling customization to global theme styles.
            sx={(theme: Theme) => ({
              '& .MuiDayCalendar-weekContainer, & .MuiDayCalendar-header': {
                justifyContent: 'space-between',
              },
              '& .MuiDayCalendar-weekDayLabel': {
                fontSize: '0.875rem',
              },
              '& .MuiPickersCalendarHeader-label': {
                font: theme.font.bold,
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
          />
          <Grid
            container
            spacing={2}
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            {showTime && (
              <Grid item xs={4}>
                <TimePicker
                  data-qa-time="time-picker"
                  label={timeSelectProps?.label || 'Select Time'}
                  minTime={
                    minDate?.toISODate() === selectedDateTime?.toISODate()
                      ? minDate
                      : undefined
                  }
                  onChange={handleTimeChange}
                  slotProps={{
                    actionBar: {
                      sx: (theme: Theme) => ({
                        justifyContent: 'center',
                        marginBottom: theme.spacing(1 / 2),
                        marginTop: theme.spacing(1 / 2),
                        padding: 0,
                      }),
                    },

                    layout: {
                      sx: (theme: Theme) => ({
                        '& .MuiPickersLayout-contentWrapper': {
                          borderBottom: `1px solid ${theme.borderColors.divider}`,
                        },
                        border: `1px solid ${theme.borderColors.divider}`,
                      }),
                    },
                    openPickerButton: {
                      sx: { padding: 0 },
                    },
                    popper: {
                      sx: (theme: Theme) => ({
                        ul: {
                          borderColor: `${theme.borderColors.divider} !important`,
                        },
                      }),
                    },
                  }}
                  sx={{
                    marginTop: 0,
                  }}
                  value={selectedDateTime || null}
                />
              </Grid>
            )}
            {showTimeZone && (
              <Grid item xs={7}>
                <TimeZoneSelect
                  disabled={disabledTimeZone}
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
            primaryButtonProps={{ label: 'Apply', onClick: handleApply }}
            secondaryButtonProps={{
              buttonType: 'outlined',
              label: 'Cancel',
              onClick: handleClose,
            }}
            sx={(theme: Theme) => ({
              marginBottom: theme.spacing(1),
              marginRight: theme.spacing(2),
            })}
          />
        </Box>
      </Popover>
    </LocalizationProvider>
  );
};

const generateTimeZone = (selectedTimezone: null | string): string => {
  const offset = timezones.find(
    (zone) => zone.name === selectedTimezone
  )?.offset;
  if (!offset) {
    return '';
  }
  const minutes = (Math.abs(offset * 60) % 60).toLocaleString(undefined, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const hours = Math.floor(Math.abs(offset));
  const isPositive = Math.abs(offset) === offset ? '+' : '-';

  return ` (GMT${isPositive}${hours}:${minutes})`;
};
