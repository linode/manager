import * as React from 'react';
import Table from 'src/components/Table';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TextField from 'src/components/TextField';
import LinodePermissionsError from '../LinodePermissionsError';
import BackupsPlaceholder from './BackupsPlaceholder';
import BackupTableRow from './BackupTableRow';
import { Box, Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { resetEventsPolling } from 'src/eventsPolling';
import { getErrorMap } from 'src/utilities/errorUtils';
import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { useSnackbar } from 'notistack';
import { useHistory, useParams } from 'react-router-dom';
import { CaptureSnapshotConfirmationDialog } from './CaptureSnapshotConfirmationDialog';
import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';
import { useTypeQuery } from 'src/queries/types';
import { makeStyles } from '@mui/styles';
import { CancelBackupsDialog } from './CancelBackupsDialog';
import { CircleProgress } from 'src/components/CircleProgress';
import { ScheduleSettings } from './ScheduleSettings';
import { useGrants, useProfile } from 'src/queries/profile';
import { useFormik } from 'formik';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  useLinodeBackupSnapshotMutation,
  useLinodeBackupsQuery,
} from 'src/queries/linodes/backups';

const useStyles = makeStyles((theme: Theme) => ({
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
    <Stack spacing={2}>
      {doesNotHavePermission && <LinodePermissionsError />}
      <Paper style={{ padding: 0 }}>
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
      <Paper>
        <Typography variant="h2" data-qa-manual-heading>
          Manual Snapshot
        </Typography>
        <Typography variant="body1" data-qa-manual-desc marginTop={1}>
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
      <ScheduleSettings linodeId={id} />
      <Box>
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
      </Box>
      <CaptureSnapshotConfirmationDialog
        open={isSnapshotConfirmationDialogOpen}
        onClose={() => setIsSnapshotConfirmationDialogOpen(false)}
        onSnapshot={() => snapshotForm.handleSubmit()}
        loading={isSnapshotLoading}
      />
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
    </Stack>
  );
};

export default LinodeBackups;
