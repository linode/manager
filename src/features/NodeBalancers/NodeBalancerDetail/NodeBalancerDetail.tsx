import { withSnackbar, WithSnackbarProps } from 'notistack';
import { any, last, pathOr } from 'ramda';
import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import withLoadingAndError, {
  LoadingAndErrorHandlers,
  LoadingAndErrorState
} from 'src/components/withLoadingAndError';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import {
  getNodeBalancer,
  getNodeBalancerConfigs
} from 'src/services/nodebalancers';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault
} from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { NodeBalancerProvider } from './context';
import NodeBalancerConfigurations from './NodeBalancerConfigurations';
import NodeBalancerSettings from './NodeBalancerSettings';
import NodeBalancerSummary from './NodeBalancerSummary';

type ClassNames = 'root' | 'backButton';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    backButton: {
      margin: '5px 0 0 -16px',
      '& svg': {
        width: 34,
        height: 34
      }
    }
  });

type RouteProps = RouteComponentProps<{ nodeBalancerId?: string }>;

interface State {
  nodeBalancer?: Linode.ExtendedNodeBalancer;
  ApiError: Linode.ApiFieldError[] | undefined;
  labelInput?: string;
}

type CombinedProps = WithNodeBalancerActions &
  WithSnackbarProps &
  RouteProps &
  LoadingAndErrorHandlers &
  LoadingAndErrorState &
  WithStyles<ClassNames>;

class NodeBalancerDetail extends React.Component<CombinedProps, State> {
  state: State = {
    nodeBalancer: undefined,
    ApiError: undefined
  };

  pollInterval: number;

  requestNodeBalancer = (nodeBalancerId: number) =>
    Promise.all([
      getNodeBalancer(+nodeBalancerId),
      getNodeBalancerConfigs(+nodeBalancerId)
    ])
      .then(([nodeBalancer, configsData]) => {
        const { data: configs } = configsData;
        return {
          ...nodeBalancer,
          down: configs.reduce((acc: number, config) => {
            return acc + config.nodes_status.down;
          }, 0), // add the downtime for each config together
          up: configs.reduce((acc: number, config) => {
            return acc + config.nodes_status.up;
          }, 0), // add the uptime for each config together
          configPorts: configs.reduce((acc: [number], config) => {
            return [...acc, { configId: config.id, port: config.port }];
          }, [])
        };
      })
      .then((nodeBalancer: Linode.ExtendedNodeBalancer) => {
        this.setState({ nodeBalancer });
        this.props.clearLoadingAndErrors();
      })
      .catch(error => {
        if (!this.state.nodeBalancer) {
          this.props.setErrorAndClearLoading(
            getErrorStringOrDefault(
              error,
              'There was an error loading your NodeBalancer.'
            )
          );
        }
      });

