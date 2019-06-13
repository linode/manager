import { compose, pathOr } from 'ramda';
import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader, {
  PromiseLoaderResponse
} from 'src/components/PromiseLoader/PromiseLoader';
import TabLink from 'src/components/TabLink';
import TagsPanel from 'src/components/TagsPanel';
import styled, { StyleProps } from 'src/containers/SummaryPanels.styles';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getDomain, getDomainRecords } from 'src/services/domains';
import {
  DomainActionsProps,
  withDomainActions
} from 'src/store/domains/domains.container';
import { getAllWithArguments } from 'src/utilities/getAll';
import DomainRecords from './DomainRecords';

interface State {
  error?: Error;
  domain: Linode.Domain;
  records: Linode.DomainRecord[];
}

type RouteProps = RouteComponentProps<{ domainId?: string }>;

interface PreloadedProps {
  domain: PromiseLoaderResponse<Linode.Domain>;
  records: PromiseLoaderResponse<Linode.DomainRecord>;
}

type ClassNames =
  | 'main'
  | 'sidebar'
  | 'domainSidebar'
  | 'titleWrapper'
  | 'error';

const styles = (theme: Theme) =>
  createStyles({
    main: {
      [theme.breakpoints.up('md')]: {
        order: 1
      }
    },
    error: {
      marginTop: `${theme.spacing(3)}px !important`,
      marginBottom: `0 !important`
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        order: 2
      }
    },
    domainSidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(1) + 24
      }
    },
    titleWrapper: {
      display: 'flex',
      alignItems: 'center',
      wordBreak: 'break-all'
    }
  });

type CombinedProps = DomainActionsProps &
  RouteProps &
  PreloadedProps &
  StyleProps &
  WithStyles<ClassNames>;

const preloaded = PromiseLoader<CombinedProps>({
  domain: ({
    match: {
      params: { domainId }
    }
  }) => {
    if (!domainId) {
      return Promise.reject(new Error('domainId param not set.'));
    }

    return getDomain(+domainId);
  },

  records: ({
    match: {
      params: { domainId }
    }
  }) => {
    if (!domainId) {
      return Promise.reject(new Error('domainId param not set.'));
    }

    return getAllWithArguments<Linode.DomainRecord>(getDomainRecords)([
      +domainId
    ]);
  }
});

class DomainDetail extends React.Component<CombinedProps, State> {
  state: State = {
    domain: pathOr(undefined, ['response'], this.props.domain),
    records: pathOr([], ['response', 'data'], this.props.records),
    error: pathOr(undefined, ['error'], this.props.domain)
  };

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  };

  static docs: Linode.Doc[] = [
    {
      title: 'DNS Manager Overview',
      src:
        'https://linode.com/docs/platform/manager/dns-manager-new-manager/#add-records',
      body: `The DNS Manager is a comprehensive DNS management interface available within the
      Linode Manager that allows you to add DNS records for all of your domain names. This guide
      covers the use of Linode’s DNS Manager and basic domain zone setup. For an introduction to
      DNS in general, please see our Introduction to DNS Records guide.`
    }
  ];

  tabs: { routeName: string; title: string; disabled?: boolean }[] = [
    { routeName: `${this.props.match.url}/records`, title: 'DNS Records' }
    // { routeName: `${this.props.match.url}/check-zone`, title: 'Check Zone', disabled: true },
    // { routeName: `${this.props.match.url}/zone-file`, title: 'Zone File', disabled: true },
  ];

  updateRecords = () => {
    const {
      match: {
        params: { domainId }
      }
    } = this.props;
    if (!domainId) {
      return;
    }
    getAllWithArguments<Linode.DomainRecord>(getDomainRecords)([+domainId])
      .then(({ data }) => {
        this.setState({ records: data });
      })
      // tslint:disable-next-line
      .catch(console.error);
  };

  updateDomain = () => {
    const {
      match: {
        params: { domainId }
      }
    } = this.props;
    if (!domainId) {
      return;
    }

    getDomain(+domainId)
      .then((data: Linode.Domain) => {
        this.setState({ domain: data });
      })
      // tslint:disable-next-line
      .catch(console.error);
  };

  handleUpdateTags = (tagsList: string[]) => {
    const { domain } = this.state;
    const { domainActions } = this.props;
    return domainActions
      .updateDomain({
        domainId: domain.id,
        tags: tagsList
      })
      .then((data: Linode.Domain) => {
        this.setState({
          domain: data
        });
      });
  };

  goToDomains = () => {
    this.props.history.push('/domains');
  };

  renderDomainRecords = () => {
    const { domain, records } = this.state;
    const { classes } = this.props;
    return (
      <Grid container>
        <Grid
          item
          xs={12}
          md={3}
          className={`${classes.sidebar} ${classes.domainSidebar}`}
        >
          <Paper className={classes.summarySection}>
            <Typography variant="h3" className={classes.title} data-qa-title>
              Tags
            </Typography>
            <TagsPanel tags={domain.tags} updateTags={this.handleUpdateTags} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9} className={classes.main}>
          <DomainRecords
            domain={domain}
            domainRecords={records}
            updateRecords={this.updateRecords}
            updateDomain={this.updateDomain}
          />
        </Grid>
      </Grid>
    );
  };

  renderCheckZone = () => {
    return <h1>Check Zone</h1>;
  };

  renderZoneFile = () => {
    return <h1>Zone File</h1>;
  };

  render() {
    const matches = (p: string) =>
      Boolean(matchPath(p, { path: this.props.location.pathname }));
    const {
      match: { path, url },
      classes
    } = this.props;
    const { error, domain } = this.state;

    /** Empty State */
    if (!domain) {
      return null;
    }

    /** Error State */
    if (error) {
      return (
        <ErrorState errorText="There was an error retrieving your domain. Please reload and try again." />
      );
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <Breadcrumb
              linkTo="/domains"
              linkText="Domains"
              labelTitle={domain.domain}
            />
          </Grid>
        </Grid>
        {this.props.location.state && this.props.location.state.recordError && (
          <Notice
            className={classes.error}
            error
            text={this.props.location.state.recordError}
          />
        )}
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
            style={{ marginBottom: 16 }}
          >
            {this.tabs.map(tab => (
              <Tab
                key={tab.title}
                disabled={tab.disabled}
                component={React.forwardRef((props, ref) => (
                  <TabLink
                    to={tab.routeName}
                    title={tab.title}
                    {...props}
                    ref={ref}
                  />
                ))}
              />
            ))}
          </Tabs>
        </AppBar>
        <Switch>
          <Route
            exact
            path={`${path}/records`}
            render={this.renderDomainRecords}
          />
          <Route
            exact
            path={`${path}/check-zone`}
            render={this.renderCheckZone}
          />
          <Route
            exact
            path={`${path}/zone-file`}
            render={this.renderZoneFile}
          />
          {/* 404 */}
          <Redirect to={`${url}/records`} />
        </Switch>
      </React.Fragment>
    );
  }
}

const localStyles = withStyles(styles);
const reloaded = reloadableWithRouter<PreloadedProps, { domainId?: number }>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.domainId !==
      routePropsNew.match.params.domainId
    );
  }
);

export default compose<any, any, any, any, any, any, any>(
  setDocs(DomainDetail.docs),
  reloaded,
  localStyles,
  styled,
  preloaded,
  withDomainActions
)(DomainDetail);
