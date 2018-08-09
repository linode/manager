import { Location } from 'history';
import * as moment from 'moment';
import { allPass, compose, filter, has, Lens, lensPath, pathEq, pathOr, set } from 'ramda';
import * as React from 'react';
import { Link, matchPath, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import CircleProgress from 'src/components/CircleProgress';
import EditableText from 'src/components/EditableText';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import ProductNotification from 'src/components/ProductNotification';
import { events$ } from 'src/events';
import { reportException } from 'src/exceptionReporting';
import LinodeConfigSelectionDrawer from 'src/features/LinodeConfigSelectionDrawer';
import { newLinodeEvents } from 'src/features/linodes/events';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish';
import notifications$ from 'src/notifications';
import { Requestable } from 'src/requestableContext';
import { getImage } from 'src/services/images';
import { getLinode, getLinodeConfigs, getLinodeDisks, getLinodeVolumes, renameLinode } from 'src/services/linodes';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { ConfigsProvider, DisksProvider, ImageProvider, LinodeProvider, VolumesProvider } from './context';
import LinodeBackup from './LinodeBackup';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import LinodeNetworking from './LinodeNetworking';
import LinodePowerControl from './LinodePowerControl';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import LinodeSettings from './LinodeSettings';
import LinodeSummary from './LinodeSummary';
import LinodeBusyStatus from './LinodeSummary/LinodeBusyStatus';
import LinodeVolumes from './LinodeVolumes';
import reloadableWithRouter from './reloadableWithRouter';

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: (id: number) => void;
}

interface State {
  context: {
    configs: Requestable<Linode.Config[]>;
    disks: Requestable<Linode.Disk[]>;
    image: Requestable<Linode.Image>;
    linode: Requestable<Linode.Linode>;
    volumes: Requestable<Linode.Volume[]>;
  };
  configDrawer: ConfigDrawerState;
  labelInput: { label: string; errorText: string; };
  notifications?: Linode.Notification[];
}

interface MatchProps { linodeId?: number };

type RouteProps = RouteComponentProps<MatchProps>;

type ClassNames = 'titleWrapper'
  | 'backButton'
  | 'cta'
  | 'launchButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  titleWrapper: {
    display: 'flex',
    marginTop: 5,
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  cta: {
    marginTop: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      display: 'flex',
      flexBasis: '100%',
    },
  },
  launchButton: {
    marginRight: theme.spacing.unit,
    padding: '12px 16px 13px',
    minHeight: 50,
    transition: theme.transitions.create(['background-color', 'color']),
    [theme.breakpoints.down('sm')]: {
      backgroundColor: theme.color.white,
      border: `1px solid ${theme.color.border1}`,
      marginTop: 0,
      minHeight: 51,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      borderColor: theme.palette.primary.main,
    },
  },
});

type CombinedProps = RouteProps & WithStyles<ClassNames>;

const labelInputLens = lensPath(['labelInput']);
const configsLens = lensPath(['context', 'configs']);
const disksLens = lensPath(['context', 'disks']);
const imageLens = lensPath(['context', 'image']);
const linodeLens = lensPath(['context', 'linode']);
const volumesLens = lensPath(['context', 'volumes']);