  componentDidMount() {
    const { nodeBalancerId } = this.props.match.params;

    // On initial load only, we want a loading state.
    this.props.setLoadingAndClearErrors();
    if (!nodeBalancerId) {
      this.props.setErrorAndClearLoading('NodeBalancer ID param not set.');
      return;
    }
    this.requestNodeBalancer(+nodeBalancerId);

    // Update NB information every 30 seconds, so that we have an accurate picture of nodes
    this.pollInterval = window.setInterval(
      () => this.requestNodeBalancer(+nodeBalancerId),
      30 * 1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  handleTabChange = (_: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeNames[0];
    history.push(`${routeName}`);
  };

  updateLabel = (label: string) => {
    const { nodeBalancer } = this.state;
    const {
      nodeBalancerActions: { updateNodeBalancer }
    } = this.props;

    // This should never actually happen, but TypeScript is expecting a Promise here.
    if (nodeBalancer === undefined) {
      return Promise.resolve();
    }

    return updateNodeBalancer({ nodeBalancerId: nodeBalancer.id, label })
      .then(() => {
        this.setState({
          nodeBalancer: { ...nodeBalancer, label },
          ApiError: undefined,
          labelInput: label
        });
      })
      .catch(error => {
        this.setState(
          () => ({
            ApiError: getAPIErrorOrDefault(
              error,
              'Error updating label',
              'label'
            ),
            labelInput: label
          }),
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  updateTags = (tags: string[]) => {
    const { nodeBalancer } = this.state;
    const {
      nodeBalancerActions: { updateNodeBalancer }
    } = this.props;

    if (nodeBalancer === undefined) {
      return;
    }

    return updateNodeBalancer({ nodeBalancerId: nodeBalancer.id, tags })
      .then(() => {
        this.setState({
          nodeBalancer: { ...nodeBalancer, tags },
          ApiError: undefined
        });
      })
      .catch(error => {
        const ApiError = getAPIErrorOrDefault(error, 'Error creating tag');
        this.setState({
          ApiError
        });
        return Promise.reject(ApiError);
      });
  };

  cancelUpdate = () => {
    this.setState({
      ApiError: undefined,
      labelInput: pathOr('', ['label'], this.state.nodeBalancer)
    });
  };

  getLabelLink = (): string | undefined => {
    return last(location.pathname.split('/')) !== 'summary'
      ? 'summary'
      : undefined;
  };

  static docs: Linode.Doc[] = [
    {
      title: 'Getting Started with NodeBalancers',
      src:
        'https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers-new-manager/',
      body: `Using a NodeBalancer to begin managing a simple web application`
    },
    {
      title: 'NodeBalancer Reference Guide',
      src:
        'https://www.linode.com/docs/platform/nodebalancer/nodebalancer-reference-guide-new-manager/',
      body: `NodeBalancer Reference Guide`
    }
  ];

  tabs = [
    {
      routeNames: [`${this.props.match.url}/summary`],
      title: 'Summary'
    },
    {
      routeNames: [
        `${this.props.match.url}/configurations`,
        `${this.props.match.url}/configurations/:configId`
      ],
      title: 'Configurations'
    },
    {
      routeNames: [`${this.props.match.url}/settings`],
      title: 'Settings'
    }
  ];

  render() {
    const matches = (pathName: string) =>
      Boolean(matchPath(this.props.location.pathname, { path: pathName }));
    const {
      match: { path, url },
      error,
      loading
    } = this.props;
    const { nodeBalancer } = this.state;

    /** Loading State */
    if (loading) {
      return <CircleProgress />;
    }

    /** Error State */
    if (error) {
      return (
        <ErrorState errorText="There was an error retrieving your NodeBalancer. Please reload and try again." />
      );
    }

    /** Empty State */
    if (!nodeBalancer) {
      return null;
    }

    const hasErrorFor = getAPIErrorsFor(
      { label: 'label' },
      this.state.ApiError
    );
    const apiErrorText = hasErrorFor('label');

    const nodeBalancerLabel =
      this.state.labelInput !== undefined
        ? this.state.labelInput
        : nodeBalancer.label;

    const p = {
      updateTags: this.updateTags
    };

    return (
      <NodeBalancerProvider value={p}>
        <React.Fragment>
          <Grid container justify="space-between">
            <Grid item>
              <Breadcrumb
                location={location}
                labelOptions={{ linkTo: this.getLabelLink() }}
                crumbOverrides={[
                  {
                    position: 1,
                    label: 'NodeBalancers'
                  }
                ]}
                removeCrumbX={2}
                onEditHandlers={{
                  editableTextTitle: nodeBalancerLabel,
                  onEdit: this.updateLabel,
                  onCancel: this.cancelUpdate,
                  errorText: apiErrorText
                }}
              />
            </Grid>
          </Grid>
          <AppBar position="static" color="default">
            <Tabs
              value={this.tabs.findIndex(tab => any(matches)(tab.routeNames))}
              onChange={this.handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
            >
              {this.tabs.map(tab => (
                <Tab
                  key={tab.title}
                  label={tab.title}
                  data-qa-tab={tab.title}
                />
              ))}
            </Tabs>
          </AppBar>
          <Switch>
            <Route
              exact
              path={`${path}/summary`}
              render={() => (
                <NodeBalancerSummary
                  nodeBalancer={nodeBalancer}
                  errorResponses={pathOr(
                    undefined,
                    ['location', 'state', 'errors'],
                    this.props
                  )}
                />
              )}
            />
            <Route
              exact
              path={`${path}/settings`}
              render={() => (
                <NodeBalancerSettings
                  nodeBalancerId={nodeBalancer.id}
                  nodeBalancerLabel={nodeBalancer.label}
                  nodeBalancerClientConnThrottle={
                    nodeBalancer.client_conn_throttle
                  }
                />
              )}
            />
            <Route
              exact
              path={`${path}/configurations`}
              render={() => (
                <NodeBalancerConfigurations
                  nodeBalancerLabel={nodeBalancer.label}
                />
              )}
            />
            <Route
              path={`${path}/configurations/:configId`}
              render={() => (
                <NodeBalancerConfigurations
                  nodeBalancerLabel={nodeBalancer.label}
                />
              )}
            />
            {/* 404 */}
            <Redirect to={`${url}/summary`} />
          </Switch>
        </React.Fragment>
      </NodeBalancerProvider>
    );
  }
}

const styled = withStyles(styles);
const reloaded = reloadableWithRouter<
  CombinedProps,
  { nodeBalancerId?: number }
>((routePropsOld, routePropsNew) => {
  return (
    routePropsOld.match.params.nodeBalancerId !==
    routePropsNew.match.params.nodeBalancerId
  );
});

export default compose(
  setDocs(NodeBalancerDetail.docs),
  reloaded,
  styled,
  withSnackbar,
  withNodeBalancerActions,
  withLoadingAndError
)(NodeBalancerDetail);
