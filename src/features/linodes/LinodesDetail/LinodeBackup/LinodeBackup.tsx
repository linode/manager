import * as React from 'react';
import * as moment from 'moment-timezone';
import { path, sortBy, pathOr } from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import { FormControl, FormHelperText } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import Typography from 'material-ui/Typography';

import {
  getLinodeBackups,
  enableBackups,
  takeSnapshot,
  updateBackupsWindow,
  cancelBackups,
} from 'src/services/linodes';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Placeholder from 'src/components/Placeholder';
import TextField from 'src/components/TextField';
import Select from 'src/components/Select';
import { resetEventsPolling } from 'src/events';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import ActionsPanel from 'src/components/ActionsPanel';

type ClassNames =
  'paper'
  | 'title'
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
    marginBottom: theme.spacing.unit * 2,
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
  backupsEnabled: boolean;
  backupsSchedule: Linode.LinodeBackupSchedule;
  backupsMonthlyPrice: number;
}

interface PreloadedProps {
  /* PromiseLoader */
  backups: PromiseLoaderResponse<Linode.LinodeBackupsResponse>;
}

interface State {
  snapshotForm: {
    label: string;
    errors?: Linode.ApiFieldError[];
  };
  settingsForm: {
    window: string;
    day: string;
    errors?: Linode.ApiFieldError[];
  };
}

type CombinedProps = Props & PreloadedProps & WithStyles<ClassNames>;

const typeMap = {
  auto: 'Automatic',
  snapshot: 'Manual',
};

const evenize = (n: number): number => {
  if (n === 0) return n;
  return (n % 2 === 0) ? n : n - 1;
};

class LinodeBackup extends React.Component<CombinedProps, State> {
  state: State = {
    snapshotForm: {
      label: '',
    },
    settingsForm: {
      window: this.props.backupsSchedule.window,
      day: this.props.backupsSchedule.day,
    },
  };

  windows: string[][] = [];
  days: string[][] = [];

  initWindows(timezone: string) {
    let windows = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((hour) => {
      const start = moment.utc({ hour })
        .add(moment.duration({ hours: 1 }))
        .tz(timezone);

      const finish = moment.utc({ hour })
        .add(moment.duration({ hours: 3 }))
        .tz(timezone);

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
    this.windows = this.initWindows(moment.tz.guess());

    this.days = [
      ['Choose a day', 'Scheduling'],
      ['Sunday',  'Sunday'],
      ['Monday',  'Monday'],
      ['Tuesday', 'Tuesday'],
      ['Wednesday', 'Wednesday'],
      ['Thursday', 'Thursday'],
      ['Friday',  'Friday'],
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

  cancelBackups() {
    const { linodeID } = this.props;
    cancelBackups(linodeID)
      .then(() => {
        sendToast('Backups are being cancelled for this Linode');
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
      });
  }

  aggregateBackups = (): Linode.LinodeBackup[] => {
    const { backups: { response: backups } } = this.props;
    return backups && [...backups.automatic, backups.snapshot.current].filter(b => Boolean(b));
  }

  takeSnapshot = () => {
    const { linodeID } = this.props;
    const { snapshotForm } = this.state;
    takeSnapshot(linodeID, snapshotForm.label)
      .then(() => {
        sendToast('A snapshot is being taken');
        this.setState({ snapshotForm : { label: '', errors: undefined } });
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
        this.setState({ settingsForm: {
          ...settingsForm,
          errors: path(['response', 'data', 'errors'], err),
        }});
      });
  }

  Placeholder = (): JSX.Element | null => {
    const { backupsMonthlyPrice } = this.props;

    const enableText = backupsMonthlyPrice
      ? `Enable Backups $${backupsMonthlyPrice.toFixed(2)}/mo`
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

  Table = ({ backups }: { backups: Linode.LinodeBackup[]}): JSX.Element | null => {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Paper className={classes.paper} style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date Created</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Disks</TableCell>
                <TableCell>Space Required</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.map((backup) => {
                return (
                  <TableRow key={backup.id}>
                    <TableCell>
                      {moment.utc(backup.created).local().format('YYYY-MM-DD - HH:mm')}
                    </TableCell>
                    <TableCell>{typeMap[backup.type]}</TableCell>
                    <TableCell>
                      {moment.duration(
                        moment(backup.finished).diff(moment(backup.created)),
                      ).humanize()}
                    </TableCell>
                    <TableCell>
                      {backup.disks.map((disk, idx) => (
                        <div key={idx}>
                          {disk.label} ({disk.filesystem}) - {disk.size}MB
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {backup.disks.reduce((acc, disk) => (
                        acc + disk.size
                      ), 0)}MB
                    </TableCell>
                    <TableCell></TableCell>
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
    const { classes } = this.props;
    const { snapshotForm } = this.state;
    const getErrorFor = getAPIErrorFor({ label: 'Label' }, snapshotForm.errors);

    return (
      <React.Fragment>
        <Paper className={classes.paper}>
          <Typography
            variant="title"
            className={classes.title}
          >
            Manual Snapshot
          </Typography>
          <Typography variant="body1">
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
            />
            <Button
              variant="raised"
              color="primary"
              onClick={this.takeSnapshot}
              className={classes.snapshotAction}
            >
              Take Snapshot
            </Button>
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
            className={classes.title}>
            Settings
          </Typography>
          <Typography variant="body1">
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
              onChange={e => this.setState({ settingsForm:
                { ...settingsForm, window: e.target.value } })}
              inputProps={{ name: 'window', id: 'window' }}
            >
              {this.windows.map((window: string[]) => (
                <MenuItem key={window[0]} value={window[1]}>
                  {window[0]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel htmlFor="day">
              Day of Week
            </InputLabel>
            <Select
              value={settingsForm.day}
              onChange={e => this.setState({ settingsForm:
                { ...settingsForm, day: e.target.value } })}
              inputProps={{ name: 'day', id: 'day' }}
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
            >
              Save Schedule
            </Button>
            {getErrorFor('none') &&
              <FormHelperText error>{getErrorFor('none')}</FormHelperText>
            }
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }

  Management = (): JSX.Element | null => {
    const { classes } = this.props;
    const backups = this.aggregateBackups();

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
          : <Paper className={classes.paper}>
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
          onClick={() => this.cancelBackups()}
        >
          Cancel Backups
        </Button>
        <Typography
          variant="body2"
        >
          Please note that when you cancel backups associated with this
          Linode, this will remove all existing backups.
        </Typography>
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
});

const styled = withStyles(styles, { withTheme: true });

export default preloaded(styled(LinodeBackup));
