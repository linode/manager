import { shim } from 'promise.prototype.finally';
import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { bindActionCreators, compose } from 'redux'

import { Sticky, StickyContainer, StickyProps } from 'react-sticky';;

import 'typeface-lato';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import DefaultLoader from 'src/components/DefaultLoader';
import DocsSidebar from 'src/components/DocsSidebar';
import { DocumentTitleSegment, withDocumentTitleProvider } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import SideMenu from 'src/components/SideMenu';
import { isProduction, isTest } from 'src/constants';
import { RegionsProvider, WithRegionsContext } from 'src/context/regions';
import { TypesProvider, WithTypesContext } from 'src/context/types';
import Footer from 'src/features/Footer';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import { getDeprecatedLinodeTypes , getLinodeTypes } from 'src/services/linodes';
import { getRegions } from 'src/services/misc';
import { getProfile } from 'src/services/profile';
import { request, response } from 'src/store/reducers/resources';
import initSurvicate from 'src/survicate';

import composeState from 'src/utilities/composeState';
import { notifications, theme as themeStorage } from 'src/utilities/storage';

import BetaNotification from 'src/BetaNotification';

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

const SupportTickets = DefaultLoader({
  loader: () => import('src/features/Support/SupportTickets'),
});

const SupportTicketDetail = DefaultLoader({
  loader: () => import('src/features/Support/SupportTicketDetail'),
})

const Users = DefaultLoader({
  loader: () => import('src/features/Users'),
});

const InvoiceDetail = DefaultLoader({
  loader: () => import('src/features/Account/InvoiceDetail'),
});

const Longview = DefaultLoader({
  loader: () => import('src/features/Longview'),
});

const Managed = DefaultLoader({
  loader: () => import('src/features/Managed'),
});

const Dashboard = DefaultLoader({
  loader: () => import('src/features/Dashboard'),
});

const Help = DefaultLoader({
  loader: () => import('src/features/Help'),
});

