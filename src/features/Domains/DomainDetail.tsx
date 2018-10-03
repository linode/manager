import { compose, pathOr } from 'ramda';
import * as React from 'react';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import { matchPath, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getDomain, getDomainRecords } from 'src/services/domains';

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

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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

  tabs: { routeName: string, title: string, disabled?: boolean}[] = [
    { routeName: `${this.props.match.url}/records`, title: 'DNS Records' },
    // { routeName: `${this.props.match.url}/check-zone`, title: 'Check Zone', disabled: true },
    // { routeName: `${this.props.match.url}/zone-file`, title: 'Zone File', disabled: true },
  ];

  updateRecords = () => {
    const { match: { params: { domainId } } } = this.props;
    if (!domainId) { return; }

    getDomainRecords(domainId)
      .then(({ data: { data } }) => {
        this.setState({ records: data });

      })
      .catch(console.error);
  }

  updateDomain = () => {
    const { match: { params: { domainId } } } = this.props;
    if (!domainId) { return; }

    getDomain(domainId)
      .then(({ data }) => {
        this.setState({ domain: data });
      })
      .catch(console.error);
  }

  goToDomains = () => {
    this.props.history.push('/domains');
  }

  renderDomainRecords = () => {
    const { domain, records } = this.state;
    return (
      <DomainRecords
        domain={domain}
        domainRecords={records}
        updateRecords={this.updateRecords}
        updateDomain={this.updateDomain}
      />
    )
  }

  renderCheckZone = () => {
    return <h1>Check Zone</h1>
  }

  renderZoneFile = () => {
    return <h1>Zone File</h1>
  }

  render() {
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));
    const { match: { path, url }, classes } = this.props;
    const { error, domain } = this.state;

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
              onClick={this.goToDomains}
              className={classes.backButton}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <Typography role="header" variant="headline" data-qa-domain-title>{domain.domain}</Typography>
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
            render={this.renderDomainRecords}
          />
          <Route exact path={`${path}/check-zone`} render={this.renderCheckZone} />
          <Route exact path={`${path}/zone-file`} render={this.renderZoneFile} />
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

export default compose<any, any, any, any, any>(
  setDocs(DomainDetail.docs),
  reloaded,
  styled,
  preloaded,
)(DomainDetail);
