import MenuIcon from '@mui/icons-material/Menu';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { AppBar } from 'src/components/AppBar';
import { Hidden } from 'src/components/Hidden';
import { IconButton } from 'src/components/IconButton';
import { Toolbar } from 'src/components/Toolbar';
import { Typography } from 'src/components/Typography';

import { AddNewMenu } from './AddNewMenu/AddNewMenu';
import { Community } from './Community';
import { Help } from './Help';
import NotificationMenu from './NotificationMenu';
import SearchBar from './SearchBar';
import { TopMenuIcon } from './TopMenuIcon';
import { UserMenu } from './UserMenu';

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
  desktopMenuToggle: () => void;
  isLoggedInAsCustomer: boolean;
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
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

  const classes = useStyles();

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
            <TopMenuIcon key={navHoverText} title={navHoverText}>
              <IconButton
                aria-label="open menu"
                color="inherit"
                data-testid="open-nav-menu"
                onClick={desktopMenuToggle}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </TopMenuIcon>
          </Hidden>
          <Hidden mdUp>
            <TopMenuIcon key={navHoverText} title={navHoverText}>
              <IconButton
                aria-label="open menu"
                color="inherit"
                onClick={openSideMenu}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </TopMenuIcon>
          </Hidden>
          <AddNewMenu />
          <SearchBar />
          <Help />
          <Community />
          <NotificationMenu />
          <UserMenu />
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default React.memo(TopMenu);
