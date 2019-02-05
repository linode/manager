import * as moment from 'moment';
import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { last, pathEq, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { compose as composeC, withProps } from 'recompose';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import Notice from 'src/components/Notice';
import ProductNotification from 'src/components/ProductNotification';
import TabLink from 'src/components/TabLink';
import { events$ } from 'src/events';
import { reportException } from 'src/exceptionReporting';
import LinodeConfigSelectionDrawer from 'src/features/LinodeConfigSelectionDrawer';
import { newLinodeEvents } from 'src/features/linodes/events';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish';
import VolumesLanding from 'src/features/Volumes/VolumesLanding';
import { scheduleOrQueueMigration, startMutation } from 'src/services/linodes';
import { _getLinodeDisks } from 'src/store/linodeDetail/disks';
import { _getLinodeVolumes } from 'src/store/linodeDetail/volumes';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import {
  withTypes,
  WithTypes
} from 'src/store/linodeType/linodeType.containers';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { ThunkDispatch } from 'src/store/types';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { LinodeProvider } from './context';
import LinodeBackup from './LinodeBackup';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import LinodeNetworking from './LinodeNetworking';
import LinodePowerControl from './LinodePowerControl';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import linodesDetailContainer, {
  InnerProps as WithLinode
} from './LinodesDetail.container';
import LinodeSettings from './LinodeSettings';
import LinodeSummary from './LinodeSummary';
import LinodeBusyStatus from './LinodeSummary/LinodeBusyStatus';
import MutateDrawer from './MutateDrawer';
import reloadableWithRouter from './reloadableWithRouter';

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: (id: number) => void;
}

interface MutateInfo {
  vcpus: number | null;
  memory: number | null;
  disk: number | null;
  transfer: number | null;
  network_out: number | null;
}

interface MutateDrawer {
  open: boolean;
  loading: boolean;
  error: string;
}

interface State {
  configDrawer: ConfigDrawerState;
  labelInput: { label: string; errorText: string };
  showPendingMutation: boolean;
  mutateInfo: MutateInfo | null;
  mutateDrawer: MutateDrawer;
  currentNetworkOut: number | null;
}

interface MatchProps {
  linodeId?: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = LinodeActionsProps &
  WithTypes &
  WithLinode &
  DispatchProps &
  RouteProps &
  InjectedNotistackProps &
  WithStyles<ClassNames> & { linodeId: number };

type ClassNames =
  | 'migrationLink'
  | 'pendingMutationLink'
  | 'titleWrapper'
  | 'backButton'
  | 'controls'
  | 'launchButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  migrationLink: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  pendingMutationLink: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 5
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34
    }
  },
  controls: {
    marginTop: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      display: 'flex',
      flexBasis: '100%'
    }
  },
  launchButton: {
    padding: '12px 28px 14px 0',
    lineHeight: 1,
    position: 'relative',
    top: 1,
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline'
    },
    '&:focus > span:first-child': {
      outline: '1px dotted #999'
    }
  }
});

type StateSetter = <S>(v: S) => S;

class LinodeDetail extends React.Component<CombinedProps, State> {
  eventsSubscription: Subscription;

  volumeEventsSubscription: Subscription;

  diskResizeSubscription: Subscription;

  mounted: boolean = false;

  state: State = {
    configDrawer: {
      action: (id: number) => null,
      configs: [],
      error: undefined,
      open: false,
      selected: undefined
    },
    labelInput: {
      label: '',
      errorText: ''
    },
    showPendingMutation: false,
    mutateInfo: null,
    mutateDrawer: {
      open: false,
      loading: false,
      error: ''
    },
    currentNetworkOut: null
  };

  composeState = (...fns: StateSetter[]) =>
    this.setState(state =>
      fns.reverse().reduce((result, current) => current(result), state)
    );

  componentWillUnmount() {
    this.mounted = false;
    this.eventsSubscription.unsubscribe();
    this.volumeEventsSubscription.unsubscribe();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { linode } = this.props;
    const { linode: prevLinode } = prevProps;
    const { types } = this.props;

    if (linode && linode._type && linode !== prevLinode) {
      const {
        successor,
        network_out,
        vcpus,
        disk,
        transfer,
        memory
      } = linode._type;

      if (successor !== null) {
        const successorType = types.find(type => type.id === successor);

        if (!successorType) {
          return;
        }

        this.setState({
          showPendingMutation: true,
          currentNetworkOut: network_out,
          // data is only relevant if the upgrade data is different from the current type's data
          mutateInfo: {
            vcpus: successorType.vcpus !== vcpus ? successorType.vcpus : null,
            network_out:
              successorType.network_out !== network_out
                ? successorType.network_out
                : null,
            disk: successorType.disk !== disk ? successorType.disk : null,
            transfer:
              successorType.transfer !== transfer
                ? successorType.transfer
                : null,
            memory:
              successorType.memory !== memory ? successorType.memory : null
          }
        });
      } else {
        this.setState({ showPendingMutation: false });
      }
    }
  }

