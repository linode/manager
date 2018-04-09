import * as React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import Axios from 'axios';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
  MuiThemeProvider,
  createMuiTheme,
} from 'material-ui/styles';
import CssBaseline from 'material-ui/CssBaseline';

import Typography from 'material-ui/Typography';
import 'typeface-lato';

import { API_ROOT } from 'src/constants';
import LinodeTheme from 'src/theme';
import TopMenu from 'src/features/TopMenu';
import SideMenu from 'src/components/SideMenu';
import DefaultLoader from 'src/components/DefaultLoader';
import { request, response } from 'src/store/reducers/resources';
import Footer from 'src/features/Footer';
import BetaNotification from './BetaNotification';

const LinodesRoutes = DefaultLoader({
  loader: () => import('src/features/linodes'),
});

const Profile = DefaultLoader({
  loader: () => import('src/features/profile'),
});

const theme = createMuiTheme(LinodeTheme as Linode.TodoAny);
theme.shadows = theme.shadows.fill('none');

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  content: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      marginLeft: 215,
    },
  },
  wrapper: {
    backgroundColor: LinodeTheme.bg.main,
    flex: 1,
    padding: theme.spacing.unit * 3,
    marginBottom: -100 + theme.spacing.unit * 3,
    paddingBottom: 100 + theme.spacing.unit * 3,
  },
});

interface Props {
}

interface ConnectedProps {
  request: typeof request;
  response: typeof response;
}

interface State {
  menuOpen: Boolean;
  betaNotification: Boolean;
}

/**
 * Temoporary route.
 */
const TempRoute = (props: any) => {
  const { render, ...rest } = props;
  return <Route
    {...rest}
    render={renderProps => (
      <Typography variant="display1">
        {render(renderProps)}
      </Typography>
    )}
  />;
};

type CombinedProps = Props & WithStyles<'appFrame' | 'content' | 'wrapper'> & ConnectedProps;

export class App extends React.Component<CombinedProps, State> {
  state = {
    menuOpen: false,
    betaNotification: true,
  };

  componentDidMount() {
    const { request, response } = this.props;

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
  }

  render() {
    const { menuOpen } = this.state;
    const { classes } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <React.Fragment>
          <CssBaseline />
          <div className={classes.appFrame}>
            <SideMenu open={menuOpen} toggle={this.toggleMenu} />
            <main className={classes.content}>
              <TopMenu toggleSideMenu={this.toggleMenu} />
              <div className={classes.wrapper}>
                <Switch>
                  <TempRoute exact path="/dashboard" render={() => 'Dashboard'} />
                  <Route path="/linodes" component={LinodesRoutes} />
                  <TempRoute exact path="/volumes" render={() => 'Volumes'} />
                  <TempRoute exact path="/nodebalancers" render={() => 'NodeBalancers'} />
                  <TempRoute exact path="/domains" render={() => 'Domains'} />
                  <TempRoute exact path="/managed" render={() => 'Managed'} />
                  <TempRoute exact path="/longview" render={() => 'LongView'} />
                  <TempRoute exact path="/stackscripts" render={() => 'StackScripts'} />
                  <TempRoute exact path="/images" render={() => 'Images'} />
                  <Route path="/profile" component={Profile} />
                  <Route exact path="/" render={() => (<Redirect to="/linodes" />)} />
                </Switch>
              </div>
            <Footer />
            </main>
          </div>
          <BetaNotification open={this.state.betaNotification} onClose={this.closeBetaNotice} />
        </React.Fragment>
      </MuiThemeProvider>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  {
    request,
    response,
  },
  dispatch);

export const connected = connect(null, mapDispatchToProps);

export const styled = withStyles(styles, { withTheme: true });

export default connected(styled(App)) as any;
