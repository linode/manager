import {
  Linode,
  LinodeBackup,
  LinodeBackupsResponse,
} from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import SelectionCard from 'src/components/SelectionCard';
import { aggregateBackups } from 'src/features/linodes/LinodesDetail/LinodeBackup';
import { formatDate } from 'src/utilities/formatDate';

export interface LinodeWithBackups extends Linode {
  currentBackups: LinodeBackupsResponse;
}

type ClassNames = 'root' | 'panelBody' | 'wrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.color.white,
      marginTop: theme.spacing(3),
    },
    panelBody: {
      width: '100%',
      padding: `${theme.spacing(2)}px 0 0`,
    },
    wrapper: {
      padding: theme.spacing(1),
      minHeight: 120,
    },
  });

interface BackupInfo {
  title: string;
  details: string;
}

interface Props {
  selectedLinodeID?: number;
  selectedBackupID?: number;
  error?: string;
  selectedLinodeWithBackups?: LinodeWithBackups;
  handleChangeBackup: (id: number) => void;
  handleChangeBackupInfo: (info: BackupInfo) => void;
  loading: boolean;
}

interface State {
  backups?: LinodeBackup[];
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectBackupPanel extends React.Component<CombinedProps, State> {
  state: State = {
    backups: [],
  };

  getBackupInfo(backup: LinodeBackup) {
    const heading = backup.label
      ? backup.label
      : backup.type === 'auto'
      ? 'Automatic'
      : 'Snapshot';
    const subheading = formatDate(backup.created);
    const infoName =
      heading === 'Automatic'
        ? 'From automatic backup'
        : `From backup ${heading}`;
    return {
      heading,
      subheading,
      infoName,
    };
  }

  renderCard(backup: LinodeBackup) {
    const { selectedBackupID } = this.props;
    const backupInfo_ = this.getBackupInfo(backup);
    return (
      <SelectionCard
        key={backup.id}
        checked={backup.id === Number(selectedBackupID)}
        onClick={(e) => {
          const backupInfo = {
            title: backupInfo_.infoName,
            details: backupInfo_.subheading,
          };
          this.props.handleChangeBackup(backup.id);
          this.props.handleChangeBackupInfo(backupInfo);
        }}
        heading={backupInfo_.heading}
        subheadings={[backupInfo_.subheading]}
        variant="check"
      />
    );
  }

  render() {
    const {
      error,
      classes,
      selectedLinodeID,
      loading,
      selectedLinodeWithBackups,
    } = this.props;

    const aggregatedBackups = selectedLinodeWithBackups
      ? aggregateBackups(selectedLinodeWithBackups.currentBackups)
      : [];

    return (
      <Paper className={`${classes.root}`}>
        {error && <Notice text={error} error />}
        <Typography variant="h2">Select Backup</Typography>
        <Grid container alignItems="center" className={classes.wrapper}>
          {loading ? (
            <CircleProgress />
          ) : selectedLinodeID ? (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <React.Fragment>
              {aggregatedBackups.length !== 0 ? (
                <Typography component="div" className={classes.panelBody}>
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
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled
)(SelectBackupPanel);
