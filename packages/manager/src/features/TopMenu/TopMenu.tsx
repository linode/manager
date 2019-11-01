import MenuIcon from '@material-ui/icons/Menu';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Toolbar from 'src/components/core/Toolbar';
import Typography from 'src/components/core/Typography';
import AddNewMenu from './AddNewMenu';
import SearchBar from './SearchBar';
import UserEventsMenu from './UserEventsMenu';
import UserMenu from './UserMenu';
import UserNotificationsMenu from './UserNotificationsMenu';

type ClassNames = 'root' | 'flex' | 'appBar' | 'toolbar' | 'navIconHide';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.text.primary
    },
    flex: {
      flex: 1
    },
    appBar: {
      color: theme.palette.text.primary,
      backgroundColor: theme.bg.topMenu,
      position: 'relative',
      paddingRight: '0 !important'
    },
    toolbar: {
      minHeight: theme.spacing(4) + 32,
      padding: `${theme.spacing(1)}px 0`,
      [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
      },
      [theme.breakpoints.up('lg')]: {
        minHeight: theme.spacing(5) + 40,
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3)
      }
    },
    navIconHide: {
      order: 1,
      '& > span': {
        justifyContent: 'flex-start'
      },
      '& svg': {
        width: 32,
        height: 32
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: -theme.spacing(2)
      }
    }
  });

interface Props {
  openSideMenu: () => void;
  desktopMenuIsOpen: boolean;
  desktopOpenSideMenu: () => void;
  desktopCloseSideMenu: () => void;
  isLoggedInAsCustomer: boolean;
  username: string;
}

type PropsWithStyles = Props & WithStyles<ClassNames>;

class TopMenu extends React.Component<PropsWithStyles> {
  render() {
    const {
      classes,
      desktopMenuIsOpen,
      openSideMenu,
      desktopCloseSideMenu,
      desktopOpenSideMenu
    } = this.props;

    return (
      <React.Fragment>
        {this.props.isLoggedInAsCustomer && (
          <div
            style={{
              backgroundColor: 'pink',
              padding: '1em',
              textAlign: 'center'
            }}
          >
            <Typography style={{ fontSize: '1.2em', color: 'black' }}>
              You are logged in as customer:{' '}
              <strong>{this.props.username}</strong>
            </Typography>
          </div>
        )}
        <AppBar className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <Hidden mdDown>
              <IconButton
                color="inherit"
                aria-label="open menu"
                onClick={
                  desktopMenuIsOpen ? desktopCloseSideMenu : desktopOpenSideMenu
                }
                className={classes.navIconHide}
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Hidden lgUp>
              <IconButton
                color="inherit"
                aria-label="open menu"
                onClick={openSideMenu}
                className={classes.navIconHide}
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
            <SearchBar />
            <AddNewMenu />
            <UserMenu />
            <UserNotificationsMenu />
            <UserEventsMenu />
          </Toolbar>
        </AppBar>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(TopMenu);
