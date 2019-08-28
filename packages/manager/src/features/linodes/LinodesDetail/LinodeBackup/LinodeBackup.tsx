import { GrantLevel } from 'linode-js-sdk/lib/account';
import * as moment from 'moment-timezone';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { path, pathOr, sortBy } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import PromiseLoader, {
  PromiseLoaderResponse
} from 'src/components/PromiseLoader';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TextField from 'src/components/TextField';
import { events$, resetEventsPolling } from 'src/events';
import { linodeInTransition as isLinodeInTransition } from 'src/features/linodes/transitions';
import {
  cancelBackups,
  enableBackups,
  getLinodeBackups,
  getType,
  takeSnapshot
} from 'src/services/linodes';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import {
  sendBackupsDisabledEvent,
  sendBackupsEnabledEvent
} from 'src/utilities/ga';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import BackupTableRow from './BackupTableRow';
import RestoreToLinodeDrawer from './RestoreToLinodeDrawer';

type ClassNames =
  | 'paper'
  | 'title'
  | 'subTitle'
  | 'snapshotNameField'
  | 'snapshotFormControl'
  | 'snapshotGeneralError'
  | 'scheduleAction'
  | 'chooseTime'
  | 'chooseDay'
  | 'cancelButton';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3)
    },
    title: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2)
    },
    subTitle: {
      marginBottom: theme.spacing(1)
    },
    snapshotFormControl: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      '& > div': {
        width: 'auto',
        marginRight: theme.spacing(2)
      },
      '& button': {
        marginTop: theme.spacing(4)
      }
    },
    scheduleAction: {
      padding: 0,
      '& button': {
        marginLeft: 0,
        marginTop: theme.spacing(2)
      }
    },
    chooseTime: {
      marginRight: theme.spacing(2)
    },
    chooseDay: {
      minWidth: 150
    },
    cancelButton: {
      marginBottom: theme.spacing(1)
    },
    snapshotNameField: {
      minWidth: 275
    },
    snapshotGeneralError: {
      minWidth: '100%'
    }
  });

interface ContextProps {
  linodeID: number;
  linodeRegion: string;
  linodeType: null | string;
  backupsEnabled: boolean;
  backupsSchedule: Linode.LinodeBackupSchedule;
  linodeInTransition: boolean;
  linodeLabel: string;
  permissions: GrantLevel;
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
    window: Linode.Window;
    day: Linode.Day;
    errors?: Linode.ApiFieldError[];
  };
  restoreDrawer: {
    open: boolean;
    backupCreated: string;
    backupID?: number;
  };
  cancelBackupsAlertOpen: boolean;
  enabling: boolean;
}

type CombinedProps = PreloadedProps &
  LinodeActionsProps &
  StateProps &
  WithStyles<ClassNames> &
  RouteComponentProps<{}> &
  ContextProps &
  WithSnackbarProps;

const evenize = (n: number): number => {
  if (n === 0) {
    return n;
  }
  return n % 2 === 0 ? n : n - 1;
};

const isReadOnly = (permissions: GrantLevel) => {
  return permissions === 'read_only';
};

export const aggregateBackups = (
  backups: Linode.LinodeBackupsResponse
): Linode.LinodeBackup[] => {
  const manualSnapshot =
    path(['status'], backups.snapshot.in_progress) === 'needsPostProcessing'
      ? backups.snapshot.in_progress
      : backups.snapshot.current;
  return (
    backups && [...backups.automatic!, manualSnapshot!].filter(b => Boolean(b))
  );
};

class LinodeBackup extends React.Component<CombinedProps, State> {
  state: State = {
    backups: this.props.backups.response,
    snapshotForm: {
      label: ''
    },
    settingsForm: {
      window: this.props.backupsSchedule.window || 'Scheduling',
      day: this.props.backupsSchedule.day || 'Scheduling'
    },
    restoreDrawer: {
      open: false,
      backupCreated: ''
    },
    cancelBackupsAlertOpen: false,
    enabling: false
  };

