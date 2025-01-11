import { Box, Stack, Typography } from '@linode/ui';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, useMediaQuery } from '@mui/material';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { AppBar } from 'src/components/AppBar';
import { StyledAkamaiLogo } from 'src/components/PrimaryNav/PrimaryNav.styles';
import { Toolbar } from 'src/components/Toolbar';
import { useAuthentication } from 'src/hooks/useAuthentication';

import { Community } from './Community';
import { CreateMenu } from './CreateMenu/CreateMenu';
import { Help } from './Help';
import { NotificationMenu } from './NotificationMenu/NotificationMenu';
import SearchBar from './SearchBar/SearchBar';
import { TopMenuTooltip } from './TopMenuTooltip';
import { UserMenu } from './UserMenu';

import type { Theme } from '@mui/material';

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
  const { isSideMenuOpen, openSideMenu, username } = props;

  const { loggedInAsCustomer } = useAuthentication();

  const isNarrowViewport = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(960)
  );

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
            sx={(theme) => ({
              font: theme.tokens.typography.Body.Regular,
            })}
            color={(theme) => theme.tokens.color.Neutrals.Black}
          >
            You are logged in as customer: <strong>{username}</strong>
          </Typography>
        </Box>
      )}
      <AppBar data-qa-appbar>
        <Toolbar variant="dense">
          {isNarrowViewport && (
            <TopMenuTooltip title={navHoverText}>
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
            sx={(theme) => ({
              [theme.breakpoints.down('md')]: {
                gap: theme.tokens.spacing[50],
              },
            })}
            alignItems="center"
            display="flex"
            flexGrow={1}
            flexShrink={0}
            gap={(theme) => theme.tokens.spacing[80]}
          >
            <Link
              aria-label="Akamai - Dashboard"
              style={{ lineHeight: 0 }}
              title="Akamai - Dashboard"
              to={`/dashboard`}
            >
              <StyledAkamaiLogo
                sx={(theme) => ({
                  [theme.breakpoints.down('md')]: {
                    width: 79,
                  },
                  width: 83,
                })}
              />
            </Link>
            <Box
              sx={(theme) => ({
                paddingRight: theme.tokens.spacing[60],
                [theme.breakpoints.up('md')]: {
                  paddingRight: theme.tokens.spacing[80],
                },
              })}
              flexGrow={1}
              flexShrink={0}
            >
              <SearchBar />
            </Box>
          </Box>

          <Stack
            sx={(theme) => ({
              gap: theme.tokens.spacing[70],
              [theme.breakpoints.down('md')]: {
                gap: 0,
              },
            })}
            alignItems="center"
            direction="row"
            justifyContent="flex-end"
          >
            <CreateMenu />
            <Box display="flex">
              <Help />
              <Community />
              <NotificationMenu />
            </Box>
            <UserMenu />
          </Stack>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
});
