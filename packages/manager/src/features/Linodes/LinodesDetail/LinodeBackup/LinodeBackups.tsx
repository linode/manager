import {
  useGrants,
  useLinodeBackupsQuery,
  useLinodeQuery,
  useProfile,
  useRegionsQuery,
  useTypeQuery,
} from '@linode/queries';
import {
  Button,
  CircleProgress,
  ErrorState,
  Paper,
  Typography,
} from '@linode/ui';
import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';

import { useLinodeDetailContext } from '../LinodesDetailContext';
import { BackupsPlaceholder } from './BackupsPlaceholder';
import { BackupTableRow } from './BackupTableRow';
import { CancelBackupsDialog } from './CancelBackupsDialog';
import { CaptureSnapshot } from './CaptureSnapshot';
import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';
import { ScheduleSettings } from './ScheduleSettings';

import type { LinodeBackup, PriceObject } from '@linode/api-v4/lib/linodes';

export const LinodeBackups = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  const navigate = useNavigate();
  const { isBareMetalInstance } = useLinodeDetailContext();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: linode } = useLinodeQuery(id);
  const { data: regions } = useRegionsQuery();
  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );
  const {
    data: backups,
    error,
    isLoading,
  } = useLinodeBackupsQuery(id, Boolean(linode?.backups.enabled));

  const doesNotHavePermission =
    Boolean(profile?.restricted) &&
    grants?.linode.find(
      (grant) => grant.id === linode?.id && grant.permissions !== 'read_write'
    ) !== undefined;

  const [isRestoreDrawerOpen, setIsRestoreDrawerOpen] = React.useState(false);

  const [isCancelBackupsDialogOpen, setIsCancelBackupsDialogOpen] =
    React.useState(false);

  const [selectedBackup, setSelectedBackup] = React.useState<LinodeBackup>();

  const linodeIsInDistributedRegion = getIsDistributedRegion(
    regions ?? [],
    linode?.region ?? ''
  );

  const handleDeploy = (backup: LinodeBackup) => {
    navigate({
      to: '/linodes/create/backups',
      search: (prev) => ({
        ...prev,
        backupID: backup.id,
        linodeID: linode?.id,
        typeID: linode?.type,
      }),
    });
  };

  const onRestoreBackup = (backup: LinodeBackup) => {
    setIsRestoreDrawerOpen(true);
    setSelectedBackup(backup);
  };

  const backupsMonthlyPrice: PriceObject['monthly'] | undefined =
    getMonthlyBackupsPrice({
      region: linode?.region,
      type,
    });

  if (!linode?.backups.enabled) {
    return (
      <BackupsPlaceholder
        backupsMonthlyPrice={backupsMonthlyPrice}
        disabled={doesNotHavePermission}
        linodeId={id}
        linodeIsInDistributedRegion={linodeIsInDistributedRegion}
      />
    );
  }

  if (isBareMetalInstance) {
    return null;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an issue retrieving your backups." />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  const hasBackups =
    backups !== undefined &&
    (backups?.automatic.length > 0 ||
      Boolean(backups?.snapshot.current) ||
      Boolean(backups?.snapshot.in_progress));

  return (
    <Stack spacing={2}>
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
