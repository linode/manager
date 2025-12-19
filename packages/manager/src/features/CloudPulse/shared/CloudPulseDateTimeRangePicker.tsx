import { useProfile } from '@linode/queries';
import { Box, Button, CalendarIcon, DateTimeRangePicker } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import React from 'react';

import {
  defaultTimeDuration,
  getTimeFromPreset,
} from '../Utils/CloudPulseDateTimePickerUtils';

import type { DateTimeWithPreset, FilterValue } from '@linode/api-v4';

interface DateChangeProps {
  endDate: null | string;
  selectedPreset: null | string;
  startDate: null | string;
  timeZone: null | string;
}

export interface CloudPulseDateTimeRangePickerProps {
  defaultValue?: Partial<FilterValue>;

  handleStatsChange: (
    timeDuration: DateTimeWithPreset,
    savePref?: boolean
  ) => void;
  savePreferences?: boolean;
}

export const CloudPulseDateTimeRangePicker = React.memo(
  (props: CloudPulseDateTimeRangePickerProps) => {
    const { defaultValue, handleStatsChange, savePreferences } = props;
    const { data: profile } = useProfile();
    let defaultSelected = defaultValue as DateTimeWithPreset;
    const RESET = 'Reset';
    const theme = useTheme();
    const timezone =
      defaultSelected?.timeZone ??
      profile?.timezone ??
      DateTime.local().zoneName;

    if (!defaultSelected) {
      defaultSelected = defaultTimeDuration(timezone);
    } else {
      defaultSelected = getTimeFromPreset(defaultSelected, timezone);
    }
    // Show button with preset value only if selected or default preset is not 'reset'
    const [selectedPreset, setSelectedPreset] = React.useState<
      string | undefined
    >(defaultSelected.preset);

    // Show calendar only if selected or default preset is 'reset' or button is clicked
    const [openCalendar, setOpenCalendar] = React.useState<boolean>(false);
    React.useEffect(() => {
      if (defaultSelected) {
        handleStatsChange(defaultSelected);
      }
    }, []);

    const handleClose = (selectedPreset: string) => {
      setOpenCalendar(false);
      setSelectedPreset(selectedPreset);
    };

    const handleDateChange = (params: DateChangeProps) => {
      const { endDate, selectedPreset, startDate, timeZone } = params;
      if (!endDate || !startDate || !selectedPreset || !timeZone) {
        return;
      }
      setOpenCalendar(selectedPreset !== RESET ? false : true);
      setSelectedPreset(selectedPreset);
      handleStatsChange(
        {
          end: endDate,
          preset: selectedPreset,
          start: startDate,
          timeZone,
        },
        savePreferences
      );
    };

    const end = defaultSelected?.start
      ? DateTime.fromISO(defaultSelected?.end, { zone: timezone })
      : undefined;
    const start = defaultSelected?.end
      ? DateTime.fromISO(defaultSelected?.start, { zone: timezone })
      : end;

    return (
      <Box alignItems={'center'} display={'flex'}>
        {selectedPreset !== RESET && !openCalendar && (
          <Button
            buttonType="secondary"
            data-testid="preset-button"
            endIcon={
              <CalendarIcon
                color={theme.tokens.alias.Background.Base}
                height={24}
                width={24}
              />
            }
            onClick={() => {
              setOpenCalendar(true);
            }}
            sx={{
              marginTop: 3.5,
              bottom: (theme) => theme.spacingFunction(2),
              '&:hover': {
                '& .MuiButton-endIcon svg': {
                  color: 'inherit',
                },
              },
            }}
          >
            {defaultSelected.preset}
          </Button>
        )}
        {(selectedPreset === RESET || openCalendar) && (
          <DateTimeRangePicker
            endDateProps={{
              label: 'End Date',
              placeholder: 'Select End Date',
              showTimeZone: true,
              value: end,
            }}
            format="yyyy-MM-dd hh:mm a"
            onApply={handleDateChange}
            onClose={handleClose}
            openCalendar={openCalendar}
            presetsProps={{
              defaultValue: defaultSelected?.preset,
              enablePresets: true,
            }}
            startDateProps={{
              label: 'Start Date',
              placeholder: 'Select Start Date',
              showTimeZone: true,
              timeZoneValue: timezone,
              value: start,
            }}
            sx={{
              minWidth: '100px',
            }}
            timeZoneProps={{
              defaultValue: timezone,
            }}
          />
        )}
      </Box>
    );
  }
);
