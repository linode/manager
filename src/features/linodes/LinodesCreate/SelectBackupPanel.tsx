import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SelectionCard from 'src/components/SelectionCard';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import { getLinodeBackups } from 'src/services/linodes';
import {
  aggregateBackups,
  formatBackupDate,
} from 'src/features/linodes/LinodesDetail/LinodeBackup';

type ClassNames =
'root'
| 'inner'
| 'panelBody'
| 'wrapper';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white,
    marginTop: theme.spacing.unit * 3,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  panelBody: {
    width: '100%',
    padding: `${theme.spacing.unit * 2}px 0 0`,
  },
  wrapper: {
    padding: theme.spacing.unit,
    minHeight: 120,
  },
});

interface Props {
  selectedLinodeID?: number;
  selectedBackupID?: number;
  handleSelection: (key: string) =>
    (event: React.SyntheticEvent<HTMLElement>, value: any) => void;
  error?: string;
}

interface State {
  loading: Boolean;
  backups?: Linode.LinodeBackup[];
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectBackupPanel extends React.Component<CombinedProps, State> {
  state: State = {
    loading: false,
  };

  handleBackupSelection = this.props.handleSelection('selectedBackupID');
  handleBackupInfoSelection = this.props.handleSelection('selectedBackupInfo');

  fetchBackups(linodeID?: number) {
    if (linodeID) {
      this.setState({ loading: true });
      getLinodeBackups(linodeID)
        .then((backups) => {
          this.setState({
            backups: aggregateBackups(backups),
            loading: false,
          });
        });
    }
  }

  componentDidMount() {
    this.fetchBackups(this.props.selectedLinodeID);
    this.updateBackupInfo();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (prevProps.selectedLinodeID !== this.props.selectedLinodeID) {
      this.fetchBackups(this.props.selectedLinodeID);
    }
    if (prevProps.selectedBackupID !== this.props.selectedBackupID
        || prevState.backups !== this.state.backups) {
      this.updateBackupInfo();
    }
  }

  updateBackupInfo() {
    const selectedBackup = this.state.backups && this.state.backups.filter(backup =>
      backup.id === Number(this.props.selectedBackupID),
    )[0];
    if (selectedBackup) {
      const backupInfo_ = this.getBackupInfo(selectedBackup);
      const backupInfo = {
        name: backupInfo_.infoName,
        details: backupInfo_.subheading,
      };
      this.handleBackupInfoSelection(undefined as any, backupInfo);
    }
  }

  getBackupInfo(backup: Linode.LinodeBackup) {
    const heading = backup.label ? backup.label : backup.type === 'auto' ? 'Automatic' : 'Snapshot';
    const subheading = formatBackupDate(backup.created);
    const infoName = heading === 'Automatic'
      ? 'From automatic backup'
      : `From backup ${heading}`;
    return {
      heading,
      subheading,
      infoName,
    };
  }

  renderCard(backup: Linode.LinodeBackup) {
    const { selectedBackupID } = this.props;
    const backupInfo_ = this.getBackupInfo(backup);
    return (
      <SelectionCard
        key={backup.id}
        checked={backup.id === Number(selectedBackupID)}
        onClick={(e) => {
          const backupInfo = {
            name: backupInfo_.infoName,
            details: backupInfo_.subheading,
          };
          this.handleBackupSelection(e, `${backup.id}`);
          this.handleBackupInfoSelection(e, backupInfo);
        }}
        heading={backupInfo_.heading}
        subheadings={[backupInfo_.subheading]}
      />
    );
  }

  render() {
    const { error, classes } = this.props;
    const { backups, loading } = this.state;

    return (
      <Paper className={`${classes.root}`}>
        <div className={classes.inner}>
          {error && <Notice text={error} error />}
          <Typography variant="title">
            Select Backup
          </Typography>
          {(!loading)
            ? <Grid container alignItems="center" className={classes.wrapper}>
                {backups
                  ? <React.Fragment>
                      {backups.length !== 0
                        ? <Typography component="div" className={classes.panelBody}>
                            <Grid container>
                            {}
                              {backups.map((backup) => {
                                return (
                                  this.renderCard(backup)
                                );
                              })}
                            </Grid>
                          </Typography>
                        : <Typography variant="body1">
                            No backup available
                          </Typography>
                      }
                    </React.Fragment>
                  : <Typography variant="body1">
                      First, select a Linode
                    </Typography>
                }
              </Grid>
            : <Grid container justify="center" alignItems="center" className={classes.wrapper}>
                <Grid item>
                  <CircularProgress
                    size={75}
                    variant="indeterminate"
                    thickness={2}
                  />
                </Grid>
              </Grid>
          }
        </div>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SelectBackupPanel);
