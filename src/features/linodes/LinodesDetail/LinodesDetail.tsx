import * as React from 'react';
import { pathEq, pathOr, filter, has, allPass } from 'ramda';
import * as moment from 'moment';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import {
  matchPath,
  Route,
  Switch,
  RouteComponentProps,
  Redirect,
} from 'react-router-dom';
import { Location } from 'history';
import { Subscription, Observable } from 'rxjs/Rx';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';

import notifications$ from 'src/notifications';
import { getImage } from 'src/services/images';
import {
  getLinode, getType, getLinodeVolumes, renameLinode, getLinodeConfigs,
} from 'src/services/linodes';
import { events$ } from 'src/events';

import { newLinodeEvents } from 'src/features/linodes/events';
import { weblishLaunch } from 'src/features/Weblish';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import LinodeConfigSelectionDrawer from 'src/features/LinodeConfigSelectionDrawer';
import EditableText from 'src/components/EditableText';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import ProductNotification from 'src/components/ProductNotification';

import LinodeSummary from './LinodeSummary';
import LinodeVolumes from './LinodeVolumes';
import LinodeNetworking from './LinodeNetworking';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import LinodeBackup from './LinodeBackup';
import LinodeSettings from './LinodeSettings';
import LinodePowerControl from './LinodePowerControl';
import reloadableWithRouter from './reloadableWithRouter';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';

interface Data {
  linode: Linode.Linode;
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes: Linode.Volume[];
  configs: Linode.Config[];
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
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes?: Linode.Volume[];
  configs?: Linode.Config[];
}

type MatchProps = { linodeId?: number };

type RouteProps = RouteComponentProps<MatchProps>;

interface PreloadedProps {
  data: PromiseLoaderResponse<Data>;
}

type ClassNames = 'cta'
  | 'launchButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  cta: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      margin: `${theme.spacing.unit * 2}px 0`,
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

      const typeReq = getType(linode.type)
        .catch(err => undefined);

      const imageReq = getImage(linode.image)
        .then(response => response.data)
        .catch(err => undefined);

      const volumesReq = getLinodeVolumes(linode.id)
        .then(response => response.data)
        .catch(err => []);

      const configsRequest = getLinodeConfigs(linode.id)
        .then(response => response.data)
        .catch(err => []);

      return Promise.all([typeReq, imageReq, volumesReq, configsRequest])
        .then((responses) => {
          return {
            linode,
            type: responses[0],
            image: responses[1],
            volumes: responses[2],
            configs: responses[3],
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
  notificationsSubscription: Subscription;
  mounted: boolean = false;

  state: State = {
    linode: this.props.data.response.linode,
    type: this.props.data.response.type,
    image: this.props.data.response.image,
    volumes: this.props.data.response.volumes,
    configs: this.props.data.response.configs,
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
      ['linode', 'type', 'image', 'volumes', 'configs', 'configDrawer'],
    )
      || haveAnyBeenModified<Location>(location, nextLocation, ['pathname', 'search']);
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventsSubscription.unsubscribe();
    this.notificationsSubscription.unsubscribe();
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
          .then(({ linode, type, image, volumes, configs }) => {
            this.setState({ linode, type, image, volumes, configs });
          });
      });

    this.notificationsSubscription = notifications$
      .map(filter(allPass([
        pathEq(['entity', 'id'], this.state.linode.id),
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

  updateLabel = (label: string) => {
    const { linode } = this.state;
    renameLinode(linode.id, label)
      .catch((err) => {
        const errors: Linode.ApiFieldError[] = pathOr([], ['response', 'data', 'errors'], err);
        errors.forEach(e => sendToast(e.reason, 'error'));
        this.setState({ linode });
      });
  }

  render() {
    const { match: { url }, classes } = this.props;
    const {
      type,
      image,
      volumes,
      linode,
      configs,
      configDrawer,
    } = this.state;
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));
    if (!type) { return null; }

    return (
      <React.Fragment>
        <Grid
          container
          justify="space-between"
        >
          <Grid item style={{ flex: 1 }}>
            <EditableText
              variant="headline"
              text={linode.label}
              onEdit={this.updateLabel}
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
        {
          (this.state.notifications || []).map((n, idx) =>
            <ProductNotification key={idx} severity={n.severity} text={n.message} />)
        }
        <Switch>
          <Route exact path={`${url}/summary`} render={() => (
            <LinodeSummary linode={linode} type={type} image={image} volumes={(volumes || [])} />
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
            />
          )} />
          <Route exact path={`${url}/rescue`} render={() => (
            <LinodeRescue
              linodeId={linode.id}
              linodeRegion={linode.region}
            />
          )} />
          <Route exact path={`${url}/resize`} render={() => (
            <LinodeResize
              linodeId={linode.id}
              type={type}
            />
          )} />
          <Route exact path={`${url}/rebuild`} render={() => (
            <LinodeRebuild linodeId={linode.id} />
          )} />
          <Route exact path={`${url}/backup`} render={() => (
            <LinodeBackup
              linodeID={linode.id}
              linodeRegion={linode.region}
              backupsEnabled={linode.backups.enabled}
              backupsSchedule={linode.backups.schedule}
              backupsMonthlyPrice={
                pathOr(undefined, ['addons', 'backups', 'price', 'monthly'], type)
              }
            />
          )} />
          <Route exact path={`${url}/settings`} render={() => (
            <LinodeSettings
              linodeId={linode.id}
              linodeLabel={linode.label}
              linodeAlerts={linode.alerts}
              linodeConfigs={configs || []}
              linodeMemory={type.memory}
              linodeRegion={linode.region}
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
