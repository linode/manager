import * as React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import * as Loadable from 'react-loadable';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui/styles';
import Reboot from 'material-ui/Reboot';
import Typography from 'material-ui/Typography';

import TopMenu from 'src/components/TopMenu';
import SideMenu from 'src/components/SideMenu';

import Axios from 'axios';
const ListLinodes = Loadable.Map({
  loader: {
    Component: () => import('src/features/linodes/ListLinodes'),
    linodes: () => Axios.get(`https://api.dev.linode.com/v4/linode/types`),
  },
  loading: () => null,
  render: (loaded, props) => {
    const Component = loaded.Component.default;
    return <Component {...props} />;
  },
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
    padding: theme.spacing.unit * 3,
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
  },
});

interface Props { }

type PropsWithStyles = Props & WithStyles<'appFrame' | 'content'>;

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

class App extends React.Component<PropsWithStyles, State> {
  state = {
    menuOpen: false,
  };

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
          </main>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(App);
