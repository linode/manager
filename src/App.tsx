import * as React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { connect, Dispatch } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import Axios from 'axios';
import { append, pathOr, range, flatten } from 'ramda';
import * as Promise from 'bluebird';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui/styles';
import CssBaseline from 'material-ui/CssBaseline';
import 'typeface-lato';

import { API_ROOT } from 'src/constants';
import TopMenu from 'src/features/TopMenu';
import Grid from 'src/components/Grid';
import SideMenu from 'src/components/SideMenu';
import DefaultLoader from 'src/components/DefaultLoader';
import { request, response } from 'src/store/reducers/resources';
import Footer from 'src/features/Footer';
import Placeholder from 'src/components/Placeholder';

import NodeBalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import ToastNotifications from 'src/features/ToastNotifications';
import AccountLevelNotifications from 'src/features/AccountLevelNotifications';

import BetaNotification from './BetaNotification';
import DocsSidebar from 'src/components/DocsSidebar';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';

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

type ClassNames = 'appFrame'
  | 'content'
  | 'wrapper'
  | 'grid'
  | 'switchWrapper';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    height: '100%',
  },
  content: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      marginLeft: 215,
    },
    [theme.breakpoints.up('xl')]: {
      marginLeft: 275,
    },
  },
  wrapper: {
    backgroundColor: theme.bg.main,
    flex: 1,
    padding: theme.spacing.unit * 3,
    marginBottom: -100 + theme.spacing.unit * 3,
    paddingBottom: 100 + theme.spacing.unit * 3,
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
        request(['types']);
        return Axios.get(`${API_ROOT}/linode/types`)
          .then(({ data }) => {
            response(['types'], data);
          })
          .catch(error => response(['types'], error));
      }),
      new Promise(() => {
        request(['profile']);
        return Axios.get(`${API_ROOT}/profile`)
          .then(({ data }) => {
            response(['profile'], data);
          })
          .catch(error => response(['profile'], error));
      }),
      new Promise(() => {
        request(['kernels']);
        // Get first page of kernels.
        return Axios.get(`${API_ROOT}/linode/kernels`)
          .then(({ data: { data: firstPageData, page, pages } }) => {
            // If we only have one page, return it.
            if (page === pages) { return firstPageData; }

            // Create an iterable list of the remaining pages.
            const remainingPages = range(page + 1, pages + 1);

            return Promise.map(remainingPages, currentPage =>
              Axios
                .get(`${API_ROOT}/linode/kernels`, { params: { page: currentPage } })
                .then(response => response.data.data),
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

    return (
      <Router>
        {longLivedLoaded &&
          <React.Fragment>
            <CssBaseline />
            <div className={classes.appFrame}>
              <SideMenu open={menuOpen} toggle={this.toggleMenu} toggleTheme={toggleTheme} />
              <main className={classes.content}>
                <AccountLevelNotifications />
                <TopMenu toggleSideMenu={this.toggleMenu} />
                <div className={classes.wrapper}>
                  <Grid container spacing={0}  className={classes.grid}>
                    <Grid item className={classes.switchWrapper}>
                      <Switch>
                        <Route exact path="/dashboard" render={() =>
                          <Placeholder title="Dashboard" />} />
                        <Route path="/linodes" component={LinodesRoutes} />
                        <Route path="/volumes" component={Volumes} />
                        <Route exact path="/nodebalancers" render={() =>
                          <Placeholder
                            title="NodeBalancers"
                            icon={NodeBalancerIcon}
                          />}
                        />
                        <Route exact path="/domains" component={Domains}/>
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
                        <Redirect to="/linodes" />
                      </Switch>
                    </Grid>
                    <DocsSidebar docs={documentation} />
                  </Grid>
                </div>
                <Footer />
              </main>
            </div>
            <BetaNotification
              open={this.state.betaNotification}
              onClose={this.closeBetaNotice}
              data-qa-beta-notice />
            <ToastNotifications />
            <VolumeDrawer />
          </React.Fragment>
        }
      </Router>
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
    && Boolean(pathOr(false, ['resources', 'profile', 'data'], state)),
  documentation: state.documentation,
});

export const connected = connect(mapStateToProps, mapDispatchToProps);

export const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  styled,
)(App);
