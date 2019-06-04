import { WithStyles } from '@material-ui/core/styles';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import SelectionCard from 'src/components/SelectionCard';
import { aggregateBackups } from 'src/features/linodes/LinodesDetail/LinodeBackup';
import { formatDate } from 'src/utilities/formatDate';

type ClassNames = 'root' | 'inner' | 'panelBody' | 'wrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.color.white,
      marginTop: theme.spacing(3)
    },
    inner: {
      padding: theme.spacing(3)
    },
    panelBody: {
      width: '100%',
      padding: `${theme.spacing(2)}px 0 0`
    },
    wrapper: {
      padding: theme.spacing(1),
      minHeight: 120
    }
  });

interface BackupInfo {
  title: string;
  details: string;
}

interface Props {
  selectedLinodeID?: number;
  selectedBackupID?: number;
  error?: string;
  backups: Linode.LinodeWithBackups[];
  handleChangeBackup: (id: number) => void;
  handleChangeBackupInfo: (info: BackupInfo) => void;
}

interface State {
  backups?: Linode.LinodeBackup[];
}

const mockBackup: Linode.LinodeBackupsResponse = {
  snapshot: {
    in_progress: null,
    current: null
  },
  automatic: []
};

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectBackupPanel extends React.Component<CombinedProps, State> {
  state: State = {
    backups: []
  };

  componentDidMount() {
    const { backups } = this.props;
    if (this.props.selectedLinodeID) {
      // the backups prop will always be an array of one beacuse a filter is happening
      // a component higher to only pass the backups for the selected Linode
      this.setState({
        backups: aggregateBackups(
          pathOr(mockBackup, [0, 'currentBackups'], backups)
        )
      });
    }
    this.updateBackupInfo();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { backups } = this.props;
    if (prevProps.selectedLinodeID !== this.props.selectedLinodeID) {
      // the backups prop will always be an array of one beacuse a filter is happening
      // a component higher to only pass the backups for the selected Linode
      this.setState({
        backups: aggregateBackups(
          pathOr(mockBackup, [0, 'currentBackups'], backups)
        )
      });
    }
    if (
      prevProps.selectedBackupID !== this.props.selectedBackupID ||
      prevState.backups !== this.state.backups
    ) {
      this.updateBackupInfo();
    }
  }

  updateBackupInfo() {
    const selectedBackup =
      this.state.backups &&
      this.state.backups.filter(
        backup => backup.id === Number(this.props.selectedBackupID)
      )[0];
    if (selectedBackup) {
      const backupInfo_ = this.getBackupInfo(selectedBackup);
      const backupInfo = {
        title: backupInfo_.infoName,
        details: backupInfo_.subheading
      };
      this.props.handleChangeBackupInfo(backupInfo);
    }
  }

  getBackupInfo(backup: Linode.LinodeBackup) {
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
      infoName
    };
  }

  renderCard(backup: Linode.LinodeBackup) {
    const { selectedBackupID } = this.props;
    const backupInfo_ = this.getBackupInfo(backup);
    return (
      <SelectionCard
        key={backup.id}
        checked={backup.id === Number(selectedBackupID)}
        onClick={e => {
          const backupInfo = {
            title: backupInfo_.infoName,
            details: backupInfo_.subheading
          };
          this.props.handleChangeBackup(backup.id);
          this.props.handleChangeBackupInfo(backupInfo);
        }}
        heading={backupInfo_.heading}
        subheadings={[backupInfo_.subheading]}
      />
    );
  }

  render() {
    const { error, classes, selectedLinodeID } = this.props;
    const { backups } = this.state;

    return (
      <Paper className={`${classes.root}`}>
        <div className={classes.inner}>
          {error && <Notice text={error} error />}
          <Typography variant="h2">Select Backup</Typography>
          <Grid container alignItems="center" className={classes.wrapper}>
            {selectedLinodeID ? (
              <React.Fragment>
                {backups!.length !== 0 ? (
                  <Typography component="div" className={classes.panelBody}>
                    <Grid container>
                      {backups!.map(backup => {
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
        </div>
      </Paper>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  styled
)(SelectBackupPanel);
