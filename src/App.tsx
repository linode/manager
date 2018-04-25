import * as React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect, Dispatch } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import Axios from 'axios';
import { pathOr } from 'ramda';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
  MuiThemeProvider,
  createMuiTheme,
} from 'material-ui/styles';
import CssBaseline from 'material-ui/CssBaseline';
import Grid from 'material-ui/Grid';
import 'typeface-lato';

import { API_ROOT } from 'src/constants';
import LinodeTheme from 'src/theme';
import TopMenu from 'src/features/TopMenu';
import SideMenu from 'src/components/SideMenu';
import DefaultLoader from 'src/components/DefaultLoader';
import { request, response } from 'src/store/reducers/resources';
import Footer from 'src/features/Footer';
import Placeholder from 'src/components/Placeholder';

import NodeBalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import ToastNotifications from 'src/features/ToastNotifications';
import AccountLevelNotifications from 'src/features/AccountLevelNotifications';

import BetaNotification from './BetaNotification';
import DocsSidebar from 'src/components/DocsSidebar';

const LinodesRoutes = DefaultLoader({
  loader: () => import('src/features/linodes'),
});

const Profile = DefaultLoader({
  loader: () => import('src/features/profile'),
});

const theme = createMuiTheme(LinodeTheme as Linode.TodoAny);
theme.shadows = theme.shadows.fill('none');

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
    backgroundColor: LinodeTheme.bg.main,
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
    const { classes, longLivedLoaded, documentation } = this.props;

    return (
      <React.Fragment>
        {longLivedLoaded &&
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <div className={classes.appFrame}>
              <SideMenu open={menuOpen} toggle={this.toggleMenu} />
              <main className={classes.content}>
                <AccountLevelNotifications />
                <TopMenu toggleSideMenu={this.toggleMenu} />
                <div className={classes.wrapper}>
                  <Grid container className={classes.grid}>
                    <div className={classes.switchWrapper}>
                      <Switch>
                        <Route exact path="/dashboard" render={() =>
                          <Placeholder title="Dashboard" />} />
                        <Route path="/linodes" component={LinodesRoutes} />
                        <Route exact path="/volumes" render={() =>
                          <Placeholder
                            title="Volumes"
                            icon={VolumeIcon}
                          />}
                        />
                        <Route exact path="/nodebalancers" render={() =>
                          <Placeholder
                            title="NodeBalancers"
                            icon={NodeBalancerIcon}
                          />}
                        />
                        <Route exact path="/domains" render={() =>
                          <Placeholder title="Domains" />} />
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
                        <Route path="/profile" component={Profile} />
                        <Route exact path="/support" render={() =>
                          <Placeholder title="Support" />} />
                        <Route path="/profile" component={Profile} />
                        <Redirect to="/linodes" />
                      </Switch>
                    </div>
                    <DocsSidebar docs={documentation} />
                  </Grid>
                </div>
                <Footer />
              </main>
            </div>
            <BetaNotification
              open={this.state.betaNotification}
              onClose={this.closeBetaNotice}
              data-qa-beta-notice/>
            <ToastNotifications />
          </MuiThemeProvider>
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
    && Boolean(pathOr(false, ['resources', 'profile', 'data'], state)),
  documentation: state.documentation,
});

export const connected = connect(mapStateToProps, mapDispatchToProps);

export const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  styled,
)(App);
