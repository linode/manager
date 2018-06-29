import * as React from 'react';

import { allPass, filter, has, pathEq, pathOr } from 'ramda';

import * as moment from 'moment';

import { Link, matchPath, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

import { Location } from 'history';

import { Observable, Subscription  } from 'rxjs/Rx';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import { KeyboardArrowLeft } from '@material-ui/icons';

import notifications$ from 'src/notifications';
import { getImage } from 'src/services/images';
import {
  getLinode,
  getLinodeConfigs,
  getLinodeDisks,
  getLinodeVolumes,
  renameLinode,
} from 'src/services/linodes';

import LinodeConfigSelectionDrawer from 'src/features/LinodeConfigSelectionDrawer';

import { events$ } from 'src/events';
import { newLinodeEvents } from 'src/features/linodes/events';
import { weblishLaunch } from 'src/features/Weblish';

import EditableText from 'src/components/EditableText';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import ProductNotification from 'src/components/ProductNotification';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { linodeInTransition } from 'src/features/linodes/transitions';

import LinodeBackup from './LinodeBackup';
import LinodeBusyStatus from './LinodeSummary/LinodeBusyStatus';
import LinodeNetworking from './LinodeNetworking';
import LinodePowerControl from './LinodePowerControl';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import LinodeSettings from './LinodeSettings';
import LinodeSummary from './LinodeSummary';
import LinodeVolumes from './LinodeVolumes';
import reloadableWithRouter from './reloadableWithRouter';

interface Data {
  linode: Linode.Linode;
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes: Linode.Volume[];
  configs: Linode.Config[];
  disks: Linode.Disk[];
}

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: (id: number) => void;
}

interface State {
  configDrawer: ConfigDrawerState;
  notifications?: Linode.Notification[];
  linode: Linode.Linode & { recentEvent?: Linode.Event };
  labelInput: {
    label: string;
    errorText: string;
  };
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes?: Linode.Volume[];
  configs?: Linode.Config[];
  disks?: Linode.Disk[];
}

type MatchProps = { linodeId?: number };

type RouteProps = RouteComponentProps<MatchProps>;

interface PreloadedProps {
  data: PromiseLoaderResponse<Data>;
}

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

const requestAllTheThings = (linodeId: number) =>
  getLinode(linodeId)
    .then((response) => {
      const { data: linode } = response;

      const imageReq = getImage(linode.image!)
        .catch(err => undefined);

      const volumesReq = getLinodeVolumes(linode.id)
        .then(response => response.data)
        .catch(err => []);

      const configsRequest = getLinodeConfigs(linode.id)
        .then(response => response.data)
        .catch(err => []);

      const disksRequest = getLinodeDisks(linode.id)
        .then(response => response.data)
        .catch(err => []);

      return Promise.all([imageReq, volumesReq, configsRequest, disksRequest])
        .then((responses) => {
          return {
            linode,
            image: responses[0],
            volumes: responses[1],
            configs: responses[2],
            disks: responses[3],
          };
        });
    });

type CombinedProps = RouteProps & PreloadedProps & WithStyles<ClassNames>;

const preloaded = PromiseLoader<CombinedProps>({
  data: ((props) => {
    const { match: { params: { linodeId } } } = props;
    return requestAllTheThings(linodeId!);
  }),
});

class LinodeDetail extends React.Component<CombinedProps, State> {
  eventsSubscription: Subscription;
  volumeEventsSubscription: Subscription;
  notificationsSubscription: Subscription;
  mounted: boolean = false;

  state: State = {
    linode: this.props.data.response.linode,
    image: this.props.data.response.image,
    volumes: this.props.data.response.volumes,
    configs: this.props.data.response.configs,
    disks: this.props.data.response.disks,
    labelInput: {
      label: pathOr(undefined, ['linode', 'label'], this.props.data.response),
      errorText: '',
    },
    configDrawer: {
      open: false,
      configs: [],
      error: undefined,
      selected: undefined,
      action: (id: number) => null,
    },
  };

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    const { location } = this.props;
    const { location: nextLocation } = nextProps;

