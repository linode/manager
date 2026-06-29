import {
  Button,
  Calendar,
  FormError,
  FormField,
  Icon,
  NotificationBanner,
  RadioButton,
  RadioGroup,
  Select,
  TimePicker,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { useDatabaseQuery, useProfile, useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { InputLabel } from '@linode/ui';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { useParams } from '@tanstack/react-router';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { DateTime } from 'luxon';
import * as React from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import {
  StyledDateTimeStack,
  StyledRegionStack,
} from 'src/features/Databases/DatabaseDetail/DatabaseBackups/DatabaseBackups.style';
import { isTimeOutsideBackup } from 'src/features/Databases/utilities';

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

interface Option {
  label: string;
  value: string;
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

  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const { data: profile } = useProfile();
  const { data: regionsData } = useRegionsQuery();

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [versionOption, setVersionOption] =
    React.useState<VersionOption>('newest');

  const { data: database } = useDatabaseQuery(engine, Number(databaseId));

  const oldestBackup = database?.oldest_restore_time
    ? DateTime.fromISO(`${database.oldest_restore_time}`, { zone: 'utc' }) // Backend uses UTC, so we explicitly set this as the timezone
    : null;

  const isValkeyBackupUnavailable =
    database?.engine === 'valkey' &&
    database.available_restore_times !== null &&
    database.available_restore_times.length === 0;

  const isCalendarDisabled =
    isValkeyBackupUnavailable ||
    (database?.engine !== 'valkey' && !oldestBackup);

  const unableToRestoreCopy =
    (database?.engine !== 'valkey' && !oldestBackup) ||
    isValkeyBackupUnavailable
      ? BACKUPS_UNABLE_TO_RESTORE_TEXT
      : '';

  const availableRestoreTimeOptions = database?.available_restore_times
    ? database!.available_restore_times.map((restoreTime) => ({
        label: formatDate(restoreTime, {
          timezone: profile?.timezone,
        }),
        value: restoreTime,
      }))
    : [];

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

  const handleOnVersionOptionChange = (e: CustomEvent) => {
    setVersionOption(e.detail.value);
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

  const [date, time, region, fork] = useWatch({
    control,
    name: ['date', 'time', 'region', 'fork'],
  });

  const isValkeyDatabase = database?.engine === 'valkey';

  const isRestoreDisabled =
    Boolean(unableToRestoreCopy) ||
    (isValkeyDatabase && !fork.restore_time) ||
    (versionOption === 'dateTime' && (!date || !time || !!errors.time));

  return (
    <Paper>
      {!isValkeyDatabase && (
        <>
          <h3 style={{ margin: 0 }}>Summary</h3>
          <p style={{ marginTop: Spacing.S4 }}>
            Databases are automatically backed-up with full daily backups for
            the past 14 days, and binary logs recorded continuously. Full
            backups are version-specific binary backups, which when combined
            with binary logs allow for consistent recovery to a specific point
            in time (PITR).
          </p>
          <Divider marginBottom={Spacing.S24} marginTop={Spacing.S24} />
          <h3 style={{ margin: 0 }}>Restore a Backup</h3>
          <p style={{ marginTop: Spacing.S4 }}>
            <span>
              Select where you want to create a fork from. For a specific point
              in time, you can go back up to 14 days.
            </span>
          </p>
        </>
      )}
      {isValkeyDatabase && (
        <>
          <h3 style={{ margin: 0 }}>Restore a Backup</h3>
          <p style={{ marginTop: Spacing.S4 }}>
            Valkey databases automatically backup data every 12 hours and
            support configurable data persistence using Redis Database Backup
            (RDB). You can change the default 12 hours to 24 hours using
            Advanced Configuration settings.{' '}
            <a
              aria-label="Learn more - link opens in a new tab"
              data-testid="external-link"
              href="https://techdocs.akamai.com/cloud-computing/docs/aiven-manage-database#manage-backups-for-valkey-clusters"
              rel="noopener noreferrer"
              target="_blank"
            >
              Learn more.
            </a>
          </p>
          <p style={{ marginTop: Spacing.S4 }}>
            Select the restore time and region you want to create a fork for.
          </p>
        </>
      )}
      {unableToRestoreCopy && (
        <NotificationBanner
          style={{ marginTop: Spacing.S16, marginBottom: Spacing.S16 }}
          text={unableToRestoreCopy}
          type="info"
        />
      )}
      <FormProvider {...form}>
        <form>
          {!isValkeyDatabase && (
            <>
              <RadioGroup
                aria-label="type"
                name="type"
                onChange={handleOnVersionOptionChange}
                value={versionOption}
              >
                <div style={{ marginBottom: Spacing.S16 }}>
                  <RadioButton
                    data-qa-dbaas-radio="Newest"
                    disabled={disabled}
                    id="newest"
                    value="newest"
                  />
                  <label htmlFor="newest">
                    Newest full backup plus incremental
                  </label>
                </div>
                <div style={{ marginBottom: Spacing.S16 }}>
                  <RadioButton
                    data-qa-dbaas-radio="DateTime"
                    disabled={disabled}
                    id="dateTime"
                    value="dateTime"
                  />
                  <label htmlFor="dateTime">Specific date & time</label>
                </div>
              </RadioGroup>
              <h3 style={{ margin: 0 }}>Date</h3>
              <StyledDateTimeStack>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                      <Calendar
                        active={
                          field.value?.toISO() || DateTime.now().toUTC().toISO()
                        }
                        disabledFn={() =>
                          disabled ||
                          versionOption === 'newest' ||
                          isCalendarDisabled
                        }
                        max={DateTime.now().toUTC().toISO()}
                        min={database?.oldest_restore_time ?? undefined}
                        onSelectedChange={(e: CustomEvent) => {
                          const newDate = DateTime.fromISO(e.detail.selected, {
                            zone: 'utc',
                          });
                          validateDateTime(newDate, time);
                          field.onChange(newDate);
                        }}
                        selected={field.value?.toISO() || ''}
                        style={{ marginRight: Spacing.S40, width: '260px' }}
                        tz="utc"
                      />
                    </LocalizationProvider>
                  )}
                />
                <Controller
                  control={control}
                  name="time"
                  render={({ field, fieldState }) => (
                    <FormField
                      error={!!fieldState.error}
                      style={{ marginTop: 0 }}
                    >
                      <h3 style={{ margin: 0 }}>Time (UTC)</h3>
                      <TimePicker
                        dateTime={toPickerDate(field.value) ?? null}
                        disabled={
                          disabled || versionOption === 'newest' || !date
                        }
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
                          <FormError slot="error" style={{ marginLeft: 0 }}>
                            {fieldState.error.message}
                          </FormError>
                        )}
                    </FormField>
                  )}
                />
              </StyledDateTimeStack>
            </>
          )}
          {isValkeyDatabase && (
            <>
              <InputLabel
                data-qa-dropdown-label="time-select"
                data-qa-textfield-label="Time"
                htmlFor="time"
                sx={{
                  marginBottom: '8px',
                  transform: 'none',
                }}
              >
                Restore time
              </InputLabel>
              <Controller
                control={control}
                name="fork.restore_time"
                render={({ field }) => (
                  <Select
                    autocomplete
                    id="time"
                    items={availableRestoreTimeOptions}
                    onChange={(e: CustomEvent) => {
                      const restoreTime: Option = e.detail;
                      field.onChange(restoreTime.value);
                    }}
                    placeholder="Choose a backup"
                    selected={availableRestoreTimeOptions?.find(
                      (option) => option.value === field.value
                    )}
                    style={{ maxWidth: '416px' }}
                    valueFn={(restoreTime: Option) => `${restoreTime.label}`}
                  />
                )}
              />
            </>
          )}
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
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip
              disabled={!isRestoreDisabled}
              tooltipText={BACKUPS_UNABLE_TO_RESTORE_TEXT}
            >
              <Button
                data-qa-settings-button="restore"
                disabled={isRestoreDisabled}
                onClick={() => setIsRestoreDialogOpen(true)}
                variant="primary"
              >
                Restore
                {isRestoreDisabled ? (
                  <Icon icon="info-outline" size="m" />
                ) : null}
              </Button>
            </Tooltip>
          </div>
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