const L = {
  configs: {
    configs: configsLens,
    data: compose(configsLens, lensPath(['data'])) as Lens,
    errors: compose(configsLens, lensPath(['errors'])) as Lens,
    lastUpdated: compose(configsLens, lensPath(['lastUpdated'])) as Lens,
    loading: compose(configsLens, lensPath(['loading'])) as Lens,
    request: compose(configsLens, lensPath(['request'])) as Lens,
  },
  disks: {
    data: compose(disksLens, lensPath(['data'])) as Lens,
    disks: disksLens,
    errors: compose(disksLens, lensPath(['errors'])) as Lens,
    lastUpdated: compose(disksLens, lensPath(['lastUpdated'])) as Lens,
    loading: compose(disksLens, lensPath(['loading'])) as Lens,
    request: compose(disksLens, lensPath(['request'])) as Lens,
  },
  image: {
    data: compose(imageLens, lensPath(['data'])) as Lens,
    errors: compose(imageLens, lensPath(['errors'])) as Lens,
    image: imageLens,
    lastUpdated: compose(imageLens, lensPath(['lastUpdated'])) as Lens,
    loading: compose(imageLens, lensPath(['loading'])) as Lens,
    request: compose(imageLens, lensPath(['request'])) as Lens,
  },
  labelInput: {
    errorText: compose(labelInputLens, lensPath(['errorText'])) as Lens,
    label: compose(labelInputLens, lensPath(['label'])) as Lens,
    labelInput: labelInputLens,
  },
  linode: {
    data: compose(linodeLens, lensPath(['data'])) as Lens,
    errors: compose(linodeLens, lensPath(['errors'])) as Lens,
    lastUpdated: compose(linodeLens, lensPath(['lastUpdated'])) as Lens,
    linode: linodeLens,
    loading: compose(linodeLens, lensPath(['loading'])) as Lens,
    request: compose(linodeLens, lensPath(['request'])) as Lens,
  },
  volumes: {
    data: compose(volumesLens, lensPath(['data'])) as Lens,
    errors: compose(volumesLens, lensPath(['errors'])) as Lens,
    lastUpdated: compose(volumesLens, lensPath(['lastUpdated'])) as Lens,
    loading: compose(volumesLens, lensPath(['loading'])) as Lens,
    request: compose(volumesLens, lensPath(['request'])) as Lens,
    volumes: volumesLens,
  },
};

type StateSetter = <S>(v: S) => S;

class LinodeDetail extends React.Component<CombinedProps, State> {
  eventsSubscription: Subscription;

  volumeEventsSubscription: Subscription;

  notificationsSubscription: Subscription;

  diskResizeSubscription: Subscription;

  mounted: boolean = false;

  state: State = {
    configDrawer: {
      action: (id: number) => null,
      configs: [],
      error: undefined,
      open: false,
      selected: undefined,
    },
    context: {
      configs: {
        lastUpdated: 0,
        loading: true,
        request: () => {
          this.setState(set(L.configs.loading, true));

          return getLinodeConfigs(this.props.match.params.linodeId!)
            .then(({ data }) => {
              this.composeState(
                set(L.configs.loading, false),
                set(L.configs.data, data),
                set(L.configs.lastUpdated, Date.now()),
              );
              return data;
            })
            .catch((r) => {
              this.composeState(
                set(L.configs.lastUpdated, Date.now()),
                set(L.configs.loading, false),
                set(L.configs.errors, [{ field: 'none', reason: 'Could not load instance config for some reason.' }])
              );
            });
        },
        update: (updater) => {
          const { data: configs } = this.state.context.configs;
          if (!configs) { return }

          this.composeState(
            set(L.configs.data, updater(configs)),
          );
        },
      },
      disks: {
        lastUpdated: 0,
        loading: true,
        request: () => {
          this.setState(set(L.disks.loading, true));

          return getLinodeDisks(this.props.match.params.linodeId!)
            .then(({ data }) => {
              this.composeState(
                set(L.disks.loading, false),
                set(L.disks.data, data),
                set(L.disks.lastUpdated, Date.now()),
              );
              return data;
            })
            .catch((r) => {
              this.composeState(
                set(L.disks.lastUpdated, Date.now()),
                set(L.disks.loading, false),
                set(L.disks.errors, [{ field: 'none', reason: 'Could not load Linode disks for some reason.' }])
              );
            });
        },
        update: (updater) => {
          const { data: disks } = this.state.context.disks;
          if (!disks) { return }

          this.composeState(
            set(L.disks.data, updater(disks)),
          );
        },
      },
      image: {
        lastUpdated: 0,
        loading: true,
        request: (image: string) => {

          if (!image) {
            const i: Partial<Linode.Image> = { id: 'unknown', label: 'Unknown Image', type: 'Unknown', vendor: 'unknown' };
            this.composeState(
              set(L.image.lastUpdated, Date.now()),
              set(L.image.data, i),
            );

            return Promise.resolve();
          }

          this.setState(set(L.image.loading, true));

          return getImage(image)
            .then((data) => {
              this.composeState(
                set(L.image.loading, false),
                set(L.image.data, data),
                set(L.image.lastUpdated, Date.now()),
              );
              return data;
            })
            .catch((r) => {
              this.composeState(
                set(L.image.lastUpdated, Date.now()),
                set(L.image.loading, false),
                set(L.image.errors, [{ field: 'none', reason: 'Could not load Linode for some reason.' }])
              );
            });
        },
        update: (updater) => {
          const { data: image } = this.state.context.image;
          if (!image) { return }

          this.composeState(
            set(L.image.data, updater(image)),
          );
        },
      },
      linode: {
        lastUpdated: 0,
        loading: true,
        request: (recentEvent?: Linode.Event) => {
          this.setState(set(L.linode.loading, true));

          return getLinode(this.props.match.params.linodeId!)
            .then(({ data }) => {
              this.composeState(
                set(L.labelInput.label, data.label),
                set(L.linode.loading, false),
                set(L.linode.data, { ...data, recentEvent }),
                set(L.linode.lastUpdated, Date.now()),
              );
              return data;
            })
            .catch((r) => {
              this.composeState(
                set(L.linode.lastUpdated, Date.now()),
                set(L.linode.loading, false),
                set(L.linode.errors, [{ field: 'none', reason: 'Could not load instance for some reason.' }])
              );
            });
        },
        update: (updater) => {
          const { data: linode } = this.state.context.linode;
          if (!linode) { return }

          const updatedLinode = updater(linode);

          this.composeState(
            set(L.linode.data, updatedLinode),
            set(L.labelInput.label, updatedLinode.label),
          );
        },
      },
      volumes: {
        lastUpdated: 0,
        loading: true,
        request: () => {
          this.setState(set(L.volumes.loading, true));

          return getLinodeVolumes(this.props.match.params.linodeId!)
            .then(({ data }) => {
              this.composeState(
                set(L.volumes.loading, false),
                set(L.volumes.data, data),
                set(L.volumes.lastUpdated, Date.now()),
              );
              return data;
            })
            .catch((r) => {
              this.composeState(
                set(L.volumes.lastUpdated, Date.now()),
                set(L.volumes.loading, false),
                set(L.volumes.errors, [{ field: 'none', reason: 'Could not load Linode for some reason.' }])
              );
            });
        },
        update: (updater) => {
          const { data: volumes } = this.state.context.volumes;
          if (!volumes) { return }

          this.composeState(
            set(L.volumes.data, updater(volumes)),
          );
        },
      },
    },
    labelInput: {
      label: '',
      errorText: '',
    },
  };

