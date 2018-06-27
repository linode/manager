import * as React from 'react';
import * as moment from 'moment-timezone';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose, path, sortBy, pathOr } from 'ramda';
import { Subscription } from 'rxjs/Rx';
import { connect } from 'react-redux';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import {
  getLinodeBackups,
  enableBackups,
  takeSnapshot,
  updateBackupsWindow,
  cancelBackups,
  getType,
} from 'src/services/linodes';
import Table from 'src/components/Table';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Placeholder from 'src/components/Placeholder';
import TextField from 'src/components/TextField';
import Select from 'src/components/Select';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { events$, resetEventsPolling } from 'src/events';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import ActionsPanel from 'src/components/ActionsPanel';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import LinodeBackupActionMenu from './LinodeBackupActionMenu';
import RestoreToLinodeDrawer from './RestoreToLinodeDrawer';

type ClassNames =
  'paper'
  | 'title'
  | 'subTitle'
  | 'snapshotFormControl'
  | 'snapshotAction'
  | 'scheduleAction'
  | 'chooseTime'
  | 'cancelButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  paper: {
    padding: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
  subTitle: {
    marginBottom: theme.spacing.unit,
  },
  snapshotFormControl: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    '& > div': {
      width: 'auto',
      marginRight: theme.spacing.unit * 2,
    },
  },
  snapshotAction: {
    height: 44,
    paddingTop: 11,
  },
  scheduleAction: {
    padding: 0,
    '& button': {
      marginLeft: 0,
      marginTop: theme.spacing.unit * 2,
    },
  },
  chooseTime: {
    marginRight: theme.spacing.unit * 2,
  },
  cancelButton: {
    marginBottom: theme.spacing.unit,
  },
});

interface Props {
  linodeID: number;
  linodeRegion: string;
  linodeType: null | string;
  backupsEnabled: boolean;
  backupsSchedule: Linode.LinodeBackupSchedule;
  linodeInTransition: boolean;
}

interface ConnectedProps {
  timezone: string;
}

interface PreloadedProps {
  backups: PromiseLoaderResponse<Linode.LinodeBackupsResponse>;
  type: PromiseLoaderResponse<Linode.LinodeType>;
}

interface State {
  backups: Linode.LinodeBackupsResponse;
  snapshotForm: {
    label: string;
    errors?: Linode.ApiFieldError[];
  };
  settingsForm: {
    window: string;
    day: string;
    errors?: Linode.ApiFieldError[];
  };
  restoreDrawer: {
    open: boolean;
    backupCreated: string;
    backupID?: number;
  };
  cancelBackupsAlertOpen: boolean;
}

type CombinedProps = Props
  & PreloadedProps
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>
  & ConnectedProps;

const typeMap = {
  auto: 'Automatic',
  snapshot: 'Manual',
};

const evenize = (n: number): number => {
  if (n === 0) return n;
  return (n % 2 === 0) ? n : n - 1;
};

export const aggregateBackups = (backups: Linode.LinodeBackupsResponse): Linode.LinodeBackup[] => {
  const manualSnapshot = path(['status'], backups.snapshot.in_progress) === 'needsPostProcessing'
    ? backups.snapshot.in_progress
    : backups.snapshot.current;
  return backups && [...backups.automatic!, manualSnapshot!].filter(b => Boolean(b));
};

export function formatBackupDate(backupDate: string) {
  return moment.utc(backupDate).local().fromNow();
}

class LinodeBackup extends React.Component<CombinedProps, State> {
  state: State = {
    backups: this.props.backups.response,
    snapshotForm: {
      label: '',
    },
    settingsForm: {
      window: this.props.backupsSchedule.window || 'Scheduling',
      day: this.props.backupsSchedule.day || 'Scheduling',
    },
    restoreDrawer: {
      open: false,
      backupCreated: '',
    },
    cancelBackupsAlertOpen: false,
  };

  windows: string[][] = [];
  days: string[][] = [];

  eventSubscription: Subscription;

