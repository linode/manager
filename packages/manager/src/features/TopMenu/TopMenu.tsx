import MenuIcon from '@mui/icons-material/Menu';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import Hidden from 'src/components/core/Hidden';
import { IconButton } from 'src/components/IconButton';
import { makeStyles } from '@mui/styles';
import { Theme, useTheme } from '@mui/material/styles';
import clsx from 'clsx';
import Toolbar from 'src/components/core/Toolbar';
import Typography from 'src/components/core/Typography';
import { AddNewMenu } from './AddNewMenu/AddNewMenu';
import Community from './Community';
import Help from './Help';
import NotificationMenu from './NotificationMenu';
import SearchBar from './SearchBar';
import TopMenuIcon from './TopMenuIcon';
import UserMenu from './UserMenu';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: theme.bg.bgPaper,
    color: theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    paddingRight: '0 !important',
    position: 'relative',
  },
  toolbar: {
    height: `50px !important`,
    padding: 0,
    width: '100%',
  },
}));

interface Props {
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  desktopMenuToggle: () => void;
  isLoggedInAsCustomer: boolean;
  username: string;
}

const TopMenu = (props: Props) => {
  const {
    desktopMenuToggle,
    isLoggedInAsCustomer,
    isSideMenuOpen,
    openSideMenu,
    username,
  } = props;

  const theme = useTheme();
  const classes = useStyles();

  const communityIconStyles = {
    [theme.breakpoints.down(370)]: {
      ...theme.visually.hidden,
    },
  };

  const navHoverText = isSideMenuOpen
    ? 'Collapse side menu'
    : 'Expand side menu';

  return (
    <React.Fragment>
      {isLoggedInAsCustomer && (
        <div
          style={{
            backgroundColor: 'pink',
            padding: '1em',
            textAlign: 'center',
          }}
        >
          <Typography style={{ color: 'black', fontSize: '1.2em' }}>
            You are logged in as customer: <strong>{username}</strong>
          </Typography>
        </div>
      )}
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar} variant="dense">
          <Hidden mdDown>
            <IconButton
              color="inherit"
              aria-label="open menu"
              onClick={desktopMenuToggle}
              size="large"
              data-testid="open-nav-menu"
            >
              <TopMenuIcon title={navHoverText} key={navHoverText}>
                <MenuIcon />
              </TopMenuIcon>
            </IconButton>
          </Hidden>
          <Hidden mdUp>
            <IconButton
              color="inherit"
              aria-label="open menu"
              onClick={openSideMenu}
              size="large"
            >
              <TopMenuIcon title={navHoverText} key={navHoverText}>
                <MenuIcon />
              </TopMenuIcon>
            </IconButton>
          </Hidden>
          <AddNewMenu />
          <SearchBar />
          <Help />
          <Community className={clsx(communityIconStyles)} />
          <NotificationMenu />
          <UserMenu />
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default React.memo(TopMenu);
