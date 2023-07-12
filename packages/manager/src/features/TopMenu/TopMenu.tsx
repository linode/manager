import MenuIcon from '@mui/icons-material/Menu';
import * as React from 'react';
import { Hidden } from 'src/components/Hidden';
import { AppBar } from 'src/components/AppBar';
import { IconButton } from 'src/components/IconButton';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Toolbar } from 'src/components/Toolbar';
import { Typography } from 'src/components/Typography';
import { AddNewMenu } from './AddNewMenu/AddNewMenu';
import { Community } from './Community';
import { Help } from './Help';
import NotificationMenu from './NotificationMenu';
import SearchBar from './SearchBar';
import { TopMenuIcon } from './TopMenuIcon';
import UserMenu from './UserMenu';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    height: 50,
    color: theme.palette.text.primary,
    backgroundColor: theme.bg.bgPaper,
    position: 'relative',
    paddingRight: '0 !important',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  toolbar: {
    padding: 0,
    height: `50px !important`,
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
    isSideMenuOpen,
    openSideMenu,
    username,
    isLoggedInAsCustomer,
    desktopMenuToggle,
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
          <Typography style={{ fontSize: '1.2em', color: 'black' }}>
            You are logged in as customer: <strong>{username}</strong>
          </Typography>
        </div>
      )}
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar} variant="dense">
          <Hidden mdDown>
            <TopMenuIcon title={navHoverText} key={navHoverText}>
              <IconButton
                color="inherit"
                aria-label="open menu"
                onClick={desktopMenuToggle}
                size="large"
                data-testid="open-nav-menu"
              >
                <MenuIcon />
              </IconButton>
            </TopMenuIcon>
          </Hidden>
          <Hidden mdUp>
            <TopMenuIcon title={navHoverText} key={navHoverText}>
              <IconButton
                color="inherit"
                aria-label="open menu"
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
