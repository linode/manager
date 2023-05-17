import * as React from 'react';
import { Table } from 'src/components/Table';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import LinodePermissionsError from '../LinodePermissionsError';
import BackupsPlaceholder from './BackupsPlaceholder';
import BackupTableRow from './BackupTableRow';
import { Box, Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { useHistory, useParams } from 'react-router-dom';
import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';
import { useTypeQuery } from 'src/queries/types';
import { makeStyles } from 'tss-react/mui';
import { CancelBackupsDialog } from './CancelBackupsDialog';
import { CircleProgress } from 'src/components/CircleProgress';
import { ScheduleSettings } from './ScheduleSettings';
import { useGrants, useProfile } from 'src/queries/profile';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useLinodeBackupsQuery } from 'src/queries/linodes/backups';
import { CaptureSnapshot } from './CaptureSnapshot';

const useStyles = makeStyles()((theme: Theme) => ({
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
}));

export const LinodeBackups = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  const history = useHistory();
  const { classes } = useStyles();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: linode } = useLinodeQuery(id);
  const { data: type } = useTypeQuery(linode?.type ?? '', linode !== undefined);
  const { data: backups, error, isLoading } = useLinodeBackupsQuery(
    id,
    Boolean(linode?.backups.enabled)
  );

  const doesNotHavePermission =
    Boolean(profile?.restricted) &&
    grants?.linode.find(
      (grant) => grant.id === linode?.id && grant.permissions !== 'read_write'
    ) !== undefined;

  const [isRestoreDrawerOpen, setIsRestoreDrawerOpen] = React.useState(false);

  const [
    isCancelBackupsDialogOpen,
    setIsCancelBackupsDialogOpen,
  ] = React.useState(false);

  const [selectedBackup, setSelectedBackup] = React.useState<LinodeBackup>();

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
      <CaptureSnapshot linodeId={id} isReadOnly={doesNotHavePermission} />
      <ScheduleSettings linodeId={id} isReadOnly={doesNotHavePermission} />
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
