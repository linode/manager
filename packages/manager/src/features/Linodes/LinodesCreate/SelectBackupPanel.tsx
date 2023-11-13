import {
  Linode,
  LinodeBackup,
  LinodeBackupsResponse,
} from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';
import { formatDate } from 'src/utilities/formatDate';

export const aggregateBackups = (
  backups: LinodeBackupsResponse
): LinodeBackup[] => {
  const manualSnapshot =
    backups?.snapshot.in_progress?.status === 'needsPostProcessing'
      ? backups?.snapshot.in_progress
      : backups?.snapshot.current;
  return (
    backups &&
    [...backups.automatic!, manualSnapshot!].filter((b) => Boolean(b))
  );
};

export interface LinodeWithBackups extends Linode {
  currentBackups: LinodeBackupsResponse;
}

interface BackupInfo {
  details: string;
  title: string;
}

interface Props {
  error?: string;
  handleChangeBackup: (id: number) => void;
  handleChangeBackupInfo: (info: BackupInfo) => void;
  loading: boolean;
  selectedBackupID?: number;
  selectedLinodeID?: number;
  selectedLinodeWithBackups?: LinodeWithBackups;
}

export const SelectBackupPanel = (props: Props) => {
  const { data: profile } = useProfile();
  const {
    error,
    handleChangeBackup,
    handleChangeBackupInfo,
    loading,
    selectedBackupID,
    selectedLinodeID,
    selectedLinodeWithBackups,
  } = props;

  const aggregatedBackups = selectedLinodeWithBackups
    ? aggregateBackups(selectedLinodeWithBackups.currentBackups)
    : [];

  const getBackupInfo = (backup: LinodeBackup) => {
    const heading = backup.label
      ? backup.label
      : backup.type === 'auto'
      ? 'Automatic'
      : 'Snapshot';
    const subheading = formatDate(backup.created, {
      timezone: profile?.timezone,
    });
    const infoName =
      heading === 'Automatic'
        ? 'From automatic backup'
        : `From backup ${heading}`;

    return {
      heading,
      infoName,
      subheading,
    };
  };

  const renderCard = (backup: LinodeBackup) => {
    const backupInfo_ = getBackupInfo(backup);

    return (
      <SelectionCard
        onClick={() => {
          const backupInfo = {
            details: backupInfo_.subheading,
            title: backupInfo_.infoName,
          };
          handleChangeBackup(backup.id);
          handleChangeBackupInfo(backupInfo);
        }}
        checked={backup.id === Number(selectedBackupID)}
        heading={backupInfo_.heading}
        key={backup.id}
        subheadings={[backupInfo_.subheading]}
      />
    );
  };

  return (
    <StyledRootPaper>
      {error && <Notice text={error} variant="error" />}
      <Typography variant="h2">Select Backup</Typography>
      <StyledWrapperGrid alignItems="center" container spacing={2}>
        {loading ? (
          <CircleProgress />
        ) : selectedLinodeID ? (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <React.Fragment>
            {aggregatedBackups.length !== 0 ? (
              <StyledTypography component="div">
                <Grid container spacing={2}>
                  {aggregatedBackups.map((backup) => {
                    return renderCard(backup);
                  })}
                </Grid>
              </StyledTypography>
            ) : (
              <Typography variant="body1">No backup available</Typography>
            )}
          </React.Fragment>
        ) : (
          <Typography variant="body1">First, select a Linode</Typography>
        )}
      </StyledWrapperGrid>
    </StyledRootPaper>
  );
};

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})<{ component: string }>(({ theme }) => ({
  padding: `${theme.spacing(2)} 0 0`,
  width: '100%',
}));

const StyledRootPaper = styled(Paper, { label: 'StyledRootPaper' })(
  ({ theme }) => ({
    backgroundColor: theme.color.white,
    flexGrow: 1,
    marginTop: theme.spacing(3),
    width: '100%',
  })
);

const StyledWrapperGrid = styled(Grid, { label: 'StyledWrapperGrid' })(
  ({ theme }) => ({
    minHeight: 120,
    padding: theme.spacing(1),
  })
);