  componentDidMount() {
    this.eventSubscription = events$
      .filter(e => [
        'linode_snapshot',
        'backups_enable',
        'backups_cancel',
        'backups_restore',
      ].includes(e.action))
      .filter(e => !e._initial && e.status === 'finished')
      .subscribe((e) => {
        getLinodeBackups(this.props.linodeID)
          .then((data) => {
            this.setState({ backups: data });
          })
          .catch(() => {
            /* @todo: how do we want to display this error? */
          });
      });
  }

  componentWillUnmount() {
    this.eventSubscription.unsubscribe();
  }

  initWindows(timezone: string) {
    let windows = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((hour) => {
      const start = moment.utc({ hour }).tz(timezone);
      const finish = moment.utc({ hour }).add(moment.duration({ hours: 2 })).tz(timezone);
      return [
        `${start.format('HH:mm')} - ${finish.format('HH:mm')}`,
        `W${evenize(+moment.utc({ hour }).format('H'))}`,
      ];
    });

    windows = sortBy<string[]>(window => window[0], windows);

    windows.unshift(['Choose a time', 'Scheduling']);

    return windows;
  }

  constructor(props: CombinedProps) {
    super(props);

    /* TODO: use the timezone from the user's profile */
    this.windows = this.initWindows(this.props.timezone);

    this.days = [
      ['Choose a day', 'Scheduling'],
      ['Sunday', 'Sunday'],
      ['Monday', 'Monday'],
      ['Tuesday', 'Tuesday'],
      ['Wednesday', 'Wednesday'],
      ['Thursday', 'Thursday'],
      ['Friday', 'Friday'],
      ['Saturday', 'Saturday'],
    ];
  }

  enableBackups() {
    const { linodeID } = this.props;
    enableBackups(linodeID)
      .then(() => {
        sendToast('Backups are being enabled for this Linode');
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
      });
  }

  cancelBackups(linodeID: number) {
    cancelBackups(linodeID)
      .then(() => {
        sendToast('Backups are being cancelled for this Linode');
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
      });
    this.setState({ cancelBackupsAlertOpen: false });
  }

  takeSnapshot = () => {
    const { linodeID } = this.props;
    const { snapshotForm } = this.state;
    takeSnapshot(linodeID, snapshotForm.label)
      .then(() => {
        sendToast('A snapshot is being taken');
        this.setState({ snapshotForm: { label: '', errors: undefined } });
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
      });
  }

