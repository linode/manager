import MenuIcon from '@mui/icons-material/Menu';
import * as React from 'react';

import { AppBar } from 'src/components/AppBar';
import { Box } from 'src/components/Box';
import { Hidden } from 'src/components/Hidden';
import { IconButton } from 'src/components/IconButton';
import { Toolbar } from 'src/components/Toolbar';
import { Typography } from 'src/components/Typography';
import { useAuthentication } from 'src/hooks/useAuthentication';

import { AddNewMenu } from './AddNewMenu/AddNewMenu';
import { Community } from './Community';
import { Help } from './Help';
import { NotificationMenu } from './NotificationMenu/NotificationMenu';
import SearchBar from './SearchBar/SearchBar';
import { TopMenuIcon } from './TopMenuIcon';
import { UserMenu } from './UserMenu';

export interface TopMenuProps {
  desktopMenuToggle: () => void;
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  username: string;
}

/**
 * - Items presented in the top navigation are considered universally important and should be available regardless of any particular task.
 * - The number of items should be limited. In the future, **Help & Support** could become a drop down with links to **Community**, **Guides**, and etc.
 */
export const TopMenu = React.memo((props: TopMenuProps) => {
  const { desktopMenuToggle, isSideMenuOpen, openSideMenu, username } = props;

  const { loggedInAsCustomer } = useAuthentication();

  const navHoverText = isSideMenuOpen
    ? 'Collapse side menu'
    : 'Expand side menu';

  return (
    <React.Fragment>
      {loggedInAsCustomer && (
        <Box bgcolor="pink" padding="1em" textAlign="center">
          <Typography color="black" fontSize="1.2em">
            You are logged in as customer: <strong>{username}</strong>
          </Typography>
        </Box>
      )}
      <AppBar
        sx={(theme) => ({
          backgroundColor: theme.bg.bgPaper,
          color: theme.palette.text.primary,
          position: 'relative',
        })}
      >
        <Toolbar
          sx={(theme) => ({
            '&.MuiToolbar-root': {
              height: `50px`,
              padding: theme.spacing(0),
              width: '100%',
            },
          })}
          variant="dense"
        >
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
});
