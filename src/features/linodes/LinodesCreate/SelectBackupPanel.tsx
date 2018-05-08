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
import CircleProgress from 'src/components/CircleProgress';

import { getLinodeBackups } from 'src/services/linodes';
import {
  aggregateBackups,
  formatBackupDate,
} from 'src/features/linodes/LinodesDetail/LinodeBackup';

type ClassNames =
'root'
| 'inner'
| 'panelBody';

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
    padding: `${theme.spacing.unit * 2}px 0 0`,
  },
});

interface Props {
  selectedLinodeID?: number;
  selectedBackupID?: number;
  handleSelection: (key: string) =>
    (event: React.SyntheticEvent<HTMLElement>, value: string) => void;
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
  handleSizeSelection = this.props.handleSelection('requiredDiskSpace');

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
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.selectedLinodeID !== this.props.selectedLinodeID) {
      this.fetchBackups(this.props.selectedLinodeID);
    }
  }

  renderCard(backup: Linode.LinodeBackup) {
    const { selectedBackupID } = this.props;
    return (
      <SelectionCard
        key={backup.id}
        checked={backup.id === Number(selectedBackupID)}
        onClick={(e) => {
          const totalBackupSize = backup.disks.reduce((acc, disk) => (
            acc + disk.size
          ), 0);
          this.handleBackupSelection(e, `${backup.id}`);
          this.handleSizeSelection(e, `${totalBackupSize}`);
        }}
        heading={backup.label ? backup.label : backup.type === 'auto' ? 'Automatic' : 'Snapshot'}
        subheadings={[formatBackupDate(backup.created)]}
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
            ? <React.Fragment>
                {backups
                  ? <Typography component="div" className={classes.panelBody}>
                      <Grid container>
                        {backups.map((backup) => {
                          return (
                            this.renderCard(backup)
                          );
                        })}
                      </Grid>
                    </Typography>
                  : <Typography variant="body1">
                      First, select a Linode
                    </Typography>
                }
              </React.Fragment>
            : <CircleProgress />
          }
        </div>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SelectBackupPanel);
