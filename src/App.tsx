import { shim } from 'promise.prototype.finally';
import { lensPath, path, set } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Sticky, StickyContainer, StickyProps } from 'react-sticky';
import { compose } from 'redux';
import { Subscription } from 'rxjs/Subscription';
import 'typeface-lato';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import DefaultLoader from 'src/components/DefaultLoader';
import DocsSidebar from 'src/components/DocsSidebar';
import { DocumentTitleSegment, withDocumentTitleProvider } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import SideMenu from 'src/components/SideMenu';
import { RegionsProvider, WithRegionsContext } from 'src/context/regions';
import { TypesProvider, WithTypesContext } from 'src/context/types';

import Footer from 'src/features/Footer';
import ToastNotifications from 'src/features/ToastNotifications';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';

import { getDeprecatedLinodeTypes, getLinodeTypes } from 'src/services/linodes';
import { getRegions } from 'src/services/misc';
import { requestNotifications } from 'src/store/reducers/notifications';
import { requestProfile } from 'src/store/reducers/resources/profile';

import composeState from 'src/utilities/composeState';
import { notifications, theme as themeStorage } from 'src/utilities/storage';
import WelcomeBanner from 'src/WelcomeBanner';

import { events$ } from 'src/events';

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

const styles: StyleRulesCallback = (theme) => ({
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
}

interface State {
  menuOpen: boolean;
  welcomeBanner: boolean;
  typesContext: WithTypesContext;
  regionsContext: WithRegionsContext;
}

type CombinedProps = Props & DispatchProps & StateProps & WithStyles<ClassNames>;

const typesContext = (pathCollection: string[]) => lensPath(['typesContext', ...pathCollection]);
const regionsContext = (pathCollection: string[]) => lensPath(['regionsContext', ...pathCollection]);

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

  eventsSub: Subscription;

  state: State = {
    menuOpen: false,
    welcomeBanner: false,
    typesContext: {
      lastUpdated: 0,
      loading: false,
      request: () => {
        this.composeState([set(L.typesContext.loading, true)]);
        return Promise.all([getLinodeTypes(), getDeprecatedLinodeTypes()
          .catch(e => Promise.resolve([]))])
          .then((types: any[]) => {
            /* if for whatever reason we cannot get the types, just use the curernt types */
            const cleanedTypes = (types[1].data)
              ? [...types[0].data, ...types[1].data]
              : types[0].data;
            this.composeState([
              set(L.typesContext.loading, false),
              set(L.typesContext.lastUpdated, Date.now()),
              set(L.typesContext.data, cleanedTypes),
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
    const { getNotifications, getProfile } = this.props.actions;

    /*
     * We want to listen for migration events side-wide
     * It's unpredictable when a migration is going to happen. It could take
     * hours and it could take days. We want to notify to the user when it happens
     * and then update the Linodes in LinodesDetail and LinodesLanding
     */
    this.eventsSub = events$
      .filter(event => (
        !event._initial
        && [
          'linode_migrate',
        ].includes(event.action)
      ))
      .subscribe((event) => {
        const { entity: migratedLinode } = event;
        if (event.action === 'linode_migrate' && event.status === 'finished') {
          sendToast(`Linode ${migratedLinode!.label} migrated successfully.`);
        }

        if (event.action === 'linode_migrate' && event.status === 'failed') {
          sendToast(`Linode ${migratedLinode!.label} migration failed.`, 'error');
        }
      });

    if (notifications.welcome.get() === 'open') {
      this.setState({ welcomeBanner: true });
    }

    getProfile();
    getNotifications();

    this.state.regionsContext.request();
    this.state.typesContext.request();
  }

  closeMenu = () => { this.setState({ menuOpen: false }); }
  openMenu = () => { this.setState({ menuOpen: true }); }

  toggleMenu = () => {
    this.setState({
      menuOpen: !this.state.menuOpen,
    });
  }

  closeWelcomeBanner = () => {
    this.setState({ welcomeBanner: false });
    notifications.welcome.set('closed');
  }

  render() {
    const { menuOpen } = this.state;
    const { classes, documentation, toggleTheme, profileLoading, profileError } = this.props;

    const hasDoc = documentation.length > 0;

    return (
      <React.Fragment>
        <a href="#main-content" className="visually-hidden">Skip to main content</a>
        <DocumentTitleSegment segment="Linode Manager" />

        {profileLoading === false && !profileError &&
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
                  <WelcomeBanner
                    open={this.state.welcomeBanner}
                    onClose={this.closeWelcomeBanner}
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

interface DispatchProps {
  actions: {
    getProfile: () => void;
    getNotifications: () => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch, ownProps) => {
  return {
    actions: {
      getProfile: () => dispatch(requestProfile()),
      getNotifications: () => dispatch(requestNotifications()),
    }
  };
};

interface StateProps {
  /** Profile */
  profileLoading: boolean;
  profileError?: Error | Linode.ApiFieldError[];
  userId?: number;

  documentation: Linode.Doc[];
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state, ownProps) => ({
  /** Profile */
  profileLoading: state.__resources.profile.loading,
  profileError: state.__resources.profile.error,
  userId: path(['data', 'uid'], state.__resources.profile),

  documentation: state.documentation,
});

export const connected = connect(mapStateToProps, mapDispatchToProps);

export const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  styled,
  withDocumentTitleProvider,
)(App);
