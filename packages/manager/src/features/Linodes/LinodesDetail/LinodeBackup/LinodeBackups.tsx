import { LinodeBackup, PriceObject } from '@linode/api-v4/lib/linodes';
import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Paper } from 'src/components/Paper';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Typography } from 'src/components/Typography';
import { useLinodeBackupsQuery } from 'src/queries/linodes/backups';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useGrants, useProfile } from 'src/queries/profile';
import { useTypeQuery } from 'src/queries/types';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';

import { LinodePermissionsError } from '../LinodePermissionsError';
import { BackupTableRow } from './BackupTableRow';
import { BackupsPlaceholder } from './BackupsPlaceholder';
import { CancelBackupsDialog } from './CancelBackupsDialog';
import { CaptureSnapshot } from './CaptureSnapshot';
import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';
import { ScheduleSettings } from './ScheduleSettings';

export const LinodeBackups = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  const history = useHistory();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: linode } = useLinodeQuery(id);
  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );
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

  const backupsMonthlyPrice:
    | PriceObject['monthly']
    | undefined = getMonthlyBackupsPrice({
    region: linode?.region,
    type,
  });

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!linode?.backups.enabled) {
    return (
      <BackupsPlaceholder
        backupsMonthlyPrice={backupsMonthlyPrice}
        disabled={doesNotHavePermission}
        linodeId={id}
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
                    backup={backup}
                    disabled={doesNotHavePermission}
                    handleDeploy={() => handleDeploy(backup)}
                    handleRestore={() => onRestoreBackup(backup)}
                    key={idx}
                  />
                ))}
                {Boolean(backups?.snapshot.current) && (
                  <BackupTableRow
                    handleDeploy={() =>
                      handleDeploy(backups!.snapshot.current!)
                    }
                    handleRestore={() =>
                      onRestoreBackup(backups!.snapshot.current!)
                    }
                    backup={backups!.snapshot.current!}
                    disabled={doesNotHavePermission}
                  />
                )}
                {Boolean(backups?.snapshot.in_progress) && (
                  <BackupTableRow
                    handleDeploy={() =>
                      handleDeploy(backups!.snapshot.in_progress!)
                    }
                    handleRestore={() =>
                      onRestoreBackup(backups!.snapshot.in_progress!)
                    }
                    backup={backups!.snapshot.in_progress!}
                    disabled={doesNotHavePermission}
                  />
                )}
              </>
            ) : (
              <TableRowEmpty
                colSpan={7}
                message="Automatic and manual backups will be listed here"
              />
            )}
          </TableBody>
        </Table>
      </Paper>
      <CaptureSnapshot isReadOnly={doesNotHavePermission} linodeId={id} />
      <ScheduleSettings isReadOnly={doesNotHavePermission} linodeId={id} />
      <Box>
        <StyledCancelButton
          buttonType="outlined"
          data-qa-cancel
          disabled={doesNotHavePermission}
          onClick={() => setIsCancelBackupsDialogOpen(true)}
        >
          Cancel Backups
        </StyledCancelButton>
        <StyledCancelTypography data-qa-cancel-desc variant="body1">
          Please note that when you cancel backups associated with this Linode,
          this will remove all existing backups.
        </StyledCancelTypography>
      </Box>
      <RestoreToLinodeDrawer
        backup={selectedBackup}
        linodeId={id}
        onClose={() => setIsRestoreDrawerOpen(false)}
        open={isRestoreDrawerOpen}
      />
      <CancelBackupsDialog
        isOpen={isCancelBackupsDialogOpen}
        linodeId={id}
        onClose={() => setIsCancelBackupsDialogOpen(false)}
      />
    </Stack>
  );
};

const StyledCancelButton = styled(Button, { label: 'StyledCancelButton' })(
  ({ theme }) => ({
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  })
);

const StyledCancelTypography = styled(Typography, {
  label: 'StyledCancelTypography',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
}));

export default LinodeBackups;
