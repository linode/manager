import {
  Linode,
  LinodeBackup,
  LinodeBackupsResponse,
} from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';
import {
  WithProfileProps,
  withProfile,
} from 'src/containers/profile.container';
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

type ClassNames = 'panelBody' | 'root' | 'wrapper';

const styles = (theme: Theme) =>
  createStyles({
    panelBody: {
      padding: `${theme.spacing(2)} 0 0`,
      width: '100%',
    },
    root: {
      backgroundColor: theme.color.white,
      flexGrow: 1,
      marginTop: theme.spacing(3),
      width: '100%',
    },
    wrapper: {
      minHeight: 120,
      padding: theme.spacing(1),
    },
  });

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

interface State {
  backups?: LinodeBackup[];
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps & WithProfileProps;

class SelectBackupPanel extends React.Component<CombinedProps, State> {
  getBackupInfo(backup: LinodeBackup) {
    const heading = backup.label
      ? backup.label
      : backup.type === 'auto'
      ? 'Automatic'
      : 'Snapshot';
    const subheading = formatDate(backup.created, {
      timezone: this.props.profile.data?.timezone,
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
  }

  render() {
    const {
      classes,
      error,
      loading,
      selectedLinodeID,
      selectedLinodeWithBackups,
    } = this.props;

    const aggregatedBackups = selectedLinodeWithBackups
      ? aggregateBackups(selectedLinodeWithBackups.currentBackups)
      : [];

    return (
      <Paper className={classes.root}>
        {error && <Notice error text={error} />}
        <Typography variant="h2">Select Backup</Typography>
        <Grid
          alignItems="center"
          className={classes.wrapper}
          container
          spacing={2}
        >
          {loading ? (
            <CircleProgress />
          ) : selectedLinodeID ? (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <React.Fragment>
              {aggregatedBackups.length !== 0 ? (
                <Typography className={classes.panelBody} component="div">
                  <Grid container>
                    {aggregatedBackups.map((backup) => {
                      return this.renderCard(backup);
                    })}
                  </Grid>
                </Typography>
              ) : (
                <Typography variant="body1">No backup available</Typography>
              )}
            </React.Fragment>
          ) : (
            <Typography variant="body1">First, select a Linode</Typography>
          )}
        </Grid>
      </Paper>
    );
  }

  renderCard(backup: LinodeBackup) {
    const { selectedBackupID } = this.props;
    const backupInfo_ = this.getBackupInfo(backup);
    return (
      <SelectionCard
        onClick={(e) => {
          const backupInfo = {
            details: backupInfo_.subheading,
            title: backupInfo_.infoName,
          };
          this.props.handleChangeBackup(backup.id);
          this.props.handleChangeBackupInfo(backupInfo);
        }}
        checked={backup.id === Number(selectedBackupID)}
        heading={backupInfo_.heading}
        key={backup.id}
        subheadings={[backupInfo_.subheading]}
      />
    );
  }

  state: State = {
    backups: [],
  };
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled,
  withProfile
)(SelectBackupPanel);