  componentDidMount() {
    this.mounted = true;

    const mountTime = moment().subtract(5, 'seconds');
    const {
      actions,
      match: {
        params: { linodeId }
      }
    } = this.props;

    this.diskResizeSubscription = events$
      .filter(e => !e._initial)
      .filter(pathEq(['entity', 'id'], Number(linodeId)))
      .filter(e => e.status === 'finished' && e.action === 'disk_resize')
      .subscribe(e => actions.getLinodeDisks());

    this.eventsSubscription = events$
      .filter(pathEq(['entity', 'id'], Number(linodeId)))
      .filter(newLinodeEvents(mountTime))
      .debounce(() => Observable.timer(1000))
      .subscribe(linodeEvent => {
        // configs.request();
        actions.getLinodeDisks();
        actions.getLinodeVolumes();
        // linode.request(linodeEvent);
      });

    /** Get events which are related to volumes and this Linode */
    this.volumeEventsSubscription = events$
      .filter(e =>
        [
          'volume_attach',
          'volume_clone',
          'volume_create',
          'volume_delete',
          'volume_detach',
          'volume_resize'
        ].includes(e.action)
      )
      .filter(e => !e._initial)
      .subscribe(v => {
        actions.getLinodeVolumes();
      });

    // configs.request();
    actions.getLinodeVolumes();
    // linode.request();
  }

  openConfigDrawer = (
    configs: Linode.Config[],
    action: (id: number) => void
  ) => {
    this.setState({
      configDrawer: {
        action,
        configs,
        open: true,
        selected: configs[0].id
      }
    });
  };

  closeConfigDrawer = () => {
    this.setState({
      configDrawer: {
        action: (id: number) => null,
        configs: [],
        error: undefined,
        open: false,
        selected: undefined
      }
    });
  };

  selectConfig = (id: number) => {
    this.setState(prevState => ({
      configDrawer: {
        ...prevState.configDrawer,
        selected: id
      }
    }));
  };

  submitConfigChoice = () => {
    const { action, selected } = this.state.configDrawer;
    if (selected && action) {
      action(selected);
      this.closeConfigDrawer();
    }
  };

  // @TODO add support for multiple error messages
  // (Currently, including multiple error strings
  // breaks the layout)
  updateLabel = (label: string) => {
    const {
      linodeActions: { updateLinode },
      linode
    } = this.props;

    if (!linode) {
      return Promise.reject();
    }

    return updateLinode({ linodeId: linode.id, label })
      .then(({ label }) => {
        this.setState({
          labelInput: {
            errorText: '',
            label
          }
        });
      })
      .catch(err => {
        const errors: Linode.ApiFieldError[] = pathOr(
          [],
          ['response', 'data', 'errors'],
          err
        );
        const errorStrings: string[] = errors.map(e => e.reason);
        /** "!" is okay because linode being undefined is being handled by render() */
        this.setState(
          { labelInput: { label: linode.label, errorText: errorStrings[0] } },
          () => {
            scrollErrorIntoView();
          }
        );
        return Promise.reject(errorStrings[0]);
      });
  };

  cancelUpdate = () => {
    /** @todo figure out why this logic was here in the first place */
    // const { data: linode } = this.state.context.linode;
    // if (!linode) { return; }
    const { labelInput } = this.state;
    this.setState({ labelInput: { ...labelInput, errorText: '' } });
    // this.forceUpdate();
  };

  openMutateDrawer = () => {
    this.setState({ mutateDrawer: { ...this.state.mutateDrawer, open: true } });
  };

  closeMutateDrawer = () => {
    this.setState({
      mutateDrawer: {
        ...this.state.mutateDrawer,
        open: false,
        error: ''
      }
    });
  };

  initMutation = () => {
    const { mutateDrawer } = this.state;
    const { linode } = this.props;

    if (!linode) {
      return;
    }

    this.setState({
      mutateDrawer: {
        ...mutateDrawer,
        loading: true,
        error: ''
      }
    });
    /*
     * It's okay to disregard the possiblity of linode
     * being undefined. The upgrade message won't appear unless
     * it's defined
     */
    startMutation(linode.id)
      .then(() => {
        // linode.request();
        this.setState({
          mutateDrawer: {
            ...mutateDrawer,
            open: false,
            error: '',
            loading: false
          }
        });
        this.props.enqueueSnackbar('Linode upgrade has been initiated.', {
          variant: 'info'
        });
      })
      .catch(errors => {
        this.setState({
          mutateDrawer: {
            ...mutateDrawer,
            loading: false,
            error: pathOr(
              'Mutation could not be initiated.',
              ['response', 'data', 'errors', 0, 'reason'],
              errors
            )
          }
        });
      });
  };

