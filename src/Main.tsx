import * as md5 from 'md5';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { compose } from 'recompose';

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import DefaultLoader from 'src/components/DefaultLoader';

import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import SideMenu from 'src/components/SideMenu';
/** @todo: Uncomment when we deploy with LD */
// import VATBanner from 'src/components/VATBanner';
import withFeatureFlagProvider, {
  useLDClient
} from 'src/containers/withFeatureFlagProvider.container';
import BackupDrawer from 'src/features/Backups';
import DomainDrawer from 'src/features/Domains/DomainDrawer';
import Footer from 'src/features/Footer';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import WelcomeBanner from 'src/WelcomeBanner';

import BucketDrawer from './features/ObjectStorage/Buckets/BucketDrawer';

import {
  isKubernetesEnabled as _isKubernetesEnabled,
  isObjectStorageEnabled
} from './utilities/accountCapabilities';

const Account = DefaultLoader({
  loader: () => import('src/features/Account')
});

const LinodesRoutes = DefaultLoader({
  loader: () => import('src/features/linodes')
});

const Volumes = DefaultLoader({
  loader: () => import('src/features/Volumes')
});

const Domains = DefaultLoader({
  loader: () => import('src/features/Domains')
});

const Images = DefaultLoader({
  loader: () => import('src/features/Images')
});

const Kubernetes = DefaultLoader({
  loader: () => import('src/features/Kubernetes')
});

const Profile = DefaultLoader({
  loader: () => import('src/features/Profile')
});

const NodeBalancers = DefaultLoader({
  loader: () => import('src/features/NodeBalancers')
});

const StackScripts = DefaultLoader({
  loader: () => import('src/features/StackScripts')
});

const SupportTickets = DefaultLoader({
  loader: () => import('src/features/Support/SupportTickets')
});

const SupportTicketDetail = DefaultLoader({
  loader: () => import('src/features/Support/SupportTicketDetail')
});

const Longview = DefaultLoader({
  loader: () => import('src/features/Longview')
});

const Managed = DefaultLoader({
  loader: () => import('src/features/Managed')
});

const Dashboard = DefaultLoader({
  loader: () => import('src/features/Dashboard')
});

const Help = DefaultLoader({
  loader: () => import('src/features/Help')
});

const SupportSearchLanding = DefaultLoader({
  loader: () => import('src/features/Help/SupportSearchLanding')
});

const SearchLanding = DefaultLoader({
  loader: () => import('src/features/Search')
});

const EventsLanding = DefaultLoader({
  loader: () => import('src/features/Events/EventsLanding')
});

type ClassNames = 'appFrame' | 'content' | 'wrapper' | 'grid' | 'switchWrapper';

const styles = (theme: Theme) =>
  createStyles({
    appFrame: {
      position: 'relative',
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      backgroundColor: theme.bg.main
    },
    content: {
      flex: 1,
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(14) + 103 // 215
      },
      [theme.breakpoints.up('xl')]: {
        marginLeft: theme.spacing(22) + 99 // 275
      }
    },
    wrapper: {
      padding: theme.spacing(3),
      transition: theme.transitions.create('opacity'),
      [theme.breakpoints.down('sm')]: {
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
      }
    },
    grid: {
      [theme.breakpoints.up('lg')]: {
        height: '100%'
      }
    },
    switchWrapper: {
      flex: 1,
      maxWidth: '100%',
      position: 'relative',
      '&.mlMain': {
        [theme.breakpoints.up('lg')]: {
          maxWidth: '78.8%'
        }
      }
    }
  });
interface MainProps {
  menuOpen: boolean;
  isLoggedInAsCustomer: boolean;
  objRoute: JSX.Element | null;
  isKubernetesEnabled: boolean;
  isObjectStorageEnabled: boolean;
  username: string;
  welcomeBanner: any;
  userID?: number;
  closeWelcomeBanner: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  toggleSpacing: () => void;
  toggleTheme: () => void;
}

const _Main: React.FC<CombinedMainProps> = props => {
  const {
    classes,
    menuOpen,
    openMenu,
    closeMenu,
    isKubernetesEnabled,
    isLoggedInAsCustomer,
    objRoute,
    toggleSpacing,
    toggleTheme,
    username,
    userID,
    welcomeBanner,
    closeWelcomeBanner
  } = props;

  const ldClient = useLDClient();
  React.useEffect(() => {
    if (ldClient && userID) {
      const hashedID = md5(String(userID));
      console.log(hashedID);
      ldClient.identify({
        key: hashedID
      });
    }
  }, [ldClient, userID]);

  return (
    <>
      <div className={classes.appFrame}>
        <SideMenu
          open={menuOpen}
          closeMenu={closeMenu}
          toggleTheme={toggleTheme}
          toggleSpacing={toggleSpacing}
        />
        <main className={classes.content}>
          <TopMenu
            openSideMenu={openMenu}
            isLoggedInAsCustomer={isLoggedInAsCustomer}
            username={username}
          />
          {/* @todo: Uncomment when we deploy with LD */}
          {/* <VATBanner /> */}
          <div className={classes.wrapper} id="main-content">
            <Grid container spacing={0} className={classes.grid}>
              <Grid item className={classes.switchWrapper}>
                <Switch>
                  <Route path="/linodes" component={LinodesRoutes} />
                  <Route path="/volumes" component={Volumes} exact strict />
                  <Redirect path="/volumes*" to="/volumes" />
                  <Route path="/nodebalancers" component={NodeBalancers} />
                  <Route path="/domains" component={Domains} />
                  <Route exact path="/managed" component={Managed} />
                  <Route exact path="/longview" component={Longview} />
                  <Route exact strict path="/images" component={Images} />
                  <Redirect path="/images*" to="/images" />
                  <Route path="/stackscripts" component={StackScripts} />
                  {objRoute}
                  {isKubernetesEnabled && (
                    <Route path="/kubernetes" component={Kubernetes} />
                  )}
                  <Route path="/account" component={Account} />
                  <Route
                    exact
                    strict
                    path="/support/tickets"
                    component={SupportTickets}
                  />
                  <Route
                    path="/support/tickets/:ticketId"
                    component={SupportTicketDetail}
                    exact
                    strict
                  />
                  <Route path="/profile" component={Profile} />
                  <Route exact path="/support" component={Help} />
                  <Route
                    exact
                    strict
                    path="/support/search/"
                    component={SupportSearchLanding}
                  />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/search" component={SearchLanding} />
                  <Route path="/events" component={EventsLanding} />
                  <Redirect exact from="/" to="/dashboard" />
                  <Route component={NotFound} />
                </Switch>
              </Grid>
            </Grid>
          </div>
        </main>
        <Footer />
        <WelcomeBanner
          open={welcomeBanner}
          onClose={closeWelcomeBanner}
          data-qa-beta-notice
        />
        <ToastNotifications />
        <DomainDrawer />
        <VolumeDrawer />
        <BackupDrawer />
        {isObjectStorageEnabled && <BucketDrawer />}
      </div>
    </>
  );
};

export const styled = withStyles(styles);

type CombinedMainProps = MainProps & WithStyles<ClassNames>;
const Main = compose<CombinedMainProps, MainProps>(
  styled,
  withFeatureFlagProvider
)(_Main);

export default Main;
