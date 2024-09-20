import { FormControl } from '@mui/material';
import Grid from '@mui/material/Grid';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import Select from 'src/components/EnhancedSelect/Select';
import { Paper } from 'src/components/Paper';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import {
  StyledDateCalendar,
  StyledTypography,
} from 'src/features/Databases/DatabaseDetail/DatabaseBackups/DatabaseBackups.style';
import RestoreLegacyFromBackupDialog from 'src/features/Databases/DatabaseDetail/DatabaseBackups/RestoreLegacyFromBackupDialog';
import RestoreNewFromBackupDialog from 'src/features/Databases/DatabaseDetail/DatabaseBackups/RestoreNewFromBackupDialog';
import { isOutsideBackupTimeframe } from 'src/features/Databases/utilities';
import { useOrder } from 'src/hooks/useOrder';
import {
  useDatabaseBackupsQuery,
  useDatabaseQuery,
} from 'src/queries/databases/databases';

import { BackupTableRow } from './DatabaseBackupTableRow';

import type { DatabaseBackup, Engine } from '@linode/api-v4/lib/databases';

interface Props {
  disabled?: boolean;
}

export const DatabaseBackups = (props: Props) => {
  const { disabled } = props;
  const { databaseId, engine } = useParams<{
    databaseId: string;
    engine: Engine;
  }>();

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [idOfBackupToRestore, setIdOfBackupToRestore] = React.useState<
    number | undefined
  >();

  const [selectedDate, setSelectedDate] = React.useState<DateTime | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<DateTime | null>(
    DateTime.now().set({ hour: 1, minute: 0, second: 0 })
  );
  const [
    selectedRestoreTime,
    setSelectedRestoreTime,
  ] = React.useState<string>();

  const id = Number(databaseId);

  const {
    data: database,
    error: databaseError,
    isLoading: isDatabaseLoading,
  } = useDatabaseQuery(engine, id);

  const isNewDatabase = database?.platform === 'rdbms-default';

  const {
    data: backups,
    error: backupsError,
    isLoading: isBackupsLoading,
  } = useDatabaseBackupsQuery(engine, id);

  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'created',
  });

  const onRestoreLegacyDatabase = (id: number) => {
    setIdOfBackupToRestore(id);
    setIsRestoreDialogOpen(true);
  };

  const backupToRestoreLegacy = backups?.data.find(
    (backup) => backup.id === idOfBackupToRestore
  );

  const sorter = (a: DatabaseBackup, b: DatabaseBackup) => {
    if (order === 'asc') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    }
    return new Date(a.created).getTime() - new Date(b.created).getTime();
  };

  const renderTableBody = () => {
    if (databaseError) {
      return <TableRowError colSpan={3} message={databaseError[0].reason} />;
    }
    if (backupsError) {
      return <TableRowError colSpan={3} message={backupsError[0].reason} />;
    }
    if (isDatabaseLoading || isBackupsLoading) {
      return <TableRowLoading columns={3} />;
    }
    if (backups?.results === 0) {
      return <TableRowEmpty colSpan={3} message="No backups to display." />;
    }
    if (backups) {
      return backups.data
        .sort(sorter)
        .map((backup) => (
          <BackupTableRow
            backup={backup}
            disabled={disabled}
            key={backup.id}
            onRestore={onRestoreLegacyDatabase}
          />
        ));
    }
    return null;
  };

  const oldestBackup = database?.oldest_restore_time
    ? DateTime.fromISO(database.oldest_restore_time)
    : null;

  const onRestoreNewDatabase = (selectedDate: DateTime | null) => {
    const day = selectedDate?.toISODate();
    const time = selectedTime?.toISOTime({ includeOffset: false });
    const selectedDateTime = `${day}T${time}Z`;

    const selectedTimestamp = new Date(selectedDateTime).toISOString();

    setSelectedRestoreTime(selectedTimestamp);
    setIsRestoreDialogOpen(true);
  };

  return isNewDatabase ? (
    <Paper style={{ marginTop: 16 }}>
      <Typography variant="h2">Summary</Typography>
      <StyledTypography>
        Databases are automatically backed-up with full daily backups for the
        past 10 days, and binary logs recorded continuously. Full backups are
        version-specific binary backups, which when combined with binary
        logs allow for consistent recovery to a specific point in time (PITR).
      </StyledTypography>
      {/* TODO: Uncomment when the all data is available (Number of Full Backups, Newest Full Backup, Oldest Full Backup) */}
      {/* <Hidden xlDown={true} xlUp={true}>
        <Grid alignItems="stretch" container mt={2} spacing={1}>
          <Grid item md={4} xs={12}>
            <StyledBox>
              <Typography variant="h2">Number of Full Backups</Typography>
              <Typography component="span" variant="h1">
                {backups?.data.length}
              </Typography>
            </StyledBox>
          </Grid>
          <Grid item md={4} xs={12}>
            <StyledBox>
              <Typography variant="h2">Newest Full Backup</Typography>
              <Typography variant="subtitle2">{newestBackup} (UTC)</Typography>
            </StyledBox>
          </Grid>
          <Grid item md={4} xs={12}>
            <StyledBox>
              <Typography variant="h2">Oldest Full Backup</Typography>
              <Typography variant="subtitle2">{oldestBackup} (UTC)</Typography>
            </StyledBox>
          </Grid>
        </Grid>
      </Hidden> */}
      <Divider spacingBottom={25} spacingTop={25} />
      <Typography variant="h2">Restore a Backup</Typography>
      <StyledTypography>
        Select a date and time within the last 10 days you want to create a fork
        from.
      </StyledTypography>
      <Grid container justifyContent="flex-start" mt={2}>
        <Grid item lg={3} md={4} xs={12}>
          <Typography variant="h3">Date</Typography>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <StyledDateCalendar
              shouldDisableDate={(date) =>
                isOutsideBackupTimeframe(date, oldestBackup)
              }
              onChange={(newDate) => setSelectedDate(newDate)}
              value={selectedDate}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item lg={3} md={4} xs={12}>
          <Typography variant="h3">Time (UTC)</Typography>
          <FormControl style={{ marginTop: 0 }}>
            {/* TODO: Replace Time Select to the own custom date-time picker component when it's ready */}
            <Select
              defaultValue={hourSelectionMap.find(
                (option) => option.value === selectedTime?.hour
              )}
              onChange={(time) =>
                setSelectedTime(
                  DateTime.now().set({ hour: time.value, minute: 0 })
                )
              }
              textFieldProps={{
                dataAttrs: {
                  'data-qa-time-select': true,
                },
              }}
              value={hourSelectionMap.find(
                (thisOption) => thisOption.value === selectedTime?.hour
              )}
              disabled={!selectedDate}
              isClearable={false}
              name="Time"
              noMarginTop
              options={hourSelectionMap}
              placeholder="Choose a time"
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="flex-end">
          <Button
            buttonType="primary"
            data-qa-settings-button="restore"
            disabled={!selectedDate}
            onClick={() => onRestoreNewDatabase(selectedDate)}
          >
            Restore
          </Button>
        </Box>
      </Grid>
      {database && selectedRestoreTime ? (
        <RestoreNewFromBackupDialog
          database={database}
          onClose={() => setIsRestoreDialogOpen(false)}
          open={isRestoreDialogOpen}
          restoreTime={selectedRestoreTime}
        />
      ) : null}
    </Paper>
  ) : (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'created'}
              direction={order}
              handleClick={handleOrderChange}
              label="created"
              style={{ width: 155 }}
            >
              Date Created
            </TableSortCell>
            <TableCell></TableCell>
            <TableCell style={{ width: 100 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
      <Paper style={{ marginTop: 16 }}>
        <Typography variant="h3">Backup Schedule</Typography>
        <Typography style={{ lineHeight: '20px', marginTop: 4 }}>
          A backup of this database is created every 24 hours and each backup is
          retained for 7 days.
        </Typography>
      </Paper>
      {database && backupToRestoreLegacy ? (
        <RestoreLegacyFromBackupDialog
          backup={backupToRestoreLegacy}
          database={database}
          onClose={() => setIsRestoreDialogOpen(false)}
          open={isRestoreDialogOpen}
        />
      ) : null}
    </>
  );
};

const hourSelectionMap = [
  { label: '00:00', value: 0 },
  { label: '01:00', value: 1 },
  { label: '02:00', value: 2 },
  { label: '03:00', value: 3 },
  { label: '04:00', value: 4 },
  { label: '05:00', value: 5 },
  { label: '06:00', value: 6 },
  { label: '07:00', value: 7 },
  { label: '08:00', value: 8 },
  { label: '09:00', value: 9 },
  { label: '10:00', value: 10 },
  { label: '11:00', value: 11 },
  { label: '12:00', value: 12 },
  { label: '13:00', value: 13 },
  { label: '14:00', value: 14 },
  { label: '15:00', value: 15 },
  { label: '16:00', value: 16 },
  { label: '17:00', value: 17 },
  { label: '18:00', value: 18 },
  { label: '19:00', value: 19 },
  { label: '20:00', value: 20 },
  { label: '21:00', value: 21 },
  { label: '22:00', value: 22 },
  { label: '23:00', value: 23 },
];

export default DatabaseBackups;