  migrate = (type: string) => {
    const { linodeId, enqueueSnackbar } = this.props;
    const { getNotifications } = this.props.actions;
    scheduleOrQueueMigration(linodeId)
      .then(_ => {
        // A 200 response indicates that the operation was successful.
        const successMessage =
          type === 'migration_scheduled'
            ? 'Your Linode has been entered into the migration queue.'
            : 'Your migration has been scheduled.';
        enqueueSnackbar(successMessage, {
          variant: 'success'
        });
        getNotifications();
      })
      .catch(_ => {
        // @todo: use new error handling pattern here after merge.
        enqueueSnackbar('There was an error starting your migration.', {
          variant: 'error'
        });
      });
  };

  launchLish = () => {
    const { linodeId } = this.props;
    lishLaunch(linodeId);
  };

  render() {
    const {
      match: { url }
    } = this.props;
    const { labelInput, configDrawer, mutateDrawer, mutateInfo } = this.state;

    const getLabelLink = (): string | undefined => {
      return last(location.pathname.split('/')) !== 'summary'
        ? 'summary'
        : undefined;
    };

    const tabs = [
      /* NB: These must correspond to the routes inside the Switch */
      { routeName: `${url}/summary`, title: 'Summary' },
      { routeName: `${url}/volumes`, title: 'Volumes' },
      { routeName: `${url}/networking`, title: 'Networking' },
      { routeName: `${url}/resize`, title: 'Resize' },
      { routeName: `${url}/rescue`, title: 'Rescue' },
      { routeName: `${url}/rebuild`, title: 'Rebuild' },
      { routeName: `${url}/backup`, title: 'Backups' },
      { routeName: `${url}/settings`, title: 'Settings' }
    ];

    const handleTabChange = (
      event: React.ChangeEvent<HTMLDivElement>,
      value: number
    ) => {
      const { history } = this.props;
      const routeName = tabs[value].routeName;
      history.push(`${routeName}`);
    };

    const { linode, error, loading } = this.props;

    if (loading) {
      return <CircleProgress />;
    }

    if (!linode) {
      return <NotFound />;
    }

    if (error) {
      reportException(Error('Error while loading Linode.'), error);
      return <ErrorState errorText="Error while loading Linode." />;
    }

    return (
      <LinodeProvider value={{ linode }}>
        <React.Fragment>
          {this.state.showPendingMutation && (
            <Notice important warning>
              {`This Linode has pending upgrades available. To learn more about
          this upgrade and what it includes, `}
              {/** @todo change onClick to open mutate drawer once migrate exists */}
              <span
                className={this.props.classes.pendingMutationLink}
                onClick={this.openMutateDrawer}
              >
                click here.
              </span>
            </Notice>
          )}
          {(linode._notifications || []).map((n, idx) =>
            ['migration_scheduled', 'migration_pending'].includes(n.type) ? (
              linode.status !== 'migrating' && (
                // <MigrationNotification
                //   key={idx}
                //   text={n.message}
                //   type={n.type}
                //   onClick={this.migrate}
                // />
                <Notice important warning>
                  {n.message}
                  {n.type === 'migration_scheduled'
                    ? ' To enter the migration queue right now, please '
                    : ' To schedule your migration, please '}
                  <span
                    className={this.props.classes.migrationLink}
                    onClick={() => this.migrate(n.type)}
                  >
                    click here
                  </span>
                  .
                </Notice>
              )
            ) : (
              <ProductNotification
                key={idx}
                severity={n.severity}
                text={n.message}
              />
            )
          )}
        </React.Fragment>
        <Grid container justify="space-between">
          <Grid item className={this.props.classes.titleWrapper}>
            <Breadcrumb
              linkTo="/linodes"
              linkText="Linodes"
              labelTitle={linode.label}
              labelOptions={{ linkTo: getLabelLink() }}
              onEditHandlers={{
                onEdit: this.updateLabel,
                onCancel: this.cancelUpdate,
                errorText: labelInput.errorText
              }}
            />
          </Grid>
          <Grid item className={this.props.classes.controls}>
            <Button
              onClick={this.launchLish}
              className={this.props.classes.launchButton}
              data-qa-launch-console
              disableFocusRipple={true}
              disableRipple={true}
            >
              Launch Console
            </Button>
            <LinodePowerControl
              status={linode.status}
              recentEvent={linode.recentEvent}
              id={linode.id}
              label={linode.label}
              openConfigDrawer={this.openConfigDrawer}
            />
          </Grid>
        </Grid>
        <React.Fragment>
          {linodeInTransition(linode.status, linode.recentEvent) && (
            <LinodeBusyStatus
              status={linode.status}
              recentEvent={linode.recentEvent}
            />
          )}
          <AppBar position="static" color="default">
            <Tabs
              value={tabs.findIndex(tab => matches(tab.routeName))}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
            >
              {tabs.map(tab => (
                <Tab
                  key={tab.title}
                  label={tab.title}
                  data-qa-tab={tab.title}
                  component={() => (
                    <TabLink to={tab.routeName} title={tab.title} />
                  )}
                />
              ))}
            </Tabs>
          </AppBar>
          <Switch>
            <Route
              exact
              path={`/linodes/:linodeId/summary`}
              component={LinodeSummary}
            />
            <Route
              exact
              path={`/linodes/:linodeId/volumes`}
              render={routeProps => (
                <VolumesLanding
                  linodeId={linode.id}
                  linodeLabel={linode.label}
                  linodeRegion={linode.region}
                  linodeConfigs={linode._configs}
                  {...routeProps}
                />
              )}
            />
            <Route
              exact
              path={`/linodes/:linodeId/networking`}
              component={LinodeNetworking}
            />
            <Route
              exact
              path={`/linodes/:linodeId/resize`}
              component={LinodeResize}
            />
            <Route
              exact
              path={`/linodes/:linodeId/rescue`}
              component={LinodeRescue}
            />
            <Route
              exact
              path={`/linodes/:linodeId/rebuild`}
              component={LinodeRebuild}
            />
            <Route
              exact
              path={`/linodes/:linodeId/backup`}
              component={LinodeBackup}
            />
            <Route
              exact
              path={`/linodes/:linodeId/settings`}
              component={LinodeSettings}
            />
            {/* 404 */}
            <Redirect to={`${url}/summary`} />
          </Switch>
        </React.Fragment>
        <LinodeConfigSelectionDrawer
          onClose={this.closeConfigDrawer}
          onSubmit={this.submitConfigChoice}
          onChange={this.selectConfig}
          open={configDrawer.open}
          configs={configDrawer.configs}
          selected={String(configDrawer.selected)}
          error={configDrawer.error}
        />
        {this.state.showPendingMutation && linode && (
          <MutateDrawer
            linodeId={linode.id}
            open={mutateDrawer.open}
            loading={mutateDrawer.loading}
            error={mutateDrawer.error}
            handleClose={this.closeMutateDrawer}
            mutateInfo={mutateInfo!}
            currentTypeInfo={{
              vcpus: linode.specs.vcpus,
              transfer: linode.specs.transfer,
              disk: linode.specs.disk,
              memory: linode.specs.memory,
              network_out: this.state.currentNetworkOut
            }}
            initMutation={this.initMutation}
          />
        )}
      </LinodeProvider>
    );
  }
}

