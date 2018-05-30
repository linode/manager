import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import { compose, pathOr } from 'ramda';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';

import {
  getNodeBalancer, updateNodeBalancer,
  getNodeBalancerConfigs,
} from 'src/services/nodebalancers';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
// import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import NodeBalancerSettings from './NodeBalancerSettings';

import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import ErrorState from 'src/components/ErrorState';
import setDocs from 'src/components/DocsSidebar/setDocs';
import EditableText from 'src/components/EditableText';

import NodeBalancerSummary from './NodeBalancerSummary';


type ClassNames = 'root'
  | 'titleWrapper'
  | 'backButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    margin: '2px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
});

type RouteProps = RouteComponentProps<{ nodeBalancerId?: number }>;

interface PreloadedProps {
  nodeBalancer: PromiseLoaderResponse<Linode.ExtendedNodeBalancer>;
}

interface Props { }

interface State {
  nodeBalancer: Linode.ExtendedNodeBalancer;
  error?: Error;
  ApiError: Linode.ApiFieldError[] | undefined;
}

type CombinedProps = Props &
  RouteProps &
  PreloadedProps &
  WithStyles<ClassNames>;

const preloaded = PromiseLoader<CombinedProps>({
  nodeBalancer: ({ match: { params: { nodeBalancerId } } }) => {
    if (!nodeBalancerId) {
      return Promise.reject(new Error('nodeBalancerId param not set.'));
    }

    return getNodeBalancer(nodeBalancerId).then((nodeBalancer) => {
      return getNodeBalancerConfigs(nodeBalancer.id)
        .then(({ data: configs }) => {
          return {
            ...nodeBalancer,
            down: configs
              .reduce((acc: number, config) => {
                return acc + config.nodes_status.down;
              }, 0), // add the downtime for each config together
            up: configs
              .reduce((acc: number, config) => {
                return acc + config.nodes_status.up;
              }, 0), // add the uptime for each config together
            ports: configs
              .reduce((acc: [number], config) => {
                return [...acc, config.port];
              }, []),
          };
        })
        .catch(e => []);
    });
  },
});

class NodeBalancerDetail extends React.Component<CombinedProps, State> {
  state: State = {
    nodeBalancer: pathOr(undefined, ['response'], this.props.nodeBalancer),
    error: pathOr(undefined, ['error'], this.props.nodeBalancer),
    ApiError: undefined,
  };

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  updateLabel = (label: string) => {
    const { nodeBalancer } = this.state;
    updateNodeBalancer(nodeBalancer.id, { label })
      .catch((error) => {
        error.response.data.errors.map((error: Linode.ApiFieldError) =>
          sendToast(error.reason, 'error'));
        this.setState(() => ({
          ApiError: error.response && error.response.data && error.response.data.errors,
          nodeBalancer,
        }));
      });
  }

  static docs: Linode.Doc[] = [
    {
      title: 'Getting Started with NodeBalancers',
      src: 'https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/',
      body: `Using a NodeBalancer to begin managing a simple web application`,
    },
    {
      title: 'NodeBalancer Reference Guide',
      src: 'https://www.linode.com/docs/platform/nodebalancer/nodebalancer-reference-guide/',
      body: `NodeBalancer Reference Guide`,
    },
  ];

  tabs = [
    { routeName: `${this.props.match.url}/summary`, title: 'Summary' },
    { routeName: `${this.props.match.url}/configurations`, title: 'Configurations' },
    { routeName: `${this.props.match.url}/settings`, title: 'Settings' },
  ];

  render() {
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));
    const { match: { path, url }, history, classes } = this.props;
    const { error, nodeBalancer } = this.state;

    /** Empty State */
    if (!nodeBalancer) { return null; }

    /** Error State */
    if (error) {
      return (
        <ErrorState
          errorText="There was an error retrieving your NodeBalancer. Please reload and try again."
        />
      );
    }

    // @TODO refactor error messages for invalid label changes pending PR M3-422
    // const hasErrorFor = getAPIErrorsFor({ label: 'label' }, this.state.ApiError);

    return (
      <React.Fragment>
        <Grid container justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <IconButton
              onClick={() => history.goBack()}
              className={classes.backButton}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <EditableText
              variant="headline"
              text={nodeBalancer.label}
              onEdit={this.updateLabel}
              data-qa-label
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
            {
              this.tabs.map(tab =>
                <Tab key={tab.title} label={tab.title} />,
              )
            }
          </Tabs>
        </AppBar>
        <Switch>
          <Route
            exact
            path={`${path}/summary`}
            render={() =>
              <NodeBalancerSummary nodeBalancer={nodeBalancer} />
            }
          />
          <Route exact path={`${path}/configurations`} render={() => <div>Hello World</div>} />
          <Route exact path={`${path}/settings`} render={() =>
          <NodeBalancerSettings
            nodeBalancerId={nodeBalancer.id}
            nodeBalancerLabel={nodeBalancer.label}
            nodeBalancerClientConnThrottle={nodeBalancer.client_conn_throttle}
            />} />
          {/* 404 */}
          < Redirect to={`${url}/summary`} />
        </Switch>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });
const reloaded = reloadableWithRouter<PreloadedProps, { nodeBalancerId?: number }>(
  (routePropsOld, routePropsNew) => {
    return routePropsOld.match.params.nodeBalancerId !== routePropsNew.match.params.nodeBalancerId;
  },
);

export default compose(
  setDocs(NodeBalancerDetail.docs),
  reloaded,
  styled,
  preloaded,
)(NodeBalancerDetail);
