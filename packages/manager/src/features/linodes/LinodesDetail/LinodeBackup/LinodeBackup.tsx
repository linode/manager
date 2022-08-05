import { GrantLevel } from '@linode/api-v4/lib/account';
import {
  cancelBackups,
  Day,
  getLinodeBackups,
  getType,
  LinodeBackup,
  LinodeBackupSchedule,
  LinodeBackupsResponse,
  LinodeType,
  takeSnapshot,
  Window,
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';
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
  WithStyles,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import PromiseLoader, {
  PromiseLoaderResponse,
} from 'src/components/PromiseLoader';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TextField from 'src/components/TextField';
import { events$ } from 'src/events';
import { resetEventsPolling } from 'src/eventsPolling';
import { linodeInTransition as isLinodeInTransition } from 'src/features/linodes/transitions';
import {
  LinodeActionsProps,
  withLinodeActions,
} from 'src/store/linodes/linode.containers';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import { sendBackupsDisabledEvent } from 'src/utilities/ga';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import getUserTimezone from 'src/utilities/getUserTimezone';
import { initWindows } from 'src/utilities/initWindows';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import BackupsPlaceholder from './BackupsPlaceholder';
import BackupTableRow from './BackupTableRow';
import DestructiveSnapshotDialog from './DestructiveSnapshotDialog';
import RestoreToLinodeDrawer from './RestoreToLinodeDrawer';

type ClassNames =
  | 'paper'
  | 'subTitle'
  | 'snapshotNameField'
  | 'snapshotFormControl'
  | 'snapshotGeneralError'
  | 'scheduleAction'
  | 'chooseDay'
  | 'cancelButton'
  | 'cancelCopy';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      marginBottom: theme.spacing(3),
    },
    subTitle: {
      marginBottom: theme.spacing(1),
    },
    snapshotFormControl: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      '& > div': {
        width: 'auto',
        marginRight: theme.spacing(2),
      },
      '& button': {
        marginTop: theme.spacing(4),
      },
    },
    scheduleAction: {
      padding: 0,
      '& button': {
        marginLeft: 0,
        marginTop: theme.spacing(2),
      },
    },
    chooseDay: {
      marginRight: theme.spacing(2),
      minWidth: 150,
      '& .react-select__menu-list': {
        maxHeight: 'none',
      },
    },
    cancelButton: {
      marginBottom: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
      },
    },
    cancelCopy: {
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
      },
    },
    snapshotNameField: {
      minWidth: 275,
    },
    snapshotGeneralError: {
      minWidth: '100%',
    },
  });

interface ContextProps {
  linodeID: number;
  linodeRegion: string;
  linodeType: null | string;
  backupsEnabled: boolean;
  backupsSchedule: LinodeBackupSchedule;
  linodeInTransition: boolean;
  linodeLabel: string;
  permissions: GrantLevel;
}

interface PreloadedProps {
  backups: PromiseLoaderResponse<LinodeBackupsResponse>;
  type: PromiseLoaderResponse<LinodeType>;
}

interface State {
  backups: LinodeBackupsResponse;
  snapshotForm: {
    label: string;
    errors?: APIError[];
  };
  settingsForm: {
    window: Window;
    day: Day;
    errors?: APIError[];
    loading: boolean;
  };
  restoreDrawer: {
    open: boolean;
    backupCreated: string;
    backupID?: number;
  };
  dialogOpen: boolean;
  dialogError?: string;
  loading: boolean;
  cancelBackupsAlertOpen: boolean;
  enabling: boolean;
}

type CombinedProps = PreloadedProps &
  LinodeActionsProps &
  WithStyles<ClassNames> &
  RouteComponentProps<{}> &
  ContextProps &
  WithSnackbarProps;

const isReadOnly = (permissions: GrantLevel) => {
  return permissions === 'read_only';
};

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

