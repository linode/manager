import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { shim } from 'promise.prototype.finally';
import { lensPath, path, set } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { Sticky, StickyContainer, StickyProps } from 'react-sticky';
import { compose } from 'redux';
import { Subscription } from 'rxjs/Subscription';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import DefaultLoader from 'src/components/DefaultLoader';
import DocsSidebar from 'src/components/DocsSidebar';
import { DocumentTitleSegment, withDocumentTitleProvider } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import SideMenu from 'src/components/SideMenu';
import { RegionsProvider, WithRegionsContext } from 'src/context/regions';
import { events$ } from 'src/events';
import BackupDrawer from 'src/features/Backups';
import DomainCreateDrawer from 'src/features/Domains/DomainCreateDrawer';
import Footer from 'src/features/Footer';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import { getRegions } from 'src/services/misc';
import { requestNotifications } from 'src/store/reducers/notifications';
import { requestAccountSettings } from 'src/store/reducers/resources/accountSettings';
import { async as domainsAsync } from 'src/store/reducers/resources/domains';
import { async as imagesAsync } from 'src/store/reducers/resources/images';
import { async as linodesAsync } from 'src/store/reducers/resources/linodes';
import { requestProfile } from 'src/store/reducers/resources/profile';
import { async as typesAsync } from 'src/store/reducers/resources/types';
import { actions as volumeActions } from 'src/store/volumes';
import composeState from 'src/utilities/composeState';
import { notifications, theme as themeStorage } from 'src/utilities/storage';
import WelcomeBanner from 'src/WelcomeBanner';

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

const SearchLanding = DefaultLoader({
  loader: () => import('src/features/Search'),
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
  location: RouteProps['location'];
}

interface State {
  menuOpen: boolean;
  welcomeBanner: boolean;
  regionsContext: WithRegionsContext;
  hasError: boolean;
}

type CombinedProps = Props
  & DispatchProps
  & StateProps
  & WithStyles<ClassNames>
  & InjectedNotistackProps;

const regionsContext = (pathCollection: string[]) => lensPath(['regionsContext', ...pathCollection]);

const L = {
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
    hasError: false,
  };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  componentDidMount() {
    const { actions } = this.props;

    actions.requestDomains();
    actions.requestImages();
    actions.requestLinodes();
    actions.requestNotifications();
    actions.requestProfile();
    actions.requestSettings();
    actions.requestTypes();
    actions.requestVolumes();

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
          this.props.enqueueSnackbar(`Linode ${migratedLinode!.label} migrated successfully.`, {
            variant: 'success'
          })
        }

        if (event.action === 'linode_migrate' && event.status === 'failed') {
          this.props.enqueueSnackbar(`Linode ${migratedLinode!.label} migration failed.`, {
            variant: 'error'
          });
        }
      });

    if (notifications.welcome.get() === 'open') {
      this.setState({ welcomeBanner: true });
    }

    this.state.regionsContext.request();
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
    const { menuOpen, hasError } = this.state;
    const {
      classes,
      documentation,
      toggleTheme,
      profileLoading,
      profileError,
    } = this.props;

    const hasDoc = documentation.length > 0;

    if (profileError || hasError) {
      return <TheApplicationIsOnFire />;
    }

    return (
      <React.Fragment>
        <a href="#main-content" className="visually-hidden">Skip to main content</a>
        <DocumentTitleSegment segment="Linode Manager" />

        {profileLoading === false &&
          <React.Fragment>
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
                            <Route path="/account" component={Account} />
                            <Route exact path="/support/tickets" component={SupportTickets} />
                            <Route path="/support/tickets/:ticketId" component={SupportTicketDetail} />
                            <Route path="/profile" component={Profile} />
                            <Route exact path="/support" component={Help} />
                            <Route exact path="/support/search/" component={SupportSearchLanding} />
                            <Route path="/dashboard" component={Dashboard} />
                            <Route path="/search" component={SearchLanding} />
                            <Redirect exact from="/" to="/dashboard" />
                            <Route component={NotFound} />
                          </Switch>
                        </Grid>
                        {hasDoc &&
                          <Grid className='mlSidebar'>
                            <Sticky topOffset={-24} disableCompensation>
                              {(props: StickyProps) => (<DocsSidebar docs={documentation} {...props} />)}
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
                <DomainCreateDrawer />
                <VolumeDrawer />
                <BackupDrawer />
              </div>
            </RegionsProvider>
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
    requestDomains: () => void;
    requestImages: () => void;
    requestLinodes: () => void;
    requestNotifications: () => void;
    requestProfile: () => void;
    requestSettings: () => void;
    requestTypes: () => void;
    requestVolumes: () => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch, ownProps) => {
  return {
    actions: {
      requestDomains: () => dispatch(domainsAsync.requestDomains()),
      requestImages: () => dispatch(imagesAsync.requestImages()),
      requestLinodes: () => dispatch(linodesAsync.requestLinodes()),
      requestNotifications: () => dispatch(requestNotifications()),
      requestProfile: () => dispatch(requestProfile()),
      requestSettings: () => dispatch(requestAccountSettings()),
      requestTypes: () => dispatch(typesAsync.requestTypes()),
      requestVolumes: () => dispatch(volumeActions.requestVolumes()),
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

export const styled = withStyles(styles);

export default compose(
  connected,
  styled,
  withDocumentTitleProvider,
  withSnackbar
)(App);
