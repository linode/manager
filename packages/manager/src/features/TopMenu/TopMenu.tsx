import { Box, IconButton, Typography } from '@linode/ui';
import MenuIcon from '@mui/icons-material/Menu';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { AppBar } from 'src/components/AppBar';
import { Hidden } from 'src/components/Hidden';
import {
  StyledAkamaiLogo,
  StyledLogoBox,
} from 'src/components/PrimaryNav/PrimaryNav.styles';
import { Toolbar } from 'src/components/Toolbar';
import { useAuthentication } from 'src/hooks/useAuthentication';

import { Community } from './Community';
import { CreateMenu } from './CreateMenu/CreateMenu';
import { Help } from './Help';
import { NotificationMenu } from './NotificationMenu/NotificationMenu';
import SearchBar from './SearchBar/SearchBar';
import { TopMenuTooltip } from './TopMenuTooltip';
import { UserMenu } from './UserMenu';

export interface TopMenuProps {
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  username: string;
}

export const TOPMENU_HEIGHT = 56;

/**
 * - Items presented in the top navigation are considered universally important and should be available regardless of any particular task.
 * - The number of items should be limited. In the future, **Help & Support** could become a drop down with links to **Community**, **Guides**, and etc.
 */
export const TopMenu = React.memo((props: TopMenuProps) => {
  const { isSideMenuOpen, openSideMenu, username } = props;

  const { loggedInAsCustomer } = useAuthentication();

  const navHoverText = isSideMenuOpen
    ? 'Collapse side menu'
    : 'Expand side menu';

  return (
    <React.Fragment>
      {loggedInAsCustomer && (
        <Box
          bgcolor={(theme) => theme.tokens.color.Pink[40]}
          padding="1em"
          textAlign="center"
        >
          <Typography
            color={(theme) => theme.tokens.color.Neutrals.Black}
            fontSize="1.2em"
          >
            You are logged in as customer: <strong>{username}</strong>
          </Typography>
        </Box>
      )}
      <AppBar data-qa-appbar>
        <Toolbar
          sx={(theme) => ({
            '&.MuiToolbar-root': {
              height: TOPMENU_HEIGHT,
              padding: theme.spacing(0),
              width: '100%',
            },
          })}
          variant="dense"
        >
          <Hidden mdDown>
            <Grid>
              <StyledLogoBox>
                <Link
                  aria-label="Akamai - Dashboard"
                  style={{ lineHeight: 0 }}
                  title="Akamai - Dashboard"
                  to={`/dashboard`}
                >
                  <StyledAkamaiLogo width={83} />
                </Link>
              </StyledLogoBox>
            </Grid>
          </Hidden>
          <Hidden mdUp>
            <TopMenuTooltip title={navHoverText}>
              <IconButton
                aria-label="open menu"
                color="inherit"
                onClick={openSideMenu}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </TopMenuTooltip>
          </Hidden>
          <CreateMenu />
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
