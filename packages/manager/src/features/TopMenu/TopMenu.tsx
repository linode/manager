import { Box, Stack } from '@linode/ui';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { AppBar } from 'src/components/AppBar';
import { StyledAkamaiLogo } from 'src/components/PrimaryNav/PrimaryNav.styles';
import { Toolbar } from 'src/components/Toolbar';
import { useAuthentication } from 'src/hooks/useAuthentication';

import { Community } from './Community';
import { CreateMenu } from './CreateMenu/CreateMenu';
import { Help } from './Help';
import { InternalAdminBanner } from './InternalAdminBanner';
import { NotificationMenu } from './NotificationMenu/NotificationMenu';
import { SearchBar } from './SearchBar/SearchBar';
import { TopMenuTooltip } from './TopMenuTooltip';
import { UserMenu } from './UserMenu';

import type { Theme } from '@mui/material';

export interface TopMenuProps {
  /** Callback to toggle the desktop menu */
  desktopMenuToggle: () => void;
  /** Callback to open the side menu */
  openSideMenu: () => void;
  /** The username of the logged-in user */
  username: string;
}

/**
 * - Items presented in the top navigation are considered universally important and should be available regardless of any particular task.
 * - The number of items should be limited. In the future, **Help & Support** could become a drop down with links to **Community**, **Guides**, and etc.
 */
export const TopMenu = React.memo((props: TopMenuProps) => {
  const { openSideMenu, username } = props;

  const { loggedInAsCustomer } = useAuthentication();

  const isNarrowViewport = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(960)
  );

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {loggedInAsCustomer && <InternalAdminBanner username={username} />}
      <AppBar data-qa-appbar>
        <Toolbar variant="dense">
          {isNarrowViewport && (
            <TopMenuTooltip title="Expand side menu">
              <IconButton
                sx={(theme) => ({
                  padding: theme.tokens.spacing[60],
                })}
                aria-label="open menu"
                color="inherit"
                disableRipple
                onClick={openSideMenu}
              >
                <MenuIcon />
              </IconButton>
            </TopMenuTooltip>
          )}
          <Box
            gap={(theme) => ({
              md: theme.tokens.spacing[80],
              xs: theme.tokens.spacing[50],
            })}
            sx={(theme) => ({
              paddingLeft: {
                md: 0,
                sm: theme.tokens.spacing[60],
              },
            })}
            alignItems="center"
            display="flex"
            flexGrow={1}
            flexShrink={0}
          >
            {!isNarrowViewport && (
              <Link
                aria-label="Akamai - Dashboard"
                style={{ lineHeight: 0 }}
                title="Akamai - Dashboard"
                to={`/dashboard`}
              >
                <StyledAkamaiLogo
                  sx={{
                    width: {
                      md: 83,
                      xs: 79,
                    },
                  }}
                />
              </Link>
            )}
            <Box flexGrow={1} flexShrink={0}>
              <SearchBar />
            </Box>
          </Box>

          <Stack
            sx={(theme) => ({
              gap: {
                sm: theme.tokens.spacing[70],
                xs: theme.tokens.spacing[40],
              },
              paddingLeft: {
                sm: theme.tokens.spacing[80],
                xs: theme.tokens.spacing[60],
              },
              paddingRight: {
                md: 0,
                sm: theme.tokens.spacing[60],
                xs: theme.tokens.spacing[40],
              },
            })}
            alignItems="center"
            direction="row"
            justifyContent="flex-end"
          >
            {!isSmallScreen && <CreateMenu />}
            <Box
              gap={{
                md: 0,
                sm: theme.tokens.spacing[60],
                xs: theme.tokens.spacing[40],
              }}
              display="flex"
            >
              <Help />
              <Community />
              <NotificationMenu />
            </Box>
            <UserMenu />
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
});
