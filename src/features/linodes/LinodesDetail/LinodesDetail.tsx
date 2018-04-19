import * as React from 'react';
import Axios from 'axios';
import { pathEq, pathOr } from 'ramda';
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
import { Subscription } from 'rxjs/Rx';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';

import reloadableWithRouter from './reloadableWithRouter';
import { events$ } from 'src/events';
import { newLinodeEvents } from 'src/features/linodes/events';
import { API_ROOT } from 'src/constants';
import EditableText from 'src/components/EditableText';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import { weblishLaunch } from 'src/features/Weblish';
import LinodeSummary from './LinodeSummary';
import LinodeVolumes from './LinodeVolumes';
import LinodeNetworking from './LinodeNetworking';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import LinodeBackup from './LinodeBackup';
import LinodeSettings from './LinodeSettings';
import LinodePowerControl from './LinodePowerControl';
import LinodeConfigSelectionDrawer from 'src/features/LinodeConfigSelectionDrawer';
import { sendToast } from 'src/features/ToastNotifications/toasts';

interface Data {
  linode: Linode.Linode;
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes: Linode.Volume[];
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
  linode: Linode.Linode & { recentEvent?: Linode.Event };
}

type MatchProps = { linodeId?: number };

type RouteProps = RouteComponentProps<MatchProps>;

interface PreloadedProps {
  data: PromiseLoaderResponse<Data>;
}

type ClassNames = 'launchButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  launchButton: {
    marginRight: theme.spacing.unit,
    padding: '12px 16px 13px',
    minHeight: 49,
    marginTop: 1,
    transition: theme.transitions.create(['background-color', 'color']),
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  },
});

type CombinedProps = RouteProps & PreloadedProps & WithStyles<ClassNames>;

const preloaded = PromiseLoader<CombinedProps>({
  data: ((props) => {
    const { match: { params: { linodeId } } } = props;
    return Axios.get(`${API_ROOT}/linode/instances/${linodeId}`)
      .then((response) => {
        const { data: linode } = response;

        const typeReq = Axios.get(`${API_ROOT}/linode/types/${linode.type}`)
          .then(response => response.data)
          .catch(err => undefined);

        const imageReq = Axios.get(`${API_ROOT}/images/${linode.image}`)
          .then(response => response.data)
          .catch(err => undefined);

        const volumesReq = Axios.get(`${API_ROOT}/linode/instances/${linode.id}/volumes`)
          .then(response => response.data.data)
          .catch(err => []);

        return Promise.all([typeReq, imageReq, volumesReq])
          .then((responses) => {
            return {
              linode,
              type: responses[0],
              image: responses[1],
              volumes: responses[2],
            };
          });
      });
  }),
});

class LinodeDetail extends React.Component<CombinedProps, State> {
  subscription: Subscription;
  mounted: boolean = false;

  state = {
    linode: this.props.data.response.linode,
    configDrawer: {
      open: false,
      configs: [],
      error: undefined,
      selected: undefined,
      action: (id: number) => null,
    },
  };

  componentWillUnmount() {
    this.mounted = false;
    this.subscription.unsubscribe();
  }

  componentDidMount() {
    this.mounted = true;
    const mountTime = moment().subtract(5, 'seconds');
    this.subscription = events$
      .filter(newLinodeEvents(mountTime))
      .filter(pathEq(['entity', 'id'], Number(this.props.match.params.linodeId)))
      .subscribe((linodeEvent) => {
        Axios.get(`${API_ROOT}/linode/instances/${(linodeEvent.entity as Linode.Entity).id}`)
          .then(response => response.data)
          .then((linode) => {
            if (!this.mounted) { return; }

            this.setState(() => {
              linode.recentEvent = linodeEvent;
              return { linode };
            });
          });
      });
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
    { routeName: `${this.props.match.url}/backup`, title: 'Backup' },
    { routeName: `${this.props.match.url}/settings`, title: 'Setttings' },
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
    if (selected) {
      action(selected);
      this.closeConfigDrawer();
    }
  }

  updateLabel = (label: string) => {
    const { linode } = this.state;
    Axios.put(`${API_ROOT}/linode/instances/${linode.id}`, { label })
      .catch((err) => {
        const errors: Linode.ApiFieldError[] = pathOr([], ['response', 'data', 'errors'], err);
        errors.forEach(e => sendToast(e.reason, 'error'));
        this.setState({ linode });
      });
  }

  render() {
    const { match: { url }, classes } = this.props;
    const { type, image, volumes } = this.props.data.response;
    const { linode, configDrawer } = this.state;
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));

    return (
      <React.Fragment>
        <Grid container justify="space-between">
          <Grid item style={{ flex: 1 }}>
            <EditableText
              variant="headline"
              text={linode.label}
              onEdit={this.updateLabel}
            />
          </Grid>
          <Grid item>
            <Button
              onClick={() => weblishLaunch(`${linode.id}`)}
              className={classes.launchButton}
            >
              Launch Console
            </Button>
          </Grid>
          <Grid item>
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
          >
            {this.tabs.map(tab => <Tab key={tab.title} label={tab.title} />)}
          </Tabs>
        </AppBar>
        <Switch>
          <Route exact path={`${url}/summary`} render={() => (
            <LinodeSummary linode={linode} type={type} image={image} volumes={volumes} />
          )} />
          <Route exact path={`${url}/volumes`} render={() => (
            <LinodeVolumes
              linodeID={linode.id}
              linodeLabel={linode.label}
              linodeRegion={linode.region}
              linodeVolumes={volumes}
            />
          )} />
          <Route exact path={`${url}/networking`} render={() => (<LinodeNetworking />)} />
          <Route exact path={`${url}/rescue`} render={() => (<LinodeRescue />)} />
          <Route exact path={`${url}/resize`} render={() => (<LinodeResize />)} />
          <Route exact path={`${url}/rebuild`} render={() => (<LinodeRebuild />)} />
          <Route exact path={`${url}/backup`} render={() => (<LinodeBackup />)} />
          <Route exact path={`${url}/settings`} render={() => (<LinodeSettings />)} />
          {/* 404 */}
          <Route exact render={() => (<Redirect to={`${url}/summary`} />)} />
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
