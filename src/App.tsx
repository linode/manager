import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect, Dispatch } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { append, pathOr, range, flatten } from 'ramda';
import * as Promise from 'bluebird';
import { shim } from 'promise.prototype.finally';
shim(); // allows for .finally() usage

import { withStyles, WithStyles, StyleRulesCallback, Theme } from '@material-ui/core/styles';
import 'typeface-lato';

import { getLinodeTypes, getLinodeKernels } from 'src/services/linodes';
import { getProfile } from 'src/services/profile';
import TopMenu from 'src/features/TopMenu';
import Grid from 'src/components/Grid';
import SideMenu from 'src/components/SideMenu';
import DefaultLoader from 'src/components/DefaultLoader';
import { request, response } from 'src/store/reducers/resources';
import Footer from 'src/features/Footer';
import Placeholder from 'src/components/Placeholder';
import NotFound from 'src/components/NotFound';

import ToastNotifications from 'src/features/ToastNotifications';
import AccountLevelNotifications from 'src/features/AccountLevelNotifications';

import BetaNotification from './BetaNotification';
import DocsSidebar from 'src/components/DocsSidebar';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import { getRegions } from 'src/services/misc';

const LinodesRoutes = DefaultLoader({
  loader: () => import('src/features/linodes'),
});

const Volumes = DefaultLoader({
  loader: () => import('src/features/Volumes'),
});

const Domains = DefaultLoader({
  loader: () => import('src/features/Domains'),
});

const Profile = DefaultLoader({
  loader: () => import('src/features/profile'),
});

const NodeBalancers = DefaultLoader({
  loader: () => import('src/features/NodeBalancers'),
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
}

type CombinedProps = Props & WithStyles<ClassNames> & ConnectedProps;

export class App extends React.Component<CombinedProps, State> {
  state = {
    menuOpen: false,
    betaNotification: false,
  };

  componentDidMount() {
    const { request, response } = this.props;

    const betaNotification = window.localStorage.getItem('BetaNotification');
    if (betaNotification !== 'closed') {
      this.setState({ betaNotification: true });
    }

    const promises = [
      new Promise(() => {
        request(['regions']);
        return getRegions()
          .then(({ data }) => response(['regions', 'data'], data))
          .catch(error => response(['regions'], error));
      }),
      new Promise(() => {
        request(['types']);
        return getLinodeTypes()
          .then(({ data }) => response(['types', 'data'], data))
          .catch(error => response(['types'], error));
      }),
      new Promise(() => {
        request(['profile']);
        return getProfile()
          .then(({ data }) => {
            response(['profile'], data);
          })
          .catch(error => response(['profile'], error));
      }),
      new Promise(() => {
        request(['kernels']);
        // Get first page of kernels.
        return getLinodeKernels()
          .then(({ data: firstPageData, page, pages }) => {
            // If we only have one page, return it.
            if (page === pages) { return firstPageData; }

            // Create an iterable list of the remaining pages.
            const remainingPages = range(page + 1, pages + 1);

            return Promise.map(remainingPages, currentPage =>
              getLinodeKernels(currentPage)
                .then(response => response.data),
            )
              .then(compose(flatten, append(firstPageData)));
          })
          .then(data => response(['kernels'], data))
          .catch(error => response(['kernels'], error));
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

  render() {
    const { menuOpen } = this.state;
    const { classes, longLivedLoaded, documentation, toggleTheme } = this.props;
    const hasDoc = documentation.length > 0;

    return (
      <React.Fragment>
        {longLivedLoaded &&
          <React.Fragment>
            <div className={classes.appFrame}>
              <SideMenu open={menuOpen} toggle={this.toggleMenu} toggleTheme={toggleTheme} />
              <main className={classes.content}>
                <AccountLevelNotifications />
                <TopMenu toggleSideMenu={this.toggleMenu} />
                <div className={classes.wrapper}>
                  <Grid container spacing={0} className={classes.grid}>
                    <Grid item className={`${classes.switchWrapper} ${hasDoc ? 'mlMain' : ''}`}>
                      <Switch>
                        <Route exact path="/dashboard" render={() =>
                          <Placeholder title="Dashboard" />} />
                        <Route path="/linodes" component={LinodesRoutes} />
                        <Route path="/volumes" component={Volumes} />
                        <Route path="/nodebalancers" component={NodeBalancers} />
                        <Route path="/domains" component={Domains} />
                        <Route exact path="/managed" render={() =>
                          <Placeholder title="Managed" />} />
                        <Route exact path="/longview" render={() =>
                          <Placeholder title="Longview" />} />
                        <Route exact path="/stackscripts" render={() =>
                          <Placeholder title="StackScripts" />} />
                        <Route exact path="/images" render={() =>
                          <Placeholder title="Images" />} />
                        <Route exact path="/billing" render={() =>
                          <Placeholder title="Billing" />} />
                        <Route exact path="/users" render={() =>
                          <Placeholder title="Users" />} />
                        <Route exact path="/support" render={() =>
                          <Placeholder title="Support" />} />
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
  longLivedLoaded:
    Boolean(pathOr(false, ['resources', 'types', 'data', 'data'], state))
    && Boolean(pathOr(false, ['resources', 'kernels', 'data'], state))
    && Boolean(pathOr(false, ['resources', 'profile', 'data'], state))
    && Boolean(pathOr(false, ['resources', 'regions', 'data'], state)),
  documentation: state.documentation,
});

export const connected = connect(mapStateToProps, mapDispatchToProps);

export const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  styled,
)(App);
