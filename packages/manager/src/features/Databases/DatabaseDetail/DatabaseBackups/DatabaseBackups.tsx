import {
  Button,
  Icon,
  NotificationBanner,
  TimePicker,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseQuery, useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { Box, Typography } from '@linode/ui';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { useParams } from '@tanstack/react-router';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { DateTime } from 'luxon';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import {
  StyledDateCalendar,
  StyledDateTimeStack,
  StyledRegionStack,
  StyledTypography,
} from 'src/features/Databases/DatabaseDetail/DatabaseBackups/DatabaseBackups.style';
import {
  isDateOutsideBackup,
  isTimeOutsideBackup,
  useIsDatabasesEnabled,
} from 'src/features/Databases/utilities';

import {
  BACKUPS_INVALID_TIME_VALIDATON_TEXT,
  BACKUPS_MAX_TIME_EXCEEDED_VALIDATON_TEXT,
  BACKUPS_MIN_TIME_EXCEEDED_VALIDATON_TEXT,
  BACKUPS_UNABLE_TO_RESTORE_TEXT,
} from '../../constants';
import { Divider } from '../../shared/Divider/Divider';
import { Paper } from '../../shared/Paper/Paper';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseBackupsDialog } from './DatabaseBackupsDialog';

import type { DatabaseBackupsPayload } from '@linode/api-v4';

export interface TimeOption {
  label: string;
  value: number;
}

export type VersionOption = 'dateTime' | 'newest';

export interface DatabaseBackupsValues extends DatabaseBackupsPayload {
  date: DateTime | null;
  time: DateTime | null;
}

