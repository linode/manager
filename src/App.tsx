import { shim } from 'promise.prototype.finally';
import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { bindActionCreators, compose } from 'redux';
import 'typeface-lato';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import DefaultLoader from 'src/components/DefaultLoader';
import DocsSidebar from 'src/components/DocsSidebar';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import Placeholder from 'src/components/Placeholder';
import SideMenu from 'src/components/SideMenu';
import { RegionsProvider, WithRegionsProps } from 'src/context/regions';
import { TypesProvider, WithTypesProps } from 'src/context/types';
import Footer from 'src/features/Footer';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import { getLinodeTypes } from 'src/services/linodes';
import { getRegions } from 'src/services/misc';
import { getProfile } from 'src/services/profile';
import { request, response } from 'src/store/reducers/resources';
import composeState from 'src/utilities/composeState';

import BetaNotification from './BetaNotification';

shim(); // allows for .finally() usage

const Account = DefaultLoader({
  loader: () => import('src/features/Account'),
});

const LinodesRoutes = DefaultLoader({
  loader: () => import('src/features/linodes'),
});

const Volumes = DefaultLoader({
  loader: () => import('src/features/Volumes'),
});

const Domains = DefaultLoader({
  loader: () => import('src/features/Domains'),
});

const Images = DefaultLoader({
  loader: () => import('src/features/Images'),
})

const Profile = DefaultLoader({
  loader: () => import('src/features/Profile'),
});

const NodeBalancers = DefaultLoader({
  loader: () => import('src/features/NodeBalancers'),
});

const StackScripts = DefaultLoader({
  loader: () => import('src/features/StackScripts'),
});

const Users = DefaultLoader({
  loader: () => import('src/features/Users'),
});

const InvoiceDetail = DefaultLoader({
  loader: () => import('src/features/Account/InvoiceDetail'),
});

type ClassNames = 'appFrame'
  | 'content'
  | 'wrapper'
  | 'grid'
  | 'switchWrapper';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    backgroundColor: theme.bg.main,
  },
  content: {
    flex: 1,
    [theme.breakpoints.up('md')]: {
      marginLeft: 215,
    },
    [theme.breakpoints.up('xl')]: {
      marginLeft: 275,
    },
  },
  wrapper: {
    padding: theme.spacing.unit * 3,
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing.unit * 2,
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  grid: {
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
  },
  switchWrapper: {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%',
      },
    },
  },
});

interface Props {
  toggleTheme: () => void;
  longLivedLoaded: boolean;
}

interface ConnectedProps {
  request: typeof request;
  response: typeof response;
  documentation: Linode.Doc[];
}

interface State {
  menuOpen: Boolean;
  betaNotification: Boolean;
  typesContext: WithTypesProps;
  regionsContext: WithRegionsProps;
}

type CombinedProps =
  Props &
  WithStyles<ClassNames> &
  ConnectedProps;

const typesContext = (path: string[]) => lensPath(['typesContext', ...path]);
const regionsContext = (path: string[]) => lensPath(['regionsContext', ...path]);

const L = {
  typesContext: {
    data: typesContext(['data']),
    errors: typesContext(['errors']),
    lastUpdated: typesContext(['lastUpdated']),
    loading: typesContext(['loading']),
  },
  regionsContext: {
    data: regionsContext(['data']),
    errors: regionsContext(['errors']),
    lastUpdated: regionsContext(['lastUpdated']),
    loading: regionsContext(['loading']),
  },
};

export class App extends React.Component<CombinedProps, State> {
  composeState = composeState;

  state = {
    menuOpen: false,
    betaNotification: false,
    typesContext: {
      lastUpdated: 0,
      loading: false,
      request: () => {
        this.composeState([set(L.typesContext.loading, true)]);

        return getLinodeTypes()
          .then((response) => {
            this.composeState([
              set(L.typesContext.loading, false),
              set(L.typesContext.lastUpdated, Date.now()),
              set(L.typesContext.data, response.data),
            ])
          })
          .catch((error) => {
            this.composeState([
              set(L.typesContext.loading, false),
              set(L.typesContext.lastUpdated, Date.now()),
              set(L.typesContext.errors, error),
            ]);
          });
      },
      update: () => null, /** @todo */
    },
    regionsContext: {
      lastUpdated: 0,
      loading: false,
      request: () => {
        this.composeState([set(L.regionsContext.loading, true)]);

        return getRegions()
          .then((response) => {
            this.composeState([
              set(L.regionsContext.loading, false),
              set(L.regionsContext.lastUpdated, Date.now()),
              set(L.regionsContext.data, response.data),
            ])
          })
          .catch((error) => {
            this.composeState([
              set(L.regionsContext.loading, false),
              set(L.regionsContext.lastUpdated, Date.now()),
              set(L.regionsContext.errors, error),
            ]);
          });
      },
      update: () => null, /** @todo */
    }
  };

