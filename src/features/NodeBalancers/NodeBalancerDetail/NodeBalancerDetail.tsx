import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { matchPath, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import  KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import setDocs from 'src/components/DocsSidebar/setDocs';
import EditableText from 'src/components/EditableText';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getNodeBalancer, getNodeBalancerConfigs, updateNodeBalancer } from 'src/services/nodebalancers';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import NodeBalancerConfigurations from './NodeBalancerConfigurations';
import NodeBalancerSettings from './NodeBalancerSettings';
import NodeBalancerSummary from './NodeBalancerSummary';

type ClassNames = 'root'
  | 'titleWrapper'
  | 'backButton';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  titleWrapper: {
    display: 'flex',
  },
  backButton: {
    margin: '5px 0 0 -16px',
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

interface State {
  nodeBalancer: Linode.ExtendedNodeBalancer;
  error?: Error;
  ApiError: Linode.ApiFieldError[] | undefined;
  labelInput?: string;
}

type CombinedProps = RouteProps &
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
    .then(() => {
      this.setState({ nodeBalancer: { ...nodeBalancer, label }, ApiError: undefined,
        labelInput: label });
    })
    .catch((error) => {
      this.setState(() => ({
        ApiError: error.response && error.response.data && error.response.data.errors,
        labelInput: label,
      }), () => {
        scrollErrorIntoView();
      });
    });
  }

  cancelUpdate = () => {
    this.setState({ ApiError: undefined, labelInput: this.state.nodeBalancer.label });
  }

  handleGoBack = () => {
    const { history } = this.props;
    history.push('/nodebalancers')
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
    const { match: { path, url }, classes } = this.props;
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

    const hasErrorFor = getAPIErrorsFor({ label: 'label' }, this.state.ApiError);
    const apiErrorText = hasErrorFor('label');

    const nodeBalancerLabel = (this.state.labelInput !== undefined)
    ? this.state.labelInput : nodeBalancer.label;

    return (
      <React.Fragment>
        <Grid container justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <IconButton
              onClick={this.handleGoBack}
              className={classes.backButton}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <EditableText
              variant="headline"
              text={nodeBalancerLabel}
              onEdit={this.updateLabel}
              onCancel={this.cancelUpdate}
              errorText={apiErrorText}
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
                <Tab
                  key={tab.title}
                  label={tab.title}
                  data-qa-tab={tab.title}
                />,
              )
            }
          </Tabs>
        </AppBar>
        <Switch>
          <Route
            exact
            path={`${path}/summary`}
            render={() =>
              <NodeBalancerSummary
                nodeBalancer={nodeBalancer}
                errorResponses={pathOr(undefined, ['location', 'state', 'errors'], this.props)}
              />
            }
          />
          <Route
            exact
            path={`${path}/settings`}
            render={() =>
              <NodeBalancerSettings
                nodeBalancerId={nodeBalancer.id}
                nodeBalancerLabel={nodeBalancer.label}
                nodeBalancerClientConnThrottle={nodeBalancer.client_conn_throttle}
                />
            }
          />
          <Route
            exact
            path={`${path}/configurations`}
            render={() =>
              <NodeBalancerConfigurations nodeBalancerLabel={nodeBalancer.label}/>
            }
          />
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

export default compose<any, any, any, any, any>(
  setDocs(NodeBalancerDetail.docs),
  reloaded,
  styled,
  preloaded,
)(NodeBalancerDetail);
