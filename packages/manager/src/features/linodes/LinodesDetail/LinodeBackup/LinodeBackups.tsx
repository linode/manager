import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import Paper from 'src/components/core/Paper';
import { Theme } from '@mui/material/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Select from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TextField from 'src/components/TextField';
import { resetEventsPolling } from 'src/eventsPolling';
import { getErrorMap } from 'src/utilities/errorUtils';
import getUserTimezone from 'src/utilities/getUserTimezone';
import LinodePermissionsError from '../LinodePermissionsError';
import BackupsPlaceholder from './BackupsPlaceholder';
import BackupTableRow from './BackupTableRow';
import { CaptureSnapshotConfirmationDialog } from './CaptureSnapshotConfirmationDialog';
import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';
import {
  useLinodeBackupSnapshotMutation,
  useLinodeBackupsQuery,
} from 'src/queries/linodes/backups';
import { useFormik } from 'formik';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';
import { useGrants, useProfile } from 'src/queries/profile';
import { initWindows } from 'src/utilities/initWindows';
import Table from 'src/components/Table';
import { useTypeQuery } from 'src/queries/types';
import { makeStyles } from '@mui/styles';
import { CancelBackupsDialog } from './CancelBackupsDialog';
import { CircleProgress } from 'src/components/CircleProgress';
import TableRowEmptyState from 'src/components/TableRowEmptyState';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginBottom: theme.spacing(2),
  },
  subTitle: {
    marginBottom: theme.spacing(1),
  },
  snapshotFormControl: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    '& > div': {
      width: 'auto',
      marginRight: theme.spacing(2),
    },
    '& button': {
      marginTop: theme.spacing(4),
    },
  },
  scheduleAction: {
    padding: 0,
    '& button': {
      marginLeft: 0,
      marginTop: theme.spacing(2),
    },
  },
  chooseDay: {
    marginRight: theme.spacing(2),
    minWidth: 150,
    '& .react-select__menu-list': {
      maxHeight: 'none',
    },
  },
  cancelButton: {
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  cancelCopy: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  snapshotNameField: {
    minWidth: 275,
  },
}));