  componentDidMount() {
    const { request, response } = this.props;

    const betaNotification = window.localStorage.getItem('BetaNotification');
    if (betaNotification !== 'closed') {
      this.setState({ betaNotification: true });
    }

    const promises = [
      new Promise(() => {
        request(['profile']);
        return getProfile()
          .then(({ data }) => {
            response(['profile'], data);
          })
          .catch(error => response(['profile'], error));
      }),
    ];

    Promise
      .all(promises)
      .then((results) => {
        /**
         * We don't really need to do anything here. The Redux actions are dispatched
         * by the individual promises, we have no concept of 'loading'. The consumer of these
         * cached entities can check their individual status and do what they will with them.
         */
      });
  }

  toggleMenu = () => {
    this.setState({
      menuOpen: !this.state.menuOpen,
    });
  }

  closeBetaNotice = () => {
    this.setState({ betaNotification: false });
    window.localStorage.setItem('BetaNotification', 'closed');
  }

  Dashboard = () => <Placeholder title="Dashboard" />;

  Managed = () => <Placeholder title="Managed" />;

  Longview = () => <Placeholder title="Longview" />;

  Support = () => <Placeholder title="Support" />;

  render() {
    const { menuOpen } = this.state;
    const { classes, longLivedLoaded, documentation, toggleTheme } = this.props;
    const hasDoc = documentation.length > 0;

    return (
      <React.Fragment>
        {longLivedLoaded &&
          <React.Fragment>
            <TypesProvider value={this.state.typesContext}>
              <RegionsProvider value={this.state.regionsContext}>
                <div className={classes.appFrame}>
                  <SideMenu open={menuOpen} toggle={this.toggleMenu} toggleTheme={toggleTheme} />
                  <main className={classes.content}>
                    <TopMenu toggleSideMenu={this.toggleMenu} />
                    <div className={classes.wrapper}>
                      <Grid container spacing={0} className={classes.grid}>
                        <Grid item className={`${classes.switchWrapper} ${hasDoc ? 'mlMain' : ''}`}>
                          <Switch>
                            <Route exact path="/dashboard" render={this.Dashboard} />
                            <Route path="/linodes" component={LinodesRoutes} />
                            <Route path="/volumes" component={Volumes} />
                            <Route path="/nodebalancers" component={NodeBalancers} />
                            <Route path="/domains" component={Domains} />
                            <Route exact path="/managed" render={this.Managed} />
                            <Route exact path="/longview" render={this.Longview} />
                            <Route path="/images" component={Images} />
                            <Route path="/stackscripts" component={StackScripts} />
                            <Route exact path="/billing" component={Account} />
                            <Route exact path="/billing/invoices/:invoiceId" component={InvoiceDetail} />
                            <Route path="/users" component={Users} />
                            <Route exact path="/support" render={this.Support} />
                            <Route path="/profile" component={Profile} />
                            {/* Update to Dashboard when complete */}
                            <Route exact path="/" component={LinodesRoutes} />
                            <Route component={NotFound} />
                          </Switch>
                        </Grid>
                        <DocsSidebar docs={documentation} />
                      </Grid>
                    </div>
                  </main>
                  <Footer />
                </div>
                <BetaNotification
                  open={this.state.betaNotification}
                  onClose={this.closeBetaNotice}
                  data-qa-beta-notice />
                <ToastNotifications />
                <VolumeDrawer />
              </RegionsProvider>
            </TypesProvider>
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { request, response },
  dispatch,
);

const mapStateToProps = (state: Linode.AppState) => ({
  longLivedLoaded: Boolean(pathOr(false, ['resources', 'profile', 'data'], state)),
  documentation: state.documentation,
});

export const connected = connect(mapStateToProps, mapDispatchToProps);

export const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  styled,
)(App);
