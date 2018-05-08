import * as React from 'react';
import { compose, pathOr } from 'ramda';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';

import { getDomain, getDomainRecords } from 'src/services/domains';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import ErrorState from 'src/components/ErrorState';

import DomainRecords from './DomainRecords';

interface State {
  error?: Error;
  domain: Linode.Domain;
  records: Linode.Record[];
}

type RouteProps = RouteComponentProps<{ domainId?: number }>;

interface PreloadedProps {
  domain: PromiseLoaderResponse<Linode.Domain>;
  records: PromiseLoaderResponse<Linode.Record>;
}

type ClassNames = 'root'
  | 'titleWrapper'
  | 'backButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
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

type CombinedProps = RouteProps & PreloadedProps & WithStyles<ClassNames>;

const preloaded = PromiseLoader<CombinedProps>({
  domain: ({ match: { params: { domainId } } }) => {
    if (!domainId) {
      return Promise.reject(new Error('domainId param not set.'));
    }

    return getDomain(domainId);
  },

  records: ({ match: { params: { domainId } } }) => {
    if (!domainId) {
      return Promise.reject(new Error('domainId param not set.'));
    }

    return getDomainRecords(domainId);
  },
});

class DomainDetail extends React.Component<CombinedProps, State> {

  state: State = {
    domain: pathOr(undefined, ['response', 'data'], this.props.domain),
    records: pathOr([], ['response', 'data', 'data'], this.props.records),
    error: pathOr(undefined, ['error'], this.props.domain),
  };

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  tabs = [
    { routeName: `${this.props.match.url}/records`, title: 'DNS Records' },
    { routeName: `${this.props.match.url}/check-zone`, title: 'Check Zone', disabled: true },
    { routeName: `${this.props.match.url}/zone-file`, title: 'Zone File', disabled: true },
  ];

  render() {
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));
    const { match: { path, url }, history, classes } = this.props;
    const { error, domain, records } = this.state;

    /** Empty State */
    if (!domain) { return null; }

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
            <Typography variant="headline">{domain.domain}</Typography>
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
                <Tab key={tab.title} label={tab.title} disabled={tab.disabled} />,
              )
            }
          </Tabs>
        </AppBar>
        <Switch>
          <Route
            exact
            path={`${path}/records`}
            render={() =>
              <DomainRecords domain={domain} domainRecords={records} />
            }
          />
          <Route exact path={`${path}/check-zone`} render={() => <h1>Check Zone</h1>} />
          <Route exact path={`${path}/zone-file`} render={() => <h1>Zone File</h1>} />
          {/* 404 */}
          < Redirect to={`${url}/records`} />
        </Switch>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });
const reloaded = reloadableWithRouter<PreloadedProps, { domainId?: number }>(
  (routePropsOld, routePropsNew) => {
    return routePropsOld.match.params.domainId !== routePropsNew.match.params.domainId;
  },
);

export default compose(
  reloaded,
  styled,
  preloaded,
)(DomainDetail);
