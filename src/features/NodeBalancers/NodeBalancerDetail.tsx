import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
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

import { getNodeBalancer } from 'src/services/nodebalancers';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';

import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import ErrorState from 'src/components/ErrorState';
import setDocs from 'src/components/DocsSidebar/setDocs';


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
  nodeBalancer: PromiseLoaderResponse<Linode.NodeBalancer>;
}

interface Props { }

interface State {
  nodeBalancer: Linode.NodeBalancer;
  error?: Error;
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

    return getNodeBalancer(nodeBalancerId);
  },
});

class NodeBalancerDetail extends React.Component<CombinedProps, State> {
  state: State = {
    nodeBalancer: pathOr(undefined, ['response'], this.props.nodeBalancer),
    error: pathOr(undefined, ['error'], this.props.nodeBalancer),
  };

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  static docs: Linode.Doc[] = [
    {
      title: 'DNS Manager Overview',
      src: 'https://www.linode.com/docs/networking/dns/dns-manager-overview/',
      body: `The DNS Manager is a comprehensive DNS management interface available within the
      Linode Manager that allows you to add DNS records for all of your domain names. This guide
      covers the use of Linode’s DNS Manager and basic domain zone setup. For an introduction to
      DNS in general, please see our Introduction to DNS Records guide.`,
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
          errorText="There was an error retrieving your domain. Please reload and try again."
        />
      );
    }

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
            <Typography variant="headline">{nodeBalancer.label}</Typography>
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
              <div>Hello World</div>
            }
          />
          <Route exact path={`${path}/configurations`} render={() => <div>Hello World</div>} />
          <Route exact path={`${path}/settings`} render={() => <div>Hello World</div>} />
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
