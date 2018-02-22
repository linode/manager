import * as React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import {
  withStyles,
  WithStyles,
  StyleRules,
  Theme,
} from 'material-ui/styles';
import Reboot from 'material-ui/Reboot';
import Typography from 'material-ui/Typography';

import { TodoAny } from 'src/utils';
import TopMenu from 'src/components/TopMenu';
import SideMenu from 'src/components/SideMenu';

const styles = (theme: Theme): StyleRules => ({
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

type Props = WithStyles<'appFrame' | 'content'>;

class App extends React.Component<Props> {
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
            <Typography variant="display1" noWrap>
              <Switch>
                <Route exact path="/dashboard" render={() => 'Dashboard'} />
                <Route exact path="/linodes" render={() => 'Linodes'} />
                <Route exact path="/volumes" render={() => 'Volumes'} />
                <Route exact path="/nodebalancers" render={() => 'NodeBalancers'} />
                <Route exact path="/domains" render={() => 'Domains'} />
                <Route exact path="/managed" render={() => 'Managed'} />
                <Route exact path="/longview" render={() => 'LongView'} />
                <Route exact path="/stackscripts" render={() => 'StackScripts'} />
                <Route exact path="/images" render={() => 'Images'} />
                <Route exact path="/profile" render={() => 'Profile'} />
                <Route exact path="/" render={() => (<Redirect to="/dashboard" />)} />
              </Switch>
            </Typography>
          </main>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(App) as TodoAny;
