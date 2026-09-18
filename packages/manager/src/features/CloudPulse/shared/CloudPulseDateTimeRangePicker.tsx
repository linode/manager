import { useProfile } from '@linode/queries';
import { Box, Button, CalendarIcon, DateTimeRangePicker } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import {
  defaultTimeDuration,
  getTimeFromPreset,
} from '../Utils/CloudPulseDateTimePickerUtils';

import type {
  CloudPulseServiceType,
  DateTimeWithPreset,
  FilterValue,
} from '@linode/api-v4';

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

  serviceType: CloudPulseServiceType | undefined;
}

export const CloudPulseDateTimeRangePicker = React.memo(
  (props: CloudPulseDateTimeRangePickerProps) => {
    const { defaultValue, handleStatsChange, savePreferences, serviceType } =
      props;
    const { data: profile } = useProfile();
    const flags = useFlags();
    const RESET = 'Reset';
    const theme = useTheme();
    const timezone =
      profile?.timezone === 'GMT'
        ? 'Etc/GMT' // this is present in timezone list for GMT
        : (profile?.timezone ?? DateTime.local().zoneName);
    // Show button with preset value only if selected or default preset is not 'reset'
    const [selectedPreset, setSelectedPreset] = React.useState<
      DateTimeWithPreset | undefined
    >();

    // Show calendar only if selected or default preset is 'reset' or button is clicked
    const [openCalendar, setOpenCalendar] = React.useState<boolean>(false);

    // Applies the saved default or the service default exactly once. Never persists.
    const hasAppliedInitialDefault = React.useRef(false);
    React.useEffect(() => {
      if (hasAppliedInitialDefault.current || !serviceType) {
        return;
      }
      hasAppliedInitialDefault.current = true;

      const preset = flags.aclpServices?.[serviceType]?.metrics?.defaultPreset;
      const initialDuration = defaultValue
        ? getTimeFromPreset(defaultValue as DateTimeWithPreset, timezone)
        : defaultTimeDuration(timezone, preset);

      setSelectedPreset(initialDuration);
      handleStatsChange(initialDuration, false);
    }, [
      defaultValue,
      flags.aclpServices,
      handleStatsChange,
      serviceType,
      timezone,
    ]);

    // Recomputes a fresh default duration whenever the dashboard's service
    // type changes post-mount. Persistence for this transition is owned by
    // the dashboard-change handler, not here.
    const previousServiceTypeRef = React.useRef(serviceType);
    React.useEffect(() => {
      if (
        !hasAppliedInitialDefault.current ||
        previousServiceTypeRef.current === serviceType
      ) {
        return;
      }
      previousServiceTypeRef.current = serviceType;

      const preset = serviceType
        ? flags.aclpServices?.[serviceType]?.metrics?.defaultPreset
        : undefined;
      const newDuration = defaultTimeDuration(timezone, preset);

      setSelectedPreset(newDuration);
      handleStatsChange(newDuration, false);
    }, [flags.aclpServices, handleStatsChange, serviceType, timezone]);

    const handleClose = (_selectedPreset: string) => {
      setOpenCalendar(false);
    };

    const handleDateChange = (params: DateChangeProps) => {
      const { endDate, selectedPreset, startDate, timeZone } = params;
      if (!endDate || !startDate || !selectedPreset || !timeZone) {
        return;
      }
      setOpenCalendar(selectedPreset !== RESET ? false : true);
      setSelectedPreset({
        end: endDate,
        preset: selectedPreset,
        start: startDate,
        timeZone,
      });
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

    const end = selectedPreset?.start
      ? DateTime.fromISO(selectedPreset?.end, { zone: timezone })
      : undefined;
    const start = selectedPreset?.end
      ? DateTime.fromISO(selectedPreset?.start, { zone: timezone })
      : end;

    return (
      <Box alignItems="center" alignSelf="center" display="flex">
        {selectedPreset?.preset !== RESET && !openCalendar && (
          <Button
            buttonType="secondary"
            data-testid="preset-button"
            endIcon={
              <CalendarIcon
                color={theme.tokens.alias.Content.Icon.Primary.Default}
                height={24}
                width={24}
              />
            }
            onClick={() => {
              setOpenCalendar(true);
            }}
            sx={{
              alignItems: 'center',
              '&:hover': {
                '& .MuiButton-endIcon svg': {
                  color: 'inherit',
                },
              },
            }}
          >
            {selectedPreset?.preset}
          </Button>
        )}
        {(selectedPreset?.preset === RESET || openCalendar) && (
          <DateTimeRangePicker
            endDateProps={{
              label: '',
              placeholder: 'Select End Date',
              showTimeZone: true,
              value: end,
            }}
            format="yyyy-MM-dd hh:mm a"
            onApply={handleDateChange}
            onClose={handleClose}
            openCalendar={openCalendar}
            presetsProps={{
              defaultValue: selectedPreset?.preset,
              enablePresets: true,
            }}
            startDateProps={{
              label: '',
              placeholder: 'Select Start Date',
              showTimeZone: true,
              timeZoneValue: timezone,
              value: start,
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
