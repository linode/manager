import * as React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import Reboot from 'material-ui/Reboot';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Hidden from 'material-ui/Hidden';
import Drawer from 'material-ui/Drawer';

import MenuIcon from 'material-ui-icons/Menu';

import PrimaryNav from 'src/components/PrimaryNav';

const drawerWidth = 250;

const styles = (theme: any): any => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  appBar: {
    backgroundColor: '#333',
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  drawerPaper: {
    height: '100%',
    width: 250,
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      position: 'relative',
      height: '100%',
    },
  },
  drawerDocked: {
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

class App extends React.Component<any, any> {
  state = {
    drawerOpen: false,
  };

  toggleMenu = () => {
    this.setState({
      drawerOpen: !this.state.drawerOpen,
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Reboot />
        <div className={classes.appFrame}>
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.toggleMenu}
                className={classes.navIconHide}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="title" color="inherit" noWrap>
                Linode Manager
              </Typography>
            </Toolbar>
          </AppBar>
          <Hidden mdUp>
            <Drawer
              variant="temporary"
              open={this.state.drawerOpen}
              classes={{
                paper: classes.drawerPaper,
              }}
              onClose={this.toggleMenu}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              <PrimaryNav toggleMenu={this.toggleMenu} />
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              variant="permanent"
              open
              classes={{
                paper: classes.drawerPaper,
                docked: classes.drawerDocked,
              }}
            >
              <PrimaryNav toggleMenu={this.toggleMenu} />
            </Drawer>
          </Hidden>
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
                <Route exact path="/" render={() => (<Redirect to="/dashboard" />)} />
              </Switch>
            </Typography>
          </main>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(App);
