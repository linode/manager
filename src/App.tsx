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
} from 'material-ui/styles';
import Reboot from 'material-ui/Reboot';
import Typography from 'material-ui/Typography';

import { API_ROOT } from 'src/constants';
import TopMenu from 'src/components/TopMenu';
import SideMenu from 'src/components/SideMenu';
import DefaultLoader from 'src/components/DefaultLoader';
import { request, response } from 'src/store/reducers/resources';
import Footer from 'src/components/Footer';

const ListLinodes = DefaultLoader({
  loader: () => import('src/features/linodes/ListLinodes'),
});

const styles: StyleRulesCallback = (theme: Theme) => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit * 3,
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
  },
  wrapper: {
    flex: 1,
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

type FinalProps = Props & WithStyles<'appFrame' | 'content' | 'wrapper'> & ConnectedProps;

export class App extends React.Component<FinalProps, State> {
  state = {
    menuOpen: false,
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

  render() {
    const { menuOpen } = this.state;
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Reboot />
        <div className={classes.appFrame}>
          <TopMenu toggleSideMenu={this.toggleMenu} />
          <SideMenu open={menuOpen} toggle={this.toggleMenu} />
          <main className={classes.content}>
            <div className={classes.wrapper}>
              <Switch>
                <TempRoute exact path="/dashboard" render={() => 'Dashboard'} />
                <Route exact path="/linodes" component={ListLinodes} />
                <TempRoute exact path="/volumes" render={() => 'Volumes'} />
                <TempRoute exact path="/nodebalancers" render={() => 'NodeBalancers'} />
                <TempRoute exact path="/domains" render={() => 'Domains'} />
                <TempRoute exact path="/managed" render={() => 'Managed'} />
                <TempRoute exact path="/longview" render={() => 'LongView'} />
                <TempRoute exact path="/stackscripts" render={() => 'StackScripts'} />
                <TempRoute exact path="/images" render={() => 'Images'} />
                <TempRoute exact path="/profile" render={() => 'Profile'} />
                <Route exact path="/" render={() => (<Redirect to="/dashboard" />)} />
              </Switch>
            </div>
          <Footer />
          </main>
        </div>
      </React.Fragment>
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