export const LinodeBackups = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  const history = useHistory();
  const classes = useStyles();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const doesNotHavePermission =
    Boolean(profile?.restricted) &&
    grants?.linode.find(
      (grant) => grant.id === linode?.id && grant.permissions !== 'read_write'
    ) !== undefined;

  const { data: linode } = useLinodeQuery(id);
  const { data: type } = useTypeQuery(linode?.type ?? '', linode !== undefined);
  const { data: backups, error, isLoading } = useLinodeBackupsQuery(
    id,
    Boolean(linode?.backups.enabled)
  );

  const {
    mutateAsync: updateLinode,
    error: updateLinodeError,
    isLoading: isUpdating,
  } = useLinodeUpdateMutation(id);

  const {
    mutateAsync: takeSnapshot,
    error: snapshotError,
    isLoading: isSnapshotLoading,
  } = useLinodeBackupSnapshotMutation(id);

  const { enqueueSnackbar } = useSnackbar();

  const [isRestoreDrawerOpen, setIsRestoreDrawerOpen] = React.useState(false);
  const [
    isSnapshotConfirmationDialogOpen,
    setIsSnapshotConfirmationDialogOpen,
  ] = React.useState(false);
  const [
    isCancelBackupsDialogOpen,
    setIsCancelBackupsDialogOpen,
  ] = React.useState(false);

  const [selectedBackup, setSelectedBackup] = React.useState<LinodeBackup>();

  const snapshotForm = useFormik({
    initialValues: { label: '' },
    async onSubmit(values, formikHelpers) {
      await takeSnapshot(values);
      enqueueSnackbar('Starting to capture snapshot', {
        variant: 'info',
      });
      setIsSnapshotConfirmationDialogOpen(false);
      formikHelpers.resetForm();
      resetEventsPolling();
    },
  });

  const settingsForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      day: linode?.backups.schedule.day,
      window: linode?.backups.schedule.window,
    },
    async onSubmit(values) {
      await updateLinode({
        backups: {
          schedule: values,
        },
      });

      enqueueSnackbar('Backup settings saved', {
        variant: 'success',
      });
    },
  });

  const days = [
    ['Choose a day', 'Scheduling'],
    ['Sunday', 'Sunday'],
    ['Monday', 'Monday'],
    ['Tuesday', 'Tuesday'],
    ['Wednesday', 'Wednesday'],
    ['Thursday', 'Thursday'],
    ['Friday', 'Friday'],
    ['Saturday', 'Saturday'],
  ];

  const handleDeploy = (backup: LinodeBackup) => {
    history.push(
      '/linodes/create' +
        `?type=Backups&backupID=${backup.id}&linodeID=${linode?.id}&typeID=${linode?.type}`
    );
  };

  const onRestoreBackup = (backup: LinodeBackup) => {
    setIsRestoreDrawerOpen(true);
    setSelectedBackup(backup);
  };

  const windows = initWindows(getUserTimezone(profile?.timezone), true);

  const windowOptions = windows.map((window) => {
    const label = window[0];
    return { label, value: window[1] };
  });

  const dayOptions = days.map((day: string[]) => {
    const label = day[0];
    return { label, value: day[1] };
  });

  const hasErrorFor = getErrorMap(['label'], snapshotError);

  if (error) {
    return (
      <ErrorState errorText="There was an issue retrieving your backups." />
    );
  }

  const backupsMonthlyPrice = type?.addons?.backups?.price?.monthly ?? 0;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!linode?.backups.enabled) {
    return (
      <BackupsPlaceholder
        linodeId={id}
        backupsMonthlyPrice={backupsMonthlyPrice}
        disabled={doesNotHavePermission}
      />
    );
  }

  const hasBackups =
    backups !== undefined &&
    (backups?.automatic.length > 0 ||
      Boolean(backups?.snapshot.current) ||
      Boolean(backups?.snapshot.in_progress));

  return (
    <React.Fragment>
      {doesNotHavePermission && <LinodePermissionsError />}
      <Paper className={classes.paper} style={{ padding: 0 }}>
        <Table aria-label="List of Backups">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Disks</TableCell>
              <TableCell>Space Required</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {hasBackups ? (
              <>
                {backups?.automatic.map((backup: LinodeBackup, idx: number) => (
                  <BackupTableRow
                    key={idx}
                    backup={backup}
                    disabled={doesNotHavePermission}
                    handleDeploy={() => handleDeploy(backup)}
                    handleRestore={() => onRestoreBackup(backup)}
                  />
                ))}
                {Boolean(backups?.snapshot.current) && (
                  <BackupTableRow
                    backup={backups!.snapshot.current!}
                    disabled={doesNotHavePermission}
                    handleDeploy={() =>
                      handleDeploy(backups!.snapshot.current!)
                    }
                    handleRestore={() =>
                      onRestoreBackup(backups!.snapshot.current!)
                    }
                  />
                )}
                {Boolean(backups?.snapshot.in_progress) && (
                  <BackupTableRow
                    backup={backups!.snapshot.in_progress!}
                    disabled={doesNotHavePermission}
                    handleDeploy={() =>
                      handleDeploy(backups!.snapshot.in_progress!)
                    }
                    handleRestore={() =>
                      onRestoreBackup(backups!.snapshot.in_progress!)
                    }
                  />
                )}
              </>
            ) : (
              <TableRowEmptyState
                colSpan={7}
                message="Automatic and manual backups will be listed here"
              />
            )}
          </TableBody>
        </Table>
      </Paper>
      <Paper className={classes.paper}>
        <Typography
          variant="h2"
          className={classes.subTitle}
          data-qa-manual-heading
        >
          Manual Snapshot
        </Typography>
        <Typography variant="body1" data-qa-manual-desc>
          You can make a manual backup of your Linode by taking a snapshot.
          Creating the manual snapshot can take several minutes, depending on
          the size of your Linode and the amount of data you have stored on it.
          The manual snapshot will not be overwritten by automatic backups.
        </Typography>
        <FormControl className={classes.snapshotFormControl}>
          {hasErrorFor.none && (
            <Notice spacingBottom={8} error>
              {hasErrorFor.none}
            </Notice>
          )}
          <TextField
            errorText={hasErrorFor.label}
            label="Name Snapshot"
            name="label"
            value={snapshotForm.values.label}
            onChange={snapshotForm.handleChange}
            data-qa-manual-name
            className={classes.snapshotNameField}
          />
          <Button
            buttonType="primary"
            onClick={() => setIsSnapshotConfirmationDialogOpen(true)}
            data-qa-snapshot-button
            disabled={snapshotForm.values.label === '' || doesNotHavePermission}
          >
            Take Snapshot
          </Button>
        </FormControl>
      </Paper>
      <CaptureSnapshotConfirmationDialog
        open={isSnapshotConfirmationDialogOpen}
        onClose={() => setIsSnapshotConfirmationDialogOpen(false)}
        onSnapshot={() => snapshotForm.handleSubmit()}
        loading={isSnapshotLoading}
      />
      <Paper className={classes.paper}>
        <form onSubmit={settingsForm.handleSubmit}>
          <Typography
            variant="h2"
            className={classes.subTitle}
            data-qa-settings-heading
          >
            Settings
          </Typography>
          <Typography variant="body1" data-qa-settings-desc>
            Configure when automatic backups are initiated. The Linode Backup
            Service will generate a backup between the selected hours every day,
            and will overwrite the previous daily backup. The selected day is
            when the backup is promoted to the weekly slot. Up to two weekly
            backups are saved.
          </Typography>
          {Boolean(updateLinodeError) && (
            <Notice error spacingTop={16} spacingBottom={0}>
              {updateLinodeError?.[0].reason}
            </Notice>
          )}
          <FormControl className={classes.chooseDay}>
            <Select
              textFieldProps={{
                dataAttrs: {
                  'data-qa-weekday-select': true,
                },
              }}
              options={dayOptions}
              onChange={(item) => settingsForm.setFieldValue('day', item.value)}
              value={dayOptions.find(
                (item) => item.value === settingsForm.values.day
              )}
              label="Day of Week"
              placeholder="Choose a day"
              isClearable={false}
              name="Day of Week"
              noMarginTop
            />
          </FormControl>
          <FormControl>
            <Select
              textFieldProps={{
                dataAttrs: {
                  'data-qa-time-select': true,
                },
              }}
              options={windowOptions}
              onChange={(item) =>
                settingsForm.setFieldValue('window', item.value)
              }
              value={windowOptions.find(
                (item) => item.value === settingsForm.values.window
              )}
              label="Time of Day"
              placeholder="Choose a time"
              isClearable={false}
              name="Time of Day"
              noMarginTop
            />
            <FormHelperText sx={{ marginLeft: 0 }}>
              Time displayed in{' '}
              {getUserTimezone(profile?.timezone).replace('_', ' ')}
            </FormHelperText>
          </FormControl>
          <ActionsPanel className={classes.scheduleAction}>
            <Button
              buttonType="primary"
              type="submit"
              disabled={doesNotHavePermission || !settingsForm.dirty}
              loading={isUpdating}
              data-qa-schedule
            >
              Save Schedule
            </Button>
          </ActionsPanel>
        </form>
      </Paper>
      <Button
        buttonType="outlined"
        className={classes.cancelButton}
        disabled={doesNotHavePermission}
        onClick={() => setIsCancelBackupsDialogOpen(true)}
        data-qa-cancel
      >
        Cancel Backups
      </Button>
      <Typography
        className={classes.cancelCopy}
        variant="body1"
        data-qa-cancel-desc
      >
        Please note that when you cancel backups associated with this Linode,
        this will remove all existing backups.
      </Typography>
      <RestoreToLinodeDrawer
        open={isRestoreDrawerOpen}
        linodeId={id}
        backup={selectedBackup}
        onClose={() => setIsRestoreDrawerOpen(false)}
      />
      <CancelBackupsDialog
        isOpen={isCancelBackupsDialogOpen}
        onClose={() => setIsCancelBackupsDialogOpen(false)}
        linodeId={id}
      />
    </React.Fragment>
  );
};

export default LinodeBackups;