const matches = (p: string) => {
  return Boolean(matchPath(p, { path: location.pathname }));
};

const reloadable = reloadableWithRouter<CombinedProps, MatchProps>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.linodeId !==
      routePropsNew.match.params.linodeId
    );
  }
);

interface DispatchProps {
  actions: {
    getLinodeVolumes: () => void;
    getLinodeDisks: () => void;
    getNotifications: () => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, RouteProps> = (
  dispatch: ThunkDispatch,
  ownProps
) => {
  const {
    match: {
      params: { linodeId }
    }
  } = ownProps;

  return {
    actions: {
      getNotifications: () => dispatch(requestNotifications()),
      getLinodeVolumes:
        typeof linodeId === 'string'
          ? () => dispatch(_getLinodeVolumes(+linodeId))
          : () => null,
      getLinodeDisks:
        typeof linodeId === 'string'
          ? () => dispatch(_getLinodeDisks(+linodeId))
          : () => null
    }
  };
};

const connected = connect(
  undefined,
  mapDispatchToProps
);

const styled = withStyles(styles);

const enhanced = composeC(
  reloadable,
  /** Maps the Linode ID from the route param to a number as a top level prop. */
  withProps((ownProps: RouteProps) => ({
    linodeId: Number(ownProps.match.params.linodeId)
  })),
  linodesDetailContainer,
  withTypes(),
  styled,
  connected,
  LinodeDetailErrorBoundary,
  withSnackbar,
  withLinodeActions
);

export default enhanced(LinodeDetail);
