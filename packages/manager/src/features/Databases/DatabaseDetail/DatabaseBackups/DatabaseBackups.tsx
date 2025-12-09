import { useDatabaseQuery, useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  Box,
  Button,
  Divider,
  Notice,
  Paper,
  TimePicker,
  Typography,
} from '@linode/ui';
import {
  FormControl,
  FormControlLabel,
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
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseBackupsDialog } from './DatabaseBackupsDialog';
import DatabaseBackupsLegacy from './legacy/DatabaseBackupsLegacy';

import type { DatabaseBackupsPayload } from '@linode/api-v4';
import type { TimeValidationError } from '@mui/x-date-pickers';

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

  const {
    data: database,
    error: databaseError,
    isLoading: isDatabaseLoading,
  } = useDatabaseQuery(engine, Number(databaseId));

  const isDefaultDatabase = database?.platform === 'rdbms-default';

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
    if (date && time) {
      const isSelectedTimeInvalid = isTimeOutsideBackup(
        time,
        date,
        oldestBackup!
      );

      if (!isSelectedTimeInvalid) {
        clearErrors('time');
      }
    }
  };

  const handleOnError = (error: TimeValidationError) => {
    switch (error) {
      case 'maxTime':
        setError('time', {
          message: BACKUPS_MAX_TIME_EXCEEDED_VALIDATON_TEXT,
        });
        break;
      case 'minTime':
        setError('time', {
          message: BACKUPS_MIN_TIME_EXCEEDED_VALIDATON_TEXT,
        });
        break;
      case 'invalidDate':
        setValue('time', null);
        setError('time', { message: BACKUPS_INVALID_TIME_VALIDATON_TEXT });
    }
  };

  const configureMinTime = () => {
    const canApplyMinTime = !!oldestBackup && !!date;
    const isOnMinDate = date?.day === oldestBackup?.day;
    return canApplyMinTime && isOnMinDate ? oldestBackup : undefined;
  };

  const configureMaxTime = () => {
    const today = DateTime.utc();
    const isOnMaxDate = today.day === date?.day;
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

  if (isDefaultDatabase) {
    return (
      <Paper style={{ marginTop: 16 }}>
        <Typography variant="h2">Summary</Typography>
        <StyledTypography>
          Databases are automatically backed-up with full daily backups for the
          past 14 days, and binary logs recorded continuously. Full backups are
          version-specific binary backups, which when combined with binary logs
          allow for consistent recovery to a specific point in time (PITR).
        </StyledTypography>
        <Divider spacingBottom={25} spacingTop={25} />
        <Typography variant="h2">Restore a Backup</Typography>
        <StyledTypography>
          {isDatabasesV2GA ? (
            <span>
              The newest full backup plus incremental is selected by default.
              Or, select any date and time within the last 14 days you want to
              create a fork from.
            </span>
          ) : (
            <span>
              Select a date and time within the last 14 days you want to create
              a fork from.
            </span>
          )}
        </StyledTypography>
        {unableToRestoreCopy && (
          <Notice spacingTop={16} text={unableToRestoreCopy} variant="info" />
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
                      disabled={disabled || versionOption === 'newest' || !date}
                      errorText={
                        versionOption === 'dateTime' && date
                          ? fieldState.error?.message
                          : undefined
                      }
                      format="HH:mm:ss"
                      key={
                        versionOption === 'dateTime'
                          ? 'time-picker-active'
                          : 'time-picker-disabled'
                      }
                      label=""
                      maxTime={configureMaxTime()}
                      minTime={configureMinTime()}
                      onChange={(newTime: DateTime) => {
                        validateDateTime(date, newTime);
                        field.onChange(newTime);
                      }}
                      onError={handleOnError}
                      sx={{
                        width: '220px',
                      }}
                      timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                      value={field.value}
                      views={['hours', 'minutes', 'seconds']}
                    />
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
              <Button
                buttonType="primary"
                data-qa-settings-button="restore"
                disabled={
                  versionOption === 'dateTime' &&
                  (!date || !time || !!errors.time)
                }
                onClick={() => setIsRestoreDialogOpen(true)}
              >
                Restore
              </Button>
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
  }

  return (
    <DatabaseBackupsLegacy
      database={database}
      databaseError={databaseError}
      disabled={disabled}
      engine={engine}
      isDatabaseLoading={isDatabaseLoading}
    />
  );
};