/* tslint:disable-next-line */
class _LinodeBackup extends React.Component<CombinedProps, State> {
  state: State = {
    backups: this.props.backups.response,
    snapshotForm: {
      label: '',
    },
    settingsForm: {
      window: this.props.backupsSchedule.window || 'Scheduling',
      day: this.props.backupsSchedule.day || 'Scheduling',
      loading: false,
    },
    restoreDrawer: {
      open: false,
      backupCreated: '',
    },
    dialogOpen: false,
    dialogError: undefined,
    loading: false,
    cancelBackupsAlertOpen: false,
    enabling: false,
  };

  windows: string[][] = [];
  days: string[][] = [];

  eventSubscription: Subscription;

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.eventSubscription = events$
      .filter((e) =>
        [
          'linode_snapshot',
          'backups_enable',
          'backups_cancel',
          'backups_restore',
        ].includes(e.action)
      )
      .filter((e) => !e._initial && e.status === 'finished')
      .subscribe((_) => {
        getLinodeBackups(this.props.linodeID)
          .then((data) => {
            this.setState({ backups: data });
          })
          .catch(() => {
            /* @todo: how do we want to display this error? */
            this.setState({ enabling: false });
          });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventSubscription.unsubscribe();
  }

  constructor(props: CombinedProps) {
    super(props);

    this.windows = initWindows(getUserTimezone(), true);

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

  cancelBackups = () => {
    const { enqueueSnackbar } = this.props;
    cancelBackups(this.props.linodeID)
      .then(() => {
        enqueueSnackbar('Backups are being canceled for this Linode', {
          variant: 'info',
        });
        // Just in case the user immediately disables backups
        // and enabling is still true:
        this.setState({ enabling: false });
        resetEventsPolling();
        // GA Event
        sendBackupsDisabledEvent();
      })
      .catch((errorResponse) => {
        getAPIErrorOrDefault(
          errorResponse,
          'There was an error disabling backups'
        )
          /**  @todo move this error to the actual modal */
          .forEach((err: APIError) =>
            enqueueSnackbar(err.reason, {
              variant: 'error',
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
    this.setState({ loading: true });
    takeSnapshot(linodeID, snapshotForm.label)
      .then(() => {
        enqueueSnackbar('A snapshot is being taken', {
          variant: 'info',
        });
        this.closeDestructiveDialog();
        this.setState({
          snapshotForm: { label: '', errors: undefined },
          loading: false,
        });
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        this.setState({
          snapshotForm: {
            ...this.state.snapshotForm,
            errors: getAPIErrorOrDefault(
              errorResponse,
              'There was an error taking a snapshot'
            ),
          },
          dialogOpen: this.state.dialogOpen,
          loading: false,
          dialogError: getAPIErrorOrDefault(
            errorResponse,
            'There was an error taking a snapshot'
          )[0].reason,
        });
      });
  };

  closeDestructiveDialog = () => {
    this.setState({
      dialogOpen: false,
      dialogError: undefined,
    });
  };

  saveSettings = () => {
    const {
      linodeID,
      enqueueSnackbar,
      linodeActions: { updateLinode },
    } = this.props;
    const { settingsForm } = this.state;

    this.setState((state) => ({
      settingsForm: { ...state.settingsForm, loading: true, errors: undefined },
    }));

    updateLinode({
      linodeId: linodeID,
      backups: {
        enabled: true,
        schedule: {
          day: settingsForm.day,
          window: settingsForm.window,
        },
      },
    })
      .then(() => {
        this.setState((state) => ({
          settingsForm: { ...state.settingsForm, loading: false },
        }));

        enqueueSnackbar('Backup settings saved', {
          variant: 'success',
        });
      })
      .catch((err) => {
        this.setState(
          (state) => ({
            settingsForm: {
              ...state.settingsForm,
              loading: false,
              errors: getAPIErrorOrDefault(err),
            },
          }),
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  openRestoreDrawer = (backupID: number, backupCreated: string) => {
    this.setState({
      restoreDrawer: { open: true, backupID, backupCreated },
    });
  };

  closeRestoreDrawer = () => {
    this.setState({
      restoreDrawer: { open: false, backupID: undefined, backupCreated: '' },
    });
  };

  handleSelectBackupWindow = (e: Item) => {
    this.setState({
      settingsForm: {
        ...this.state.settingsForm,
        window: e.value as Window,
      },
    });
  };

  handleSelectBackupTime = (e: Item) => {
    this.setState({
      settingsForm: {
        ...this.state.settingsForm,
        day: e.value as Day,
      },
    });
  };

  inputHasChanged = (
    initialValue: LinodeBackupSchedule,
    newValue: LinodeBackupSchedule
  ) => {
    return (
      newValue.day === 'Scheduling' ||
      newValue.window === 'Scheduling' ||
      (newValue.day === initialValue.day &&
        newValue.window === initialValue.window)
    );
  };

  handleSnapshotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshotForm: { label: e.target.value } });
  };

  handleSnapshotDialogDisplay = () => {
    // If there's no label, don't open the modal. Show an error in the form.
    if (!this.state.snapshotForm.label) {
      this.setState({
        snapshotForm: {
          ...this.state.snapshotForm,
          errors: [{ field: 'label', reason: 'Label is required.' }],
        },
      });
      return;
    }
    this.setState({
      dialogOpen: true,
      dialogError: undefined,
    });
  };

  handleCloseBackupsAlert = () => {
    this.setState({ cancelBackupsAlertOpen: false });
  };

  handleOpenBackupsAlert = () => {
    this.setState({ cancelBackupsAlertOpen: true });
  };

  handleDeploy = (backup: LinodeBackup) => {
    const { history, linodeID } = this.props;
    history.push(
      '/linodes/create' +
        `?type=Backups&backupID=${backup.id}&linodeID=${linodeID}`
    );
  };

  handleRestore = (backup: LinodeBackup) => {
    this.openRestoreDrawer(backup.id, formatDate(backup.created));
  };

  handleRestoreSubmit = () => {
    this.closeRestoreDrawer();
    this.props.enqueueSnackbar('Backup restore started', {
      variant: 'info',
    });
  };

  Table = ({ backups }: { backups: LinodeBackup[] }): JSX.Element | null => {
    const { classes, permissions } = this.props;
    const disabled = isReadOnly(permissions);

    return (
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
            {backups.map((backup: LinodeBackup, idx: number) => (
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
                  onClick={this.handleSnapshotDialogDisplay}
                  data-qa-snapshot-button
                  disabled={
                    linodeInTransition || disabled || snapshotForm.label === ''
                  }
                >
                  Take Snapshot
                </Button>
              </div>
            </Tooltip>
          </FormControl>
        </Paper>
        <DestructiveSnapshotDialog
          open={this.state.dialogOpen}
          error={this.state.dialogError}
          onClose={this.closeDestructiveDialog}
          onSnapshot={this.takeSnapshot}
          loading={this.state.loading}
        />
      </React.Fragment>
    );
  };

  SettingsForm = (): JSX.Element | null => {
    const { classes, backupsSchedule, permissions } = this.props;
    const { settingsForm } = this.state;
    const getErrorFor = getAPIErrorFor(
      {
        day: 'backups.day',
        window: 'backups.window',
        schedule: 'backups.schedule.window',
      },
      settingsForm.errors
    );
    const errorText =
      getErrorFor('none') ||
      getErrorFor('backups.day') ||
      getErrorFor('backups.window') ||
      getErrorFor('backups.schedule.window') ||
      getErrorFor('backups.schedule.day');

    const timeSelection = this.windows.map((window: Window[]) => {
      const label = window[0];
      return { label, value: window[1] };
    });

    const daySelection = this.days.map((day: string[]) => {
      const label = day[0];
      return { label, value: day[1] };
    });

    const defaultTimeSelection = timeSelection.find((eachOption) => {
      return eachOption.value === settingsForm.window;
    });

    const defaultDaySelection = daySelection.find((eachOption) => {
      return eachOption.value === settingsForm.day;
    });

    return (
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
          and will overwrite the previous daily backup. The selected day is when
          the backup is promoted to the weekly slot. Up to two weekly backups
          are saved.
        </Typography>
        <FormControl className={classes.chooseDay}>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-weekday-select': true,
              },
            }}
            options={daySelection}
            defaultValue={defaultDaySelection}
            onChange={this.handleSelectBackupTime}
            label="Day of Week"
            placeholder="Choose a day"
            isClearable={false}
            menuPlacement="top"
            name="Day of Week"
            noMarginTop
          />
        </FormControl>
        <FormControl>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-time-select': true,
              },
            }}
            options={timeSelection}
            onChange={this.handleSelectBackupWindow}
            label="Time of Day"
            placeholder="Choose a time"
            isClearable={false}
            defaultValue={defaultTimeSelection}
            menuPlacement="top"
            name="Time of Day"
            noMarginTop
          />
          <FormHelperText>
            Time displayed in {getUserTimezone().replace('_', ' ')}
          </FormHelperText>
        </FormControl>
        <ActionsPanel className={classes.scheduleAction}>
          <Button
            buttonType="primary"
            onClick={this.saveSettings}
            disabled={
              isReadOnly(permissions) ||
              this.inputHasChanged(backupsSchedule, settingsForm)
            }
            loading={this.state.settingsForm.loading}
            data-qa-schedule
          >
            Save Schedule
          </Button>
        </ActionsPanel>
        {errorText && <FormHelperText error>{errorText}</FormHelperText>}
      </Paper>
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
          buttonType="outlined"
          className={classes.cancelButton}
          disabled={disabled}
          onClick={this.handleOpenBackupsAlert}
          data-qa-cancel
        >
          Cancel Backups
        </Button>
        <Typography
          className={classes.cancelCopy}
          variant="body1"
          data-qa-cancel-desc
        >
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
            Canceling backups associated with this Linode will delete all
            existing backups. Are you sure?
          </Typography>
          <Typography style={{ marginTop: 12 }}>
            <strong>Note: </strong>
            Once backups for this Linode have been canceled, you cannot
            re-enable them for 24 hours.
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  };

  renderConfirmCancellationActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          buttonType="secondary"
          onClick={this.handleCloseBackupsAlert}
          data-qa-cancel-cancel
        >
          Close
        </Button>
        <Button
          buttonType="primary"
          onClick={this.cancelBackups}
          data-qa-confirm-cancel
        >
          Cancel Backups
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { backupsEnabled, permissions, type } = this.props;

    if (this.props.backups.error) {
      /** @todo remove promise loader and source backups from Redux */
      return (
        <ErrorState errorText="There was an issue retrieving your backups." />
      );
    }

    const backupsMonthlyPrice =
      type.response?.addons?.backups?.price?.monthly ?? 0;

    return (
      <div>
        {backupsEnabled ? (
          <this.Management />
        ) : (
          <BackupsPlaceholder
            linodeId={this.props.linodeID}
            backupsMonthlyPrice={backupsMonthlyPrice}
            disabled={isReadOnly(permissions)}
          />
        )}
      </div>
    );
  }
}

const preloaded = PromiseLoader<ContextProps>({
  backups: (props) => getLinodeBackups(props.linodeID),
  type: ({ linodeType }) => {
    if (!linodeType) {
      return Promise.resolve(undefined);
    }

    return getType(linodeType);
  },
});

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  backupsEnabled: linode.backups.enabled,
  backupsSchedule: linode.backups.schedule,
  linodeID: linode.id,
  linodeInTransition: isLinodeInTransition(linode.status),
  linodeLabel: linode.label,
  linodeRegion: linode.region,
  linodeType: linode.type,
  permissions: linode._permissions,
}));

export default compose<CombinedProps, {}>(
  linodeContext,
  preloaded,
  styled,
  withRouter,
  withSnackbar,
  withLinodeActions
)(_LinodeBackup);