  windows: string[][] = [];
  days: string[][] = [];

  eventSubscription: Subscription;

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.eventSubscription = events$
      .filter(e =>
        [
          'linode_snapshot',
          'backups_enable',
          'backups_cancel',
          'backups_restore'
        ].includes(e.action)
      )
      .filter(e => !e._initial && e.status === 'finished')
      .subscribe(e => {
        getLinodeBackups(this.props.linodeID)
          .then(data => {
            this.setState({ backups: data });
          })
          .catch(() => {
            /* @todo: how do we want to display this error? */
            this.setState({ enabling: false });
          });
      });
    const { enableOnLoad } = pathOr(false, ['location', 'state'], this.props);
    if (enableOnLoad && !this.props.backupsEnabled) {
      this.enableBackups();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventSubscription.unsubscribe();
  }

  initWindows(timezone: string) {
    let windows = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map(hour => {
      const start = moment.utc({ hour }).tz(timezone);
      const finish = moment
        .utc({ hour })
        .add(moment.duration({ hours: 2 }))
        .tz(timezone);
      return [
        `${start.format('HH:mm')} - ${finish.format('HH:mm')}`,
        `W${evenize(+moment.utc({ hour }).format('H'))}`
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
      ['Saturday', 'Saturday']
    ];
  }

  enableBackups = () => {
    this.setState({ enabling: true });
    const { linodeID, enqueueSnackbar } = this.props;
    enableBackups(linodeID)
      .then(() => {
        enqueueSnackbar('Backups are being enabled for this Linode', {
          variant: 'info'
        });
        resetEventsPolling();
        // GA Event
        sendBackupsEnabledEvent('From Backups tab');
      })
      .catch(errorResponse => {
        getAPIErrorOrDefault(errorResponse).forEach(
          (err: Linode.ApiFieldError) =>
            enqueueSnackbar(err.reason, {
              variant: 'error'
            })
        );
        this.setState({ enabling: false });
      });
  };

  cancelBackups = () => {
    const { enqueueSnackbar } = this.props;
    cancelBackups(this.props.linodeID)
      .then(() => {
        enqueueSnackbar('Backups are being cancelled for this Linode', {
          variant: 'info'
        });
        // Just in case the user immediately disables backups
        // and enabling is still true:
        this.setState({ enabling: false });
        resetEventsPolling();
        // GA Event
        sendBackupsDisabledEvent();
      })
      .catch(errorResponse => {
        getAPIErrorOrDefault(
          errorResponse,
          'There was an error disabling backups'
        )
          /**  @todo move this error to the actual modal */
          .forEach((err: Linode.ApiFieldError) =>
            enqueueSnackbar(err.reason, {
              variant: 'error'
            })
          );
      });
    if (!this.mounted) {
      return;
    }
    this.setState({ cancelBackupsAlertOpen: false });
  };

  takeSnapshot = () => {
    const { linodeID, enqueueSnackbar } = this.props;
    const { snapshotForm } = this.state;
    takeSnapshot(linodeID, snapshotForm.label)
      .then(() => {
        enqueueSnackbar('A snapshot is being taken', {
          variant: 'info'
        });
        this.setState({ snapshotForm: { label: '', errors: undefined } });
        resetEventsPolling();
      })
      .catch(errorResponse => {
        this.setState({
          snapshotForm: {
            ...this.state.snapshotForm,
            errors: getAPIErrorOrDefault(
              errorResponse,
              'There was an error taking a snapshot'
            )
          }
        });
      });
  };

  saveSettings = () => {
    const {
      linodeID,
      enqueueSnackbar,
      linodeActions: { updateLinode }
    } = this.props;
    const { settingsForm } = this.state;

    updateLinode({
      linodeId: linodeID,
      backups: {
        schedule: {
          day: settingsForm.day,
          window: settingsForm.window
        }
      }
    })
      .then(() => {
        enqueueSnackbar('Backup settings saved', {
          variant: 'success'
        });
      })
      .catch(err => {
        this.setState(
          {
            settingsForm: {
              ...settingsForm,
              errors: getAPIErrorOrDefault(err)
            }
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  openRestoreDrawer = (backupID: number, backupCreated: string) => {
    this.setState({
      restoreDrawer: { open: true, backupID, backupCreated }
    });
  };

  closeRestoreDrawer = () => {
    this.setState({
      restoreDrawer: { open: false, backupID: undefined, backupCreated: '' }
    });
  };

  handleSelectBackupWindow = (e: Item) => {
    this.setState({
      settingsForm: {
        ...this.state.settingsForm,
        window: e.value as Linode.Window
      }
    });
  };

  handleSelectBackupTime = (e: Item) => {
    this.setState({
      settingsForm: {
        ...this.state.settingsForm,
        day: e.value as Linode.Day
      }
    });
  };

  handleSnapshotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshotForm: { label: e.target.value } });
  };

  handleCloseBackupsAlert = () => {
    this.setState({ cancelBackupsAlertOpen: false });
  };

  handleOpenBackupsAlert = () => {
    this.setState({ cancelBackupsAlertOpen: true });
  };

  handleDeploy = (backup: Linode.LinodeBackup) => {
    const { history, linodeID } = this.props;
    history.push(
      '/linodes/create' +
        `?type=My%20Images&subtype=Backups&backupID=${
          backup.id
        }&linodeID=${linodeID}`
    );
  };

  handleRestore = (backup: Linode.LinodeBackup) => {
    this.openRestoreDrawer(backup.id, formatDate(backup.created));
  };

  handleRestoreSubmit = () => {
    this.closeRestoreDrawer();
    this.props.enqueueSnackbar('Backup restore started', {
      variant: 'info'
    });
  };

  Placeholder = (): JSX.Element | null => {
    const { enabling } = this.state;
    const { permissions } = this.props;
    const disabled = isReadOnly(permissions);
    const backupsMonthlyPrice = path<number>(
      ['types', 'response', 'addons', 'backups', 'price', 'monthly'],
      this.props
    );

    const backupPlaceholderText = backupsMonthlyPrice ? (
      <Typography>
        Three backup slots are executed and rotated automatically: a daily
        backup, a 2-7 day old backup, and 8-14 day old backup. To enable backups
        for just{' '}
        <strong>
          <Currency quantity={backupsMonthlyPrice} /> per month
        </strong>
        , click below.
      </Typography>
    ) : (
      <Typography>
        Three backup slots are executed and rotated automatically: a daily
        backup, a 2-7 day old backup, and 8-14 day old backup. To enable backups
        just click below.
      </Typography>
    );

    return (
      <React.Fragment>
        {disabled && <LinodePermissionsError />}
        <Placeholder
          icon={VolumeIcon}
          title="Backups"
          copy={backupPlaceholderText}
          buttonProps={{
            onClick: () => this.enableBackups(),
            children: 'Enable Backups',
            loading: enabling,
            disabled
          }}
        />
      </React.Fragment>
    );
  };

  Table = ({
    backups
  }: {
    backups: Linode.LinodeBackup[];
  }): JSX.Element | null => {
    const { classes, permissions } = this.props;
    const disabled = isReadOnly(permissions);

    return (
      <React.Fragment>
        <Paper className={classes.paper} style={{ padding: 0 }}>
          <Table aria-label="List of Backups">
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Date Created</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Disks</TableCell>
                <TableCell>Space Required</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.map((backup: Linode.LinodeBackup, idx: number) => (
                <BackupTableRow
                  key={idx}
                  backup={backup}
                  disabled={disabled}
                  handleDeploy={this.handleDeploy}
                  handleRestore={this.handleRestore}
                />
              ))}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  };

  SnapshotForm = (): JSX.Element | null => {
    const { classes, linodeInTransition, permissions } = this.props;
    const { snapshotForm } = this.state;
    const hasErrorFor = getErrorMap(['label'], snapshotForm.errors);

    const disabled = isReadOnly(permissions);

    return (
      <React.Fragment>
        <Paper className={classes.paper}>
          <Typography
            variant="h2"
            className={classes.subTitle}
            data-qa-manual-heading
          >
            Manual Snapshot
          </Typography>
          <Typography variant="body1" data-qa-manual-desc>
            You can make a manual backup of your Linode by taking a snapshot.
            Creating the manual snapshot can take several minutes, depending on
            the size of your Linode and the amount of data you have stored on
            it. The manual snapshot will not be overwritten by automatic
            backups.
          </Typography>
          <FormControl className={classes.snapshotFormControl}>
            {hasErrorFor.none && (
              <Notice
                spacingBottom={8}
                className={classes.snapshotGeneralError}
                error
              >
                {hasErrorFor.none}
              </Notice>
            )}
            <TextField
              errorText={hasErrorFor.label}
              label="Name Snapshot"
              value={snapshotForm.label || ''}
              onChange={this.handleSnapshotNameChange}
              data-qa-manual-name
              className={classes.snapshotNameField}
            />
            <Tooltip title={linodeInTransition ? 'This Linode is busy' : ''}>
              <div>
                <Button
                  buttonType="primary"
                  onClick={this.takeSnapshot}
                  data-qa-snapshot-button
                  disabled={linodeInTransition || disabled}
                >
                  Take Snapshot
                </Button>
              </div>
            </Tooltip>
          </FormControl>
        </Paper>
      </React.Fragment>
    );
  };

  SettingsForm = (): JSX.Element | null => {
    const { classes, permissions } = this.props;
    const { settingsForm } = this.state;
    const getErrorFor = getAPIErrorFor(
      {
        day: 'backups.day',
        window: 'backups.window',
        schedule: 'backups.schedule.window'
      },
      settingsForm.errors
    );
    const errorText =
      getErrorFor('none') ||
      getErrorFor('backups.day') ||
      getErrorFor('backups.window') ||
      getErrorFor('backups.schedule.window') ||
      getErrorFor('backups.schedule.day');

    const timeSelection = this.windows.map((window: Linode.Window[]) => {
      const label = window[0];
      return { label, value: window[1] };
    });

    const daySelection = this.days.map((day: string[]) => {
      const label = day[0];
      return { label, value: day[1] };
    });

    const defaultTimeSelection = timeSelection.find(eachOption => {
      return eachOption.value === settingsForm.window;
    });

    const defaultDaySelection = daySelection.find(eachOption => {
      return eachOption.value === settingsForm.day;
    });

    return (
      <React.Fragment>
        <Paper className={classes.paper}>
          <Typography
            variant="h2"
            className={classes.subTitle}
            data-qa-settings-heading
          >
            Settings
          </Typography>
          <Typography variant="body1" data-qa-settings-desc>
            Configure when automatic backups are initiated. The Linode Backup
            Service will generate a backup between the selected hours every day,
            and will overwrite the previous daily backup. The selected day is
            when the backup is promoted to the weekly slot. Up to two weekly
            backups are saved.
          </Typography>
          <FormControl className={classes.chooseTime}>
            <Select
              textFieldProps={{
                dataAttrs: {
                  'data-qa-time-select': true
                }
              }}
              options={timeSelection}
              onChange={this.handleSelectBackupWindow}
              label="Time of Day"
              placeholder="Choose a time"
              isClearable={false}
              defaultValue={defaultTimeSelection}
              name="Time of Day"
              noMarginTop
            />
            <FormHelperText>
              Windows displayed in {this.props.timezone}
            </FormHelperText>
          </FormControl>

          <FormControl className={classes.chooseDay}>
            <Select
              textFieldProps={{
                dataAttrs: {
                  'data-qa-weekday-select': true
                }
              }}
              options={daySelection}
              defaultValue={defaultDaySelection}
              onChange={this.handleSelectBackupTime}
              label="Day of Week"
              placeholder="Choose a day"
              isClearable={false}
              noMarginTop
            />
          </FormControl>
          <ActionsPanel className={classes.scheduleAction}>
            <Button
              buttonType="primary"
              onClick={this.saveSettings}
              disabled={isReadOnly(permissions)}
              data-qa-schedule
            >
              Save Schedule
            </Button>
          </ActionsPanel>
          {errorText && <FormHelperText error>{errorText}</FormHelperText>}
        </Paper>
      </React.Fragment>
    );
  };

  Management = (): JSX.Element | null => {
    const { classes, linodeID, linodeRegion, permissions } = this.props;
    const disabled = isReadOnly(permissions);

    const { backups: backupsResponse } = this.state;
    const backups = aggregateBackups(backupsResponse);

    return (
      <React.Fragment>
        {disabled && <LinodePermissionsError />}
        <Typography
          role="header"
          variant="h2"
          className={classes.title}
          data-qa-title
        >
          Backups
        </Typography>
        {backups.length ? (
          <this.Table backups={backups} />
        ) : (
          <Paper className={classes.paper} data-qa-backup-description>
            <Typography>
              Automatic and manual backups will be listed here
            </Typography>
          </Paper>
        )}
        <this.SnapshotForm />
        <this.SettingsForm />
        <Button
          buttonType="secondary"
          destructive
          className={classes.cancelButton}
          onClick={this.handleOpenBackupsAlert}
          data-qa-cancel
          disabled={disabled}
        >
          Cancel Backups
        </Button>
        <Typography variant="body2" data-qa-cancel-desc>
          Please note that when you cancel backups associated with this Linode,
          this will remove all existing backups.
        </Typography>
        <RestoreToLinodeDrawer
          open={this.state.restoreDrawer.open}
          linodeID={linodeID}
          linodeRegion={linodeRegion}
          backupID={this.state.restoreDrawer.backupID}
          backupCreated={this.state.restoreDrawer.backupCreated}
          onClose={this.closeRestoreDrawer}
          onSubmit={this.handleRestoreSubmit}
        />
        <ConfirmationDialog
          title="Confirm Cancellation"
          actions={this.renderConfirmCancellationActions}
          open={this.state.cancelBackupsAlertOpen}
          onClose={this.handleCloseBackupsAlert}
        >
          <Typography>
            Cancelling backups associated with this Linode will delete all
            existing backups. Are you sure?
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  };

  renderConfirmCancellationActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          buttonType="cancel"
          onClick={this.handleCloseBackupsAlert}
          data-qa-cancel-cancel
        >
          Close
        </Button>
        <Button
          buttonType="secondary"
          destructive
          onClick={this.cancelBackups}
          data-qa-confirm-cancel
        >
          Cancel Backups
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { backupsEnabled, linodeLabel } = this.props;

    if (this.props.backups.error) {
      /** @todo remove promise loader and source backups from Redux */
      return (
        <ErrorState errorText="There was an issue retrieving your backups." />
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Backups`} />
        {backupsEnabled ? <this.Management /> : <this.Placeholder />}
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<ContextProps>({
  backups: props => getLinodeBackups(props.linodeID),
  types: ({ linodeType }) => {
    if (!linodeType) {
      return Promise.resolve(undefined);
    }

    return getType(linodeType);
  }
});

const styled = withStyles(styles);

interface StateProps {
  timezone: string;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = (
  state,
  ownProps
) => ({
  timezone: pathOr('GMT', ['data', 'timezone'], state.__resources.profile)
});

const connected = connect(mapStateToProps);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  backupsEnabled: linode.backups.enabled,
  backupsSchedule: linode.backups.schedule,
  linodeID: linode.id,
  linodeInTransition: isLinodeInTransition(linode.status),
  linodeLabel: linode.label,
  linodeRegion: linode.region,
  linodeType: linode.type,
  permissions: linode._permissions
}));

export default compose<CombinedProps, {}>(
  linodeContext,
  preloaded,
  styled,
  withRouter,
  connected,
  withSnackbar,
  withLinodeActions
)(LinodeBackup);
