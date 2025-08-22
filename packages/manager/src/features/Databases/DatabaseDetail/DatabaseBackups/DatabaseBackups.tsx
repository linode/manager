import { useDatabaseQuery } from '@linode/queries';
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
import { GridLegacy } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { useParams } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import * as React from 'react';

import {
  StyledDateCalendar,
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
import DatabaseBackupsDialog from './DatabaseBackupsDialog';
import DatabaseBackupsLegacy from './legacy/DatabaseBackupsLegacy';

import type { TimeValidationError } from '@mui/x-date-pickers';

export interface TimeOption {
  label: string;
  value: number;
}

export type VersionOption = 'dateTime' | 'newest';

export const DatabaseBackups = () => {
  const { disabled } = useDatabaseDetailContext();
  const { databaseId, engine } = useParams({
    from: '/databases/$engine/$databaseId',
  });
  const { isDatabasesV2GA } = useIsDatabasesEnabled();

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<DateTime | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<DateTime | null>(null);
  const [versionOption, setVersionOption] = React.useState<VersionOption>(
    isDatabasesV2GA ? 'newest' : 'dateTime'
  );
  const [timePickerError, setTimePickerError] = React.useState<string>('');

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

  const onRestoreDatabase = () => {
    setIsRestoreDialogOpen(true);
  };

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
        setTimePickerError('');
      }
    }
  };

  const handleOnError = (error: TimeValidationError) => {
    if (error) {
      switch (error) {
        case 'maxTime':
          setTimePickerError(BACKUPS_MAX_TIME_EXCEEDED_VALIDATON_TEXT);
          break;
        case 'minTime':
          setTimePickerError(BACKUPS_MIN_TIME_EXCEEDED_VALIDATON_TEXT);
          break;
        case 'invalidDate':
          setSelectedTime(null);
          setTimePickerError(BACKUPS_INVALID_TIME_VALIDATON_TEXT);
      }
    }
  };

  /** Stores changes to the year, month, and day of the DateTime object provided by the calendar */
  const handleDateChange = (newDate: DateTime) => {
    validateDateTime(newDate, selectedTime);
    setSelectedDate(newDate);
  };

  /** Stores changes to the hours, minutes, and seconds of the DateTime object provided by the time picker */
  const handleTimeChange = (newTime: DateTime | null) => {
    validateDateTime(selectedDate, newTime);
    setSelectedTime(newTime);
  };

  const configureMinTime = () => {
    const canApplyMinTime = !!oldestBackup && !!selectedDate;
    const isOnMinDate = selectedDate?.day === oldestBackup?.day;
    return canApplyMinTime && isOnMinDate ? oldestBackup : undefined;
  };

  const configureMaxTime = () => {
    const today = DateTime.utc();
    const isOnMaxDate = today.day === selectedDate?.day;
    return isOnMaxDate ? today : undefined;
  };

  const handleOnVersionOptionChange = (_: any, value: VersionOption) => {
    setVersionOption(value);
    setSelectedDate(null);
    // Resetting state used for time picker
    setSelectedTime(null);
    setTimePickerError('');
  };

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
        <GridLegacy
          container
          sx={{
            justifyContent: 'flex-start',
            mt: 2,
          }}
        >
          <GridLegacy item lg={3} md={4} xs={12}>
            <Typography variant="h3">Date</Typography>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
              <StyledDateCalendar
                disabled={disabled || versionOption === 'newest'}
                onChange={handleDateChange}
                shouldDisableDate={(date) =>
                  isDateOutsideBackup(date, oldestBackup?.startOf('day'))
                }
                value={selectedDate}
              />
            </LocalizationProvider>
          </GridLegacy>
          <GridLegacy item lg={3} md={4} xs={12}>
            <FormControl style={{ marginTop: 0 }}>
              <Typography variant="h3">Time (UTC)</Typography>
              <TimePicker
                disabled={
                  disabled || versionOption === 'newest' || !selectedDate
                }
                errorText={
                  versionOption === 'dateTime' && selectedDate
                    ? timePickerError
                    : undefined
                }
                format="HH:mm:ss"
                label=""
                maxTime={configureMaxTime()}
                minTime={configureMinTime()}
                onChange={handleTimeChange}
                onError={handleOnError}
                sx={{
                  width: '220px',
                }}
                timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                value={selectedTime}
                views={['hours', 'minutes', 'seconds']}
              />
            </FormControl>
          </GridLegacy>
        </GridLegacy>
        <GridLegacy item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              buttonType="primary"
              data-qa-settings-button="restore"
              disabled={
                versionOption === 'dateTime' &&
                (!selectedDate || !selectedTime || !!timePickerError)
              }
              onClick={onRestoreDatabase}
            >
              Restore
            </Button>
          </Box>
        </GridLegacy>
        {database && (
          <DatabaseBackupsDialog
            database={database}
            onClose={() => setIsRestoreDialogOpen(false)}
            open={isRestoreDialogOpen}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        )}
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