const SupportSearchLanding = DefaultLoader({
  loader: () => import('src/features/Help/SupportSearchLanding'),
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
  userId: number | null;
}

interface ConnectedProps {
  dispatchRequest: typeof request;
  dispatchResponse: typeof response;
  documentation: Linode.Doc[];
}

interface State {
  menuOpen: boolean;
  betaNotification: boolean;
  typesContext: WithTypesContext;
  regionsContext: WithRegionsContext;
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
  surveyed: boolean = false;

  state: State = {
    menuOpen: false,
    betaNotification: false,
    typesContext: {
      lastUpdated: 0,
      loading: false,
      request: () => {
        this.composeState([set(L.typesContext.loading, true)]);
        return Promise.all([getLinodeTypes(), getDeprecatedLinodeTypes()])
          .then((types: Linode.ResourcePage<Linode.LinodeType>[]) => {
            this.composeState([
              set(L.typesContext.loading, false),
              set(L.typesContext.lastUpdated, Date.now()),
              set(L.typesContext.data, [...types[0].data, ...types[1].data]),
            ])
          })
          .catch((error: any) => {
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
          .then((regions) => {
            this.composeState([
              set(L.regionsContext.loading, false),
              set(L.regionsContext.lastUpdated, Date.now()),
              set(L.regionsContext.data, regions.data),
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
    },
  };

  componentDidMount() {
    const { dispatchRequest, dispatchResponse } = this.props;

    if (notifications.beta.get() === 'open') {
      this.setState({ betaNotification: true });
    }

    dispatchRequest(['profile']);
    getProfile()
      .then(({ data }) => {
        dispatchResponse(['profile'], data);
      })
      .catch(error => dispatchResponse(['profile'], error));

    this.state.regionsContext.request();
    this.state.typesContext.request();
  }

  componentDidUpdate() {
    const { userId } = this.props;
    /* userId is a connected prop; if it's loaded
    * (default value is 1) and we haven't already
    * done this, initialize the survey. Also, shouldn't
    * load the survey in development.
    * */
    if (isTest) {
      // Temporary hack until we implement NODE_ENV=test
      return;
    }
    if (userId && userId !== 1 && !this.surveyed && isProduction) {
      /* Initialize Survicate
      * Done here rather than in index.tsx so that
      * we have access to the logged in user's ID
      */
      initSurvicate(window, userId);
      this.surveyed = true;
    }
  }

  closeMenu = () => { this.setState({ menuOpen: false }); }
  openMenu = () => { this.setState({ menuOpen: true }); }

  toggleMenu = () => {
    this.setState({
      menuOpen: !this.state.menuOpen,
    });
  }

  closeBetaNotice = () => {
    this.setState({ betaNotification: false });
    notifications.beta.set('closed');
  }

  render() {
    const { menuOpen } = this.state;
    const { classes, longLivedLoaded, documentation, toggleTheme } = this.props;
    const hasDoc = documentation.length > 0;

    return (
      <React.Fragment>
        <a href="#main-content" className="visually-hidden">Skip to main content</a>
        <DocumentTitleSegment segment="Linode Manager" />
        {longLivedLoaded &&
          <React.Fragment>
            <TypesProvider value={this.state.typesContext}>
              <RegionsProvider value={this.state.regionsContext}>
                <div {...themeDataAttr()} className={classes.appFrame}>
                  <SideMenu open={menuOpen} closeMenu={this.closeMenu} toggleTheme={toggleTheme} />
                  <main className={classes.content}>
                    <TopMenu openSideMenu={this.openMenu} />
                    <div className={classes.wrapper} id="main-content">
                    <StickyContainer>
                      <Grid container spacing={0} className={classes.grid}>
                        <Grid item className={`${classes.switchWrapper} ${hasDoc ? 'mlMain' : ''}`}>
                          <Switch>
                            <Route path="/linodes" component={LinodesRoutes} />
                            <Route path="/volumes" component={Volumes} />
                            <Route path="/nodebalancers" component={NodeBalancers} />
                            <Route path="/domains" component={Domains} />
                            <Route exact path="/managed" component={Managed} />
                            <Route exact path="/longview" component={Longview} />
                            <Route exact path="/images" component={Images} />
                            <Route path="/stackscripts" component={StackScripts} />
                            <Route exact path="/billing" component={Account} />
                            <Route exact path="/billing/invoices/:invoiceId" component={InvoiceDetail} />
                            <Route path="/users" component={Users} />
                            <Route exact path="/support/tickets" component={SupportTickets} />
                            <Route path="/support/tickets/:ticketId" component={SupportTicketDetail} />
                            <Route path="/profile" component={Profile} />
                            <Route exact path="/support" component={Help} />
                            <Route exact path="/support/search/" component={SupportSearchLanding} />
                            <Route path="/dashboard" component={Dashboard} />
                            <Redirect exact from="/" to="/dashboard" />
                            <Route component={NotFound} />
                          </Switch>
                        </Grid>
                        {hasDoc &&
                          <Grid className='mlSidebar'>
                            <Sticky topOffset={-24} disableCompensation>
                              {(props: StickyProps) => {
                                return (
                                  <DocsSidebar
                                    docs={documentation}
                                    {...props}
                                  />
                                )
                              }
                              }
                            </Sticky>
                          </Grid>
                        }
                      </Grid>
                      </StickyContainer>
                    </div>

                  </main>
                  <Footer />
                  <BetaNotification
                    open={this.state.betaNotification}
                    onClose={this.closeBetaNotice}
                    data-qa-beta-notice />
                  <ToastNotifications />
                  <VolumeDrawer />
                </div>
              </RegionsProvider>
            </TypesProvider>
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

const themeDataAttr = () => {
  if (themeStorage.get() === 'dark') {
    return {
      'data-qa-theme-dark': true
    }
  }
  return {
    'data-qa-theme-light': true
  }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  {
    dispatchRequest: request,
    dispatchResponse: response,
  },
  dispatch,
);

const mapStateToProps = (state: Linode.AppState) => ({
  longLivedLoaded: Boolean(pathOr(false, ['resources', 'profile', 'data'], state)),
  userId: pathOr(null,['resources', 'profile', 'data', 'uid'], state),
  documentation: state.documentation,
});

export const connected = connect(mapStateToProps, mapDispatchToProps);

export const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  styled,
  withDocumentTitleProvider,
)(App);
