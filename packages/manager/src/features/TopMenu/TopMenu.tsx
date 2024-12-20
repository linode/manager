import { Box, Stack, Typography } from '@linode/ui';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { AppBar } from 'src/components/AppBar';
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
import { UserMenu } from './UserMenu';

export interface TopMenuProps {
  desktopMenuToggle: () => void;
  username: string;
}

/**
 * - Items presented in the top navigation are considered universally important and should be available regardless of any particular task.
 * - The number of items should be limited. In the future, **Help & Support** could become a drop down with links to **Community**, **Guides**, and etc.
 */
export const TopMenu = React.memo((props: TopMenuProps) => {
  const { username } = props;

  const { loggedInAsCustomer } = useAuthentication();

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
      <AppBar
        sx={(theme) => ({
          backgroundColor: theme.tokens.background.Black,
          position: 'sticky',
          zIndex: 1500,
        })}
        data-qa-appbar
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
          <SearchBar />

          <Stack
            direction="row"
            sx={{ alignItems: 'center', margin: '0 0 0 auto' }}
          >
            <CreateMenu />

            <Help />
            <Community />

            <NotificationMenu />

            <UserMenu />
          </Stack>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
});