    return haveAnyBeenModified<State>(
      this.state,
      nextState,
      ['linode', 'image', 'volumes', 'configs', 'disks', 'configDrawer', 'labelInput'],
    )
      || haveAnyBeenModified<Location>(location, nextLocation, ['pathname', 'search']);
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventsSubscription.unsubscribe();
    this.notificationsSubscription.unsubscribe();
    this.volumeEventsSubscription.unsubscribe();
  }

  componentDidMount() {
    this.mounted = true;
    const mountTime = moment().subtract(5, 'seconds');
    this.eventsSubscription = events$
      .filter(pathEq(['entity', 'id'], Number(this.props.match.params.linodeId)))
      .filter(newLinodeEvents(mountTime))
      .debounce(() => Observable.timer(1000))
      .subscribe((linodeEvent) => {
        const { match: { params: { linodeId } } } = this.props;
        requestAllTheThings(linodeId!)
          .then(({ linode, image, volumes, configs, disks }) => {
            this.setState({ 
              linode: {...linode, recentEvent: linodeEvent },
              image, volumes, configs, disks });
          });
      });

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
        const { match: { params: { linodeId } } } = this.props;
        getLinodeVolumes(linodeId!)
          .then((response) => {
            this.setState({ volumes: response.data });
          });
      });

    this.notificationsSubscription = notifications$
      .map(filter(allPass([
        pathEq(['entity', 'id'], pathOr(undefined, ['id'], this.state.linode)),
        has('message'),
      ])))
      .subscribe((notifications: Linode.Notification[]) =>
        this.setState({ notifications }));
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
        open: true,
        configs,
        selected: configs[0].id,
        action,
      },
    });
  }

  closeConfigDrawer = () => {
    this.setState({
      configDrawer: {
        open: false,
        configs: [],
        error: undefined,
        selected: undefined,
        action: (id: number) => null,
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
    const { linode } = this.state;
    renameLinode(linode.id, label)
      .then(() => {
        this.setState({ labelInput: { label, errorText: '' }, linode: { ...linode, label } });
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
    this.setState({ labelInput: { label: this.state.linode.label, errorText: '' } });
    this.forceUpdate();
  }

  render() {
    const { match: { url }, classes } = this.props;
    const {
      image,
      volumes,
      linode,
      labelInput,
      configs,
      configDrawer,
      disks,
    } = this.state;
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));

    if (!linode) {
      return <NotFound />;
    }

    return (
      <React.Fragment>
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
              onClick={() => weblishLaunch(`${linode.id}`)}
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
        {linodeInTransition(linode.status, linode.recentEvent) &&
          <LinodeBusyStatus status={linode.status} recentEvent={linode.recentEvent} />
        }
        {
          (this.state.notifications || []).map((n, idx) =>
            <ProductNotification key={idx} severity={n.severity} text={n.message} />)
        }
        <Switch>
          <Route exact path={`${url}/summary`} render={() => (
            <LinodeSummary linode={linode} image={image} volumes={(volumes || [])} />
          )} />
          <Route exact path={`${url}/volumes`} render={() => (
            <LinodeVolumes
              linodeID={linode.id}
              linodeLabel={linode.label}
              linodeRegion={linode.region}
              linodeVolumes={volumes}
            />
          )} />
          <Route exact path={`${url}/networking`} render={() => (
            <LinodeNetworking
              linodeID={linode.id}
              linodeLabel={linode.label}
              linodeRegion={linode.region}
            />
          )} />
          <Route exact path={`${url}/rescue`} render={() => (
            <LinodeRescue
              linodeId={linode.id}
              linodeRegion={linode.region}
            />
          )} />
          <Route exact path={`${url}/resize`} render={() => (
            <LinodeResize linodeId={linode.id} linodeType={linode.type} />
          )} />
          <Route exact path={`${url}/rebuild`} render={() => (
            <LinodeRebuild linodeId={linode.id} />
          )} />
          <Route exact path={`${url}/backup`} render={() => (
            <LinodeBackup
              linodeID={linode.id}
              linodeRegion={linode.region}
              linodeType={linode.type}
              backupsEnabled={linode.backups.enabled}
              backupsSchedule={linode.backups.schedule}
              linodeInTransition={linodeInTransition(linode.status, linode.recentEvent)}
            />
          )} />
          <Route exact path={`${url}/settings`} render={() => (
            <LinodeSettings
              linodeId={linode.id}
              linodeLabel={linode.label}
              linodeAlerts={linode.alerts}
              linodeConfigs={configs || []}
              linodeMemory={linode.specs.memory}
              linodeTotalDisk={linode.specs.disk}
              linodeRegion={linode.region}
              linodeStatus={linode.status}
              linodeDisks={disks || []}
              linodeWatchdogEnabled={linode.watchdog_enabled || false}
            />
          )} />
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
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default reloadableWithRouter<PreloadedProps, MatchProps>(
  (routePropsOld, routePropsNew) => {
    return routePropsOld.match.params.linodeId !== routePropsNew.match.params.linodeId;
  },
)((styled(preloaded(LinodeDetail))));