export const DatabaseBackups = () => {
  const { disabled } = useDatabaseDetailContext();
  const { databaseId, engine } = useParams({
    from: '/databases/$engine/$databaseId',
  });
  const { isDatabasesV2GA } = useIsDatabasesEnabled();

  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const { data: regionsData } = useRegionsQuery();

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [versionOption, setVersionOption] = React.useState<VersionOption>(
    isDatabasesV2GA ? 'newest' : 'dateTime'
  );

  const { data: database } = useDatabaseQuery(engine, Number(databaseId));

  const oldestBackup = database?.oldest_restore_time
    ? DateTime.fromISO(`${database.oldest_restore_time}`, { zone: 'utc' }) // Backend uses UTC, so we explicitly set this as the timezone
    : null;

  const unableToRestoreCopy = !oldestBackup
    ? BACKUPS_UNABLE_TO_RESTORE_TEXT
    : '';

  /**
   * Check whether date and time are within the valid range of available backups by providing the selected date and time.
   * When the date and time selections are valid, clear any existing error messages for the time picker.
   */
  const validateDateTime = (date: DateTime | null, time: DateTime | null) => {
    if (!date || !time) {
      return;
    }

    const minTime = configureMinTime(date);
    const maxTime = configureMaxTime(date);

    if (maxTime && time > maxTime) {
      setError('time', { message: BACKUPS_MAX_TIME_EXCEEDED_VALIDATON_TEXT });
      return;
    }

    if (minTime && time < minTime) {
      setError('time', { message: BACKUPS_MIN_TIME_EXCEEDED_VALIDATON_TEXT });
      return;
    }

    const isSelectedTimeInvalid = isTimeOutsideBackup(
      time,
      date,
      oldestBackup!
    );
    if (isSelectedTimeInvalid) {
      setError('time', { message: BACKUPS_MIN_TIME_EXCEEDED_VALIDATON_TEXT });
    } else {
      clearErrors('time');
    }
  };

  // The CDS picker parses/displays using the browser's local timezone.
  // We convert between UTC Luxon DateTimes and JS Dates whose *local* time
  // components equal the UTC hour/minute/second values, so the picker always
  // shows and accepts UTC times regardless of the user's local timezone.
  const toPickerDate = (dt: DateTime | null | undefined): Date | undefined => {
    if (!dt) return undefined;
    const d = new Date();
    d.setHours(dt.hour, dt.minute, dt.second, 0);
    return d;
  };

  const configureMinTime = (forDate?: DateTime | null) => {
    const d = forDate !== undefined ? forDate : date;
    const canApplyMinTime = !!oldestBackup && !!d;
    const isOnMinDate = d?.day === oldestBackup?.day;
    return canApplyMinTime && isOnMinDate ? oldestBackup : undefined;
  };

  const configureMaxTime = (forDate?: DateTime | null) => {
    const d = forDate !== undefined ? forDate : date;
    const today = DateTime.utc();
    const isOnMaxDate = today.day === d?.day;
    return isOnMaxDate ? today : undefined;
  };

  const handleOnVersionOptionChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    value: VersionOption
  ) => {
    setVersionOption(value);
    setValue('date', null);
    setValue('time', null);
    clearErrors('time');
  };

  const form = useForm<DatabaseBackupsValues>({
    defaultValues: {
      fork: {
        source: database?.id,
        restore_time: undefined,
      },
      date: null,
      time: null,
      region: database?.region,
    },
  });

  const {
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const [date, time, region] = useWatch({
    control,
    name: ['date', 'time', 'region'],
  });

  const unableToRestoreDisabled =
    Boolean(unableToRestoreCopy) ||
    (versionOption === 'dateTime' && (!date || !time || !!errors.time));

  return (
    <Paper>
      <Typography variant="h2">Summary</Typography>
      <StyledTypography>
        Databases are automatically backed-up with full daily backups for the
        past 14 days, and binary logs recorded continuously. Full backups are
        version-specific binary backups, which when combined with binary logs
        allow for consistent recovery to a specific point in time (PITR).
      </StyledTypography>
      <Divider marginBottom={Spacing.S24} marginTop={Spacing.S24} />
      <Typography variant="h2">Restore a Backup</Typography>
      <StyledTypography>
        {isDatabasesV2GA ? (
          <span>
            The newest full backup plus incremental is selected by default. Or,
            select any date and time within the last 14 days you want to create
            a fork from.
          </span>
        ) : (
          <span>
            Select a date and time within the last 14 days you want to create a
            fork from.
          </span>
        )}
      </StyledTypography>
      {unableToRestoreCopy && (
        <NotificationBanner
          style={{ marginTop: Spacing.S16, marginBottom: Spacing.S16 }}
          text={unableToRestoreCopy}
          type="info"
        />
      )}
      <FormProvider {...form}>
        <form>
          {isDatabasesV2GA && (
            <RadioGroup
              aria-label="type"
              name="type"
              onChange={handleOnVersionOptionChange}
              value={versionOption}
            >
              <FormControlLabel
                control={<Radio />}
                data-qa-dbaas-radio="Newest"
                disabled={disabled}
                label="Newest full backup plus incremental"
                value="newest"
              />
              <FormControlLabel
                control={<Radio />}
                data-qa-dbaas-radio="DateTime"
                disabled={disabled}
                label="Specific date & time"
                value="dateTime"
              />
            </RadioGroup>
          )}
          <Typography variant="h3">Date</Typography>
          <StyledDateTimeStack>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                  <StyledDateCalendar
                    disabled={disabled || versionOption === 'newest'}
                    onChange={(newDate: DateTime) => {
                      validateDateTime(newDate, time);
                      field.onChange(newDate);
                    }}
                    shouldDisableDate={(date) =>
                      isDateOutsideBackup(date, oldestBackup?.startOf('day'))
                    }
                    value={field.value}
                  />
                </LocalizationProvider>
              )}
            />
            <Controller
              control={control}
              name="time"
              render={({ field, fieldState }) => (
                <FormControl style={{ marginTop: 0 }}>
                  <Typography variant="h3">Time (UTC)</Typography>
                  <TimePicker
                    dateTime={toPickerDate(field.value) ?? null}
                    disabled={disabled || versionOption === 'newest' || !date}
                    error={!!fieldState.error}
                    hourStep={1}
                    key={
                      versionOption === 'dateTime'
                        ? 'time-picker-active'
                        : 'time-picker-disabled'
                    }
                    minuteStep={15}
                    noMeridian
                    onChange={(e: CustomEvent<Date | null>) => {
                      const newDate = e.detail;
                      if (newDate === null) {
                        setError('time', {
                          message: BACKUPS_INVALID_TIME_VALIDATON_TEXT,
                        });
                        field.onChange(null);
                        return;
                      }
                      // Read local time components (what the user typed/selected)
                      // and store them as UTC hours in the Luxon DateTime.
                      const newTime = DateTime.utc().set({
                        hour: newDate.getHours(),
                        minute: newDate.getMinutes(),
                        second: newDate.getSeconds(),
                      });
                      validateDateTime(date, newTime);
                      field.onChange(newTime);
                    }}
                    seconds
                    style={{ width: '220px' }}
                  />
                  {versionOption === 'dateTime' &&
                    date &&
                    fieldState.error?.message && (
                      <FormHelperText error sx={{ marginLeft: 0 }}>
                        {fieldState.error.message}
                      </FormHelperText>
                    )}
                </FormControl>
              )}
            />
          </StyledDateTimeStack>
          <StyledRegionStack>
            <Controller
              control={control}
              name="region"
              render={({ field, fieldState }) => (
                <RegionSelect
                  currentCapability="Managed Databases"
                  disableClearable
                  disabled={disabled}
                  errorText={fieldState.error?.message}
                  isGeckoLAEnabled={isGeckoLAEnabled}
                  onChange={(e, region) => field.onChange(region.id)}
                  regions={regionsData ?? []}
                  value={region ?? null}
                />
              )}
            />
          </StyledRegionStack>
          <Box display="flex" justifyContent="flex-end">
            <Tooltip
              disabled={!unableToRestoreCopy}
              tooltipText={unableToRestoreCopy}
            >
              <Button
                data-qa-settings-button="restore"
                disabled={unableToRestoreDisabled}
                onClick={() => setIsRestoreDialogOpen(true)}
                variant="primary"
              >
                Restore
                {unableToRestoreCopy ? (
                  <Icon icon="info-outline" size="m" />
                ) : null}
              </Button>
            </Tooltip>
          </Box>
          {database && (
            <DatabaseBackupsDialog
              database={database}
              onClose={() => setIsRestoreDialogOpen(false)}
              open={isRestoreDialogOpen}
            />
          )}
        </form>
      </FormProvider>
    </Paper>
  );
};