  saveSettings = () => {
    const { linodeID } = this.props;
    const { settingsForm } = this.state;
    updateBackupsWindow(linodeID, settingsForm.day, settingsForm.window)
      .then(() => {
        sendToast('Backup settings saved');
      })
      .catch((err) => {
        this.setState({
          settingsForm: {
            ...settingsForm,
            errors: path(['response', 'data', 'errors'], err),
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  openRestoreDrawer = (backupID: number, backupCreated: string) => {
    this.setState({
      restoreDrawer:
        { open: true, backupID, backupCreated },
    });
  }

  closeRestoreDrawer = () => {
    this.setState({ restoreDrawer: { open: false, backupID: undefined, backupCreated: '' } });
  }

  Placeholder = (): JSX.Element | null => {
    const backupsMonthlyPrice = path<number>(
      ['type', 'response', 'addons', 'backups', 'price'],
      this.props,
    );

    const enableText = backupsMonthlyPrice
      ? backupsMonthlyPrice
        ? `Enable Backups $${backupsMonthlyPrice.toFixed(2)}/mo`
        : `Enable Backups`
      : `Enable Backups`;

    return (
      <Placeholder
        icon={VolumeIcon}
        title="Backups"
        copy="Take automatic snapshots of the files on your Linode"
        buttonProps={{
          onClick: () => this.enableBackups(),
          children: enableText,
        }}
      />
    );
  }

  Table = ({ backups }: { backups: Linode.LinodeBackup[] }): JSX.Element | null => {
    const { classes, history, linodeID } = this.props;

    return (
      <React.Fragment>
        <Paper className={classes.paper} style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Created</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Disks</TableCell>
                <TableCell>Space Required</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.map((backup) => {
                return (
                  <TableRow key={backup.id} data-qa-backup>
                    <TableCell>
                      {formatBackupDate(backup.created)}
                    </TableCell>
                    <TableCell data-qa-backup-name>
                      {backup.label || typeMap[backup.type]}
                    </TableCell>
                    <TableCell>
                      {moment.duration(
                        moment(backup.finished).diff(moment(backup.created)),
                      ).humanize()}
                    </TableCell>
                    <TableCell data-qa-backup-disks>
                      {backup.disks.map((disk, idx) => (
                        <div key={idx}>
                          {disk.label} ({disk.filesystem}) - {disk.size}MB
                        </div>
                      ))}
                    </TableCell>
                    <TableCell data-qa-space-required>
                      {backup.disks.reduce((acc, disk) => (
                        acc + disk.size
                      ), 0)}MB
                    </TableCell>
                    <TableCell>
                      <LinodeBackupActionMenu
                        onRestore={() => this.openRestoreDrawer(
                          backup.id,
                          formatBackupDate(backup.created),
                        )}
                        onDeploy={() => {
                          history.push('/linodes/create'
                            + `?type=fromBackup&backupID=${backup.id}&linodeID=${linodeID}`);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }

  SnapshotForm = (): JSX.Element | null => {
    const { classes, linodeInTransition } = this.props;
    const { snapshotForm } = this.state;
    const getErrorFor = getAPIErrorFor({ label: 'Label' }, snapshotForm.errors);

    return (
      <React.Fragment>
        <Paper className={classes.paper}>
          <Typography
            variant="title"
            className={classes.subTitle}
            data-qa-manual-heading
          >
            Manual Snapshot
          </Typography>
          <Typography variant="body1" data-qa-manual-desc>
            You can make a manual backup of your Linode by taking a snapshot.
            Creating the manual snapshot can take serval minutes, depending on
            the size of your Linode and the amount of data you have stored on
            it.
          </Typography>
          <FormControl className={classes.snapshotFormControl}>
            <TextField
              errorText={getErrorFor('label')}
              label="Name Snapshot"
              value={snapshotForm.label || ''}
              onChange={e => this.setState({ snapshotForm: { label: e.target.value } })}
              data-qa-manual-name
            />
            <Tooltip title={linodeInTransition
              ? 'This Linode is busy'
              : ''
            }>
              <div>
                <Button
                  variant="raised"
                  color="primary"
                  onClick={this.takeSnapshot}
                  className={classes.snapshotAction}
                  data-qa-snapshot-button
                  disabled={linodeInTransition}
                >
                  Take Snapshot
                </Button>
              </div>
            </Tooltip>
            {getErrorFor('none') &&
              <FormHelperText error>{getErrorFor('none')}</FormHelperText>
            }
          </FormControl>
        </Paper>
      </React.Fragment>
    );
  }

  SettingsForm = (): JSX.Element | null => {
    const { classes } = this.props;
    const { settingsForm } = this.state;
    const getErrorFor = getAPIErrorFor(
      { day: 'Day', window: 'Window' },
      settingsForm.errors);

    return (
      <React.Fragment>
        <Paper className={classes.paper}>
          <Typography
            variant="title"
            className={classes.subTitle}
            data-qa-settings-heading>
            Settings
          </Typography>
          <Typography variant="body1" data-qa-settings-desc>
            Configure when automatic backups are initiated. The Linode Backup
            Service will generate backups between the selected hours. The
            selected day is when the backup is promoted to the weekly slot.
          </Typography>

          <FormControl className={classes.chooseTime}>
            <InputLabel htmlFor="window">
              Time of Day
            </InputLabel>
            <Select
              value={settingsForm.window}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => this.setState({
                settingsForm:
                  { ...settingsForm, window: e.target.value },
              })}
              inputProps={{ name: 'window', id: 'window' }}
              data-qa-time-select
            >
              {this.windows.map((window: string[]) => (
                <MenuItem key={window[0]} value={window[1]}>
                  {window[0]}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Windows displayed in {this.props.timezone}</FormHelperText>
          </FormControl>

          <FormControl>
            <InputLabel htmlFor="day">
              Day of Week
            </InputLabel>
            <Select
              value={settingsForm.day}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => this.setState({
                settingsForm:
                  { ...settingsForm, day: e.target.value },
              })}
              inputProps={{ name: 'day', id: 'day' }}
              data-qa-weekday-select
            >
              {this.days.map((day: string[]) => (
                <MenuItem key={day[0]} value={day[1]}>
                  {day[0]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ActionsPanel className={classes.scheduleAction}>
            <Button
              variant="raised"
              color="primary"
              onClick={this.saveSettings}
              data-qa-schedule
            >
              Save Schedule
            </Button>
          </ActionsPanel>
          {getErrorFor('none') &&
            <FormHelperText error>{getErrorFor('none')}</FormHelperText>
          }
        </Paper>
      </React.Fragment>
    );
  }

  Management = (): JSX.Element | null => {
    const { classes, linodeID, linodeRegion } = this.props;
    const { backups: backupsResponse } = this.state;
    const backups = aggregateBackups(backupsResponse);

    return (
      <React.Fragment>
        <Typography
          variant="headline"
          className={classes.title}
          data-qa-title
        >
          Backups
        </Typography>
        {backups.length
          ? <this.Table backups={backups} />
          : <Paper className={classes.paper} data-qa-backup-description>
            Automatic and manual backups will be listed here
            </Paper>
        }
        <this.SnapshotForm />
        <this.SettingsForm />
        <Button
          variant="raised"
          color="secondary"
          className={`
            ${classes.cancelButton}
            destructive
          `}
          onClick={() => this.setState({ cancelBackupsAlertOpen: true })}
          data-qa-cancel
        >
          Cancel Backups
        </Button>
        <Typography
          variant="body2"
          data-qa-cancel-desc
        >
          Please note that when you cancel backups associated with this
          Linode, this will remove all existing backups.
        </Typography>
        <RestoreToLinodeDrawer
          open={this.state.restoreDrawer.open}
          linodeID={linodeID}
          linodeRegion={linodeRegion}
          backupID={this.state.restoreDrawer.backupID}
          backupCreated={this.state.restoreDrawer.backupCreated}
          onClose={this.closeRestoreDrawer}
          onSubmit={() => {
            this.closeRestoreDrawer();
            sendToast('Backup restore started');
          }}
        />
        <ConfirmationDialog
          title="Confirm Cancellation"
          actions={() =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                variant="raised"
                color="secondary"
                className="destructive"
                onClick={() => this.cancelBackups(linodeID)}
                data-qa-confirm-cancel
              >
                Cancel Backups
              </Button>
              <Button
                onClick={() => this.setState({ cancelBackupsAlertOpen: false })}
                variant="raised"
                color="secondary"
                className="cancel"
                data-qa-cancel-cancel
              >
                Close
            </Button>
            </ActionsPanel>
          }
          open={this.state.cancelBackupsAlertOpen}
        >
          Cancelling backups associated with this Linode will
           delete all existing backups. Are you sure?
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  render() {
    const { backupsEnabled } = this.props;

    return (
      <React.Fragment>
        {backupsEnabled
          ? <this.Management />
          : <this.Placeholder />
        }
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<Props>({
  backups: (props: Props) => getLinodeBackups(props.linodeID),
  types: ({ linodeType }: Props) => {
    if (!linodeType) {
      return Promise.resolve(undefined);
    }

    return getType(linodeType);
  },
});

const styled = withStyles(styles, { withTheme: true });

const connected = connect((state) => ({
  timezone: pathOr(moment.tz.guess(), ['resources', 'profile', 'data', 'timezone'], state),
}));

export default compose(
  preloaded,
  styled as any,
  withRouter,
  connected,
)(LinodeBackup);
