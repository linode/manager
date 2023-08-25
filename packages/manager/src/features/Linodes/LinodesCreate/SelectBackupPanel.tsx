import {
  Linode,
  LinodeBackup,
  LinodeBackupsResponse,
} from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { RenderGuard, RenderGuardProps } from 'src/components/RenderGuard';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Typography } from 'src/components/Typography';
import {
  WithProfileProps,
  withProfile,
} from 'src/containers/profile.container';
import { formatDate } from 'src/utilities/formatDate';
import { isPropValid } from 'src/utilities/isPropValid';

import type { StyledTypographyProps } from './SelectLinodePanel';

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

type CombinedProps = Props & WithProfileProps;

const SelectBackupPanel = (props: CombinedProps) => {
  const {
    error,
    loading,
    selectedLinodeID,
    selectedLinodeWithBackups,
    selectedBackupID,
    profile,
    handleChangeBackup,
    handleChangeBackupInfo,
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
      timezone: profile.data?.timezone,
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
                <Grid container>
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
  shouldForwardProp: (prop) => isPropValid(['component'], prop),
})<StyledTypographyProps>(({ theme }) => ({
  padding: `${theme.spacing(2)} 0 0`,
  width: '100%',
}));

const StyledRootPaper = styled(Paper, { label: 'StyledRootPaper' })(
  ({ theme }) => ({
    backgroundColor: theme.color.white,
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing(3),
  })
);

const StyledWrapperGrid = styled(Grid, { label: 'StyledWrapperGrid' })(
  ({ theme }) => ({
    minHeight: 120,
    padding: theme.spacing(1),
  })
);

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withProfile
)(SelectBackupPanel);