  composeState = (...fns: StateSetter[]) =>
    this.setState((state) => fns.reverse().reduce((result, current) => current(result), state));

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    const { location } = this.props;
    const { location: nextLocation } = nextProps;

    return haveAnyBeenModified<State>(
      this.state,
      nextState,
      ['context', 'configDrawer', 'labelInput'],
    )
      || haveAnyBeenModified<Location>(location, nextLocation, ['pathname', 'search']);
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventsSubscription.unsubscribe();
    this.diskResizeSubscription.unsubscribe();
    this.notificationsSubscription.unsubscribe();
    this.volumeEventsSubscription.unsubscribe();
  }

  componentDidMount() {
    this.mounted = true;

    const { context: { configs, disks, image, linode, volumes } } = this.state;
    const mountTime = moment().subtract(5, 'seconds');
    const { match: { params: { linodeId } } } = this.props;

    this.diskResizeSubscription = events$
      .filter((e) => !e._initial)
      .filter(pathEq(['entity', 'id'], Number(this.props.match.params.linodeId)))
      .filter((e) => e.status === 'finished' && e.action === 'disk_resize')
      .subscribe((e) => disks.request())

    this.eventsSubscription = events$
      .filter(pathEq(['entity', 'id'], Number(this.props.match.params.linodeId)))
      .filter(newLinodeEvents(mountTime))
      .debounce(() => Observable.timer(1000))
      .subscribe((linodeEvent) => {
        configs.request();
        disks.request();
        volumes.request();
        linode.request(linodeEvent)
          .then((l) => {
            if (l) { image.request(l.image) }
          })
          .catch(console.error);
      });

    /** Get events which are related to volumes and this Linode */
    this.volumeEventsSubscription = events$
      .filter(e => [
        'volume_attach',
        'volume_clone',
        'volume_create',
        'volume_delete',
        'volume_detach',
        'volume_resize',
      ].includes(e.action))
      .filter(e => !e._initial)
      .subscribe((v) => {
        volumes.request();
      });
    /** Get /notifications relevant to this Linode */
    this.notificationsSubscription = notifications$
      .map(filter(allPass([
        pathEq(['entity', 'id'], linodeId),
        has('message'),
      ])))
      .subscribe((notifications: Linode.Notification[]) =>
        this.setState({ notifications }));

    configs.request();
    disks.request();
    volumes.request();
    linode.request()
      .then((l) => {
        if (l) { image.request(l.image) }
      })
      .catch(console.error);
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${this.props.match.url}/summary`, title: 'Summary' },
    { routeName: `${this.props.match.url}/volumes`, title: 'Volumes' },
    { routeName: `${this.props.match.url}/networking`, title: 'Networking' },
    { routeName: `${this.props.match.url}/resize`, title: 'Resize' },
    { routeName: `${this.props.match.url}/rescue`, title: 'Rescue' },
    { routeName: `${this.props.match.url}/rebuild`, title: 'Rebuild' },
    { routeName: `${this.props.match.url}/backup`, title: 'Backups' },
    { routeName: `${this.props.match.url}/settings`, title: 'Settings' },
  ];

  openConfigDrawer = (configs: Linode.Config[], action: (id: number) => void) => {
    this.setState({
      configDrawer: {
        action,
        configs,
        open: true,
        selected: configs[0].id,
      },
    });
  }

  closeConfigDrawer = () => {
    this.setState({
      configDrawer: {
        action: (id: number) => null,
        configs: [],
        error: undefined,
        open: false,
        selected: undefined,
      },
    });
  }

  selectConfig = (id: number) => {
    this.setState(prevState => ({
      configDrawer: {
        ...prevState.configDrawer,
        selected: id,
      },
    }));
  }

  submitConfigChoice = () => {
    const { action, selected } = this.state.configDrawer;
    if (selected && action) {
      action(selected);
      this.closeConfigDrawer();
    }
  }

  // @TODO add support for multiple error messages
  // (Currently, including multiple error strings
  // breaks the layout)
  updateLabel = (label: string) => {
    const { data: linode } = this.state.context.linode;
    if (!linode) { return; }

    renameLinode(linode.id, label)
      .then((linodeResponse) => {
        this.composeState(
          set(L.linode.data, linodeResponse),
          set(L.labelInput.label, linodeResponse.label),
          set(L.labelInput.errorText, undefined),
        );
      })
      .catch((err) => {
        const errors: Linode.ApiFieldError[] = pathOr([], ['response', 'data', 'errors'], err);
        const errorStrings: string[] = errors.map(e => e.reason);
        this.setState({ labelInput: { label, errorText: errorStrings[0] } }, () => {
          scrollErrorIntoView();
        });
      });
  }

  cancelUpdate = () => {
    const { data: linode } = this.state.context.linode;
    if (!linode) { return; }

    this.setState({ labelInput: { label: linode.label, errorText: '' } });
    this.forceUpdate();
  }

  launchLish = () => {
    const { data: linode } = this.state.context.linode;
    lishLaunch(`${linode!.id}`);
  }

  render() {

    const { match: { url }, classes } = this.props;
    const {
      labelInput,
      configDrawer,
      context: {
        volumes: {
          data: volumes,
          lastUpdated: volumesLastUpdated,
          errors: volumesErrors,
        },
        linode: {
          data: linode,
          lastUpdated: linodeLastUpdated,
          errors: linodeErrors,
        },
        configs: {
          data: configs,
          lastUpdated: configsLastUpdated,
          errors: configsErrors,
        },
        disks: {
          data: disks,
          lastUpdated: disksLastUpdated,
          errors: disksErrors,
        },
      },
    } = this.state;

    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));

    const initialLoad =
      linodeLastUpdated === 0 ||
      volumesLastUpdated === 0 ||
      configsLastUpdated === 0 ||
      disksLastUpdated === 0;

    if (initialLoad) {
      return <CircleProgress />
    }

    if (!linode) {
      return <NotFound />;
    }

    if (linodeErrors) {
      reportException(
        Error('Error while loading Linode.'),
        linodeErrors,
      )
      return <ErrorState errorText="Error while loading Linode." />;
    }

    if (!volumes) {
      throw Error('Volumes undefined on LinodeLanding.');
    }

    if (volumesErrors) {
      reportException(
        Error('Error loading volumes data.'),
        volumesErrors,
      )
      return <ErrorState errorText="Error while loading volumes." />;
    }

    if (!configs) {
      throw Error('Configs undefined on LinodeLanding.');
    }

    if (configsErrors) {
      reportException(
        Error('Error loading configs data.'),
        configsErrors,
      )
      return <ErrorState errorText="Error while loading configurations." />;
    }

    if (!disks) {
      throw Error('Disks undefined on LinodeLanding.');
    }

    if (disksErrors) {
      reportException(
        Error('Error loading disks data.'),
        disksErrors,
      )
      return <ErrorState errorText="Error while loading disks." />;
    }

    return (
      <React.Fragment>
        <ConfigsProvider value={this.state.context.configs}>
          <DisksProvider value={this.state.context.disks}>
            <ImageProvider value={this.state.context.image}>
              <LinodeProvider value={this.state.context.linode}>
                <VolumesProvider value={this.state.context.volumes}>
                  <Grid
                    container
                    justify="space-between"
                  >
                    <Grid item className={classes.titleWrapper}>
                      <Link to={`/linodes`}>
                        <IconButton
                          className={classes.backButton}
                        >
                          <KeyboardArrowLeft />
                        </IconButton>
                      </Link>
                      <EditableText
                        role="header"
                        variant="headline"
                        text={labelInput.label}
                        errorText={labelInput.errorText}
                        onEdit={this.updateLabel}
                        onCancel={this.cancelUpdate}
                        data-qa-label
                      />
                    </Grid>
                    <Grid item className={classes.cta}>
                      <Button
                        onClick={this.launchLish}
                        className={classes.launchButton}
                        data-qa-launch-console
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
                  {linodeInTransition(linode.status, linode.recentEvent) &&
                    <LinodeBusyStatus status={linode.status} recentEvent={linode.recentEvent} />
                  }
                  <AppBar position="static" color="default">
                    <Tabs
                      value={this.tabs.findIndex(tab => matches(tab.routeName))}
                      onChange={this.handleTabChange}
                      indicatorColor="primary"
                      textColor="primary"
                      scrollable
                      scrollButtons="off"
                    >
                      {this.tabs.map(tab =>
                        <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title} />)}
                    </Tabs>
                  </AppBar>
                  {
                    (this.state.notifications || []).map((n, idx) =>
                      <ProductNotification key={idx} severity={n.severity} text={n.message} />)
                  }
                  <Switch>
                    <Route exact path={`${url}/summary`} component={LinodeSummary} />
                    <Route exact path={`${url}/volumes`} component={LinodeVolumes} />
                    <Route exact path={`${url}/networking`} component={LinodeNetworking} />
                    <Route exact path={`${url}/resize`} component={LinodeResize} />
                    <Route exact path={`${url}/rescue`} component={LinodeRescue} />
                    <Route exact path={`${url}/rebuild`} component={LinodeRebuild} />
                    <Route exact path={`${url}/backup`} component={LinodeBackup} />
                    <Route exact path={`${url}/settings`} component={LinodeSettings} />
                    {/* 404 */}
                    <Redirect to={`${url}/summary`} />
                  </Switch>
                  <LinodeConfigSelectionDrawer
                    onClose={this.closeConfigDrawer}
                    onSubmit={this.submitConfigChoice}
                    onChange={this.selectConfig}
                    open={configDrawer.open}
                    configs={configDrawer.configs}
                    selected={String(configDrawer.selected)}
                    error={configDrawer.error}
                  />
                </VolumesProvider>
              </LinodeProvider>
            </ImageProvider>
          </DisksProvider>
        </ConfigsProvider>
      </React.Fragment>
    );
  }

}

const styled = withStyles(styles, { withTheme: true });

const reloadable = reloadableWithRouter<CombinedProps, MatchProps>((routePropsOld, routePropsNew) => {
  return routePropsOld.match.params.linodeId !== routePropsNew.match.params.linodeId;
});

const enhanced = compose(
  styled,
  reloadable,
  LinodeDetailErrorBoundary,
);

export default enhanced(LinodeDetail);
