import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { Theme, styled, useMediaQuery } from '@mui/material';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useGrants } from 'src/queries/profile';

interface MenuLink {
  display: string;
  hide?: boolean;
  href: string;
}

const profileLinks: MenuLink[] = [
  {
    display: 'Display',
    href: '/profile/display',
  },
  { display: 'Login & Authentication', href: '/profile/auth' },
  { display: 'SSH Keys', href: '/profile/keys' },
  { display: 'LISH Console Settings', href: '/profile/lish' },
  {
    display: 'API Tokens',
    href: '/profile/tokens',
  },
  { display: 'OAuth Apps', href: '/profile/clients' },
  { display: 'Referrals', href: '/profile/referrals' },
  { display: 'My Settings', href: '/profile/settings' },
  { display: 'Log Out', href: '/logout' },
];

export const UserMenu = React.memo(() => {
  const {
    _hasAccountAccess,
    _isRestrictedUser,
    profile,
  } = useAccountManagement();

  const matchesSmDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'user-menu-popover' : undefined;

  const { data: grants } = useGrants();

  const hasFullAccountAccess =
    grants?.global?.account_access === 'read_write' || !_isRestrictedUser;

  const accountLinks: MenuLink[] = React.useMemo(
    () => [
      {
        display: 'Billing & Contact Information',
        href: '/account/billing',
      },
      // Restricted users can't view the Users tab regardless of their grants
      {
        display: 'Users & Grants',
        hide: _isRestrictedUser,
        href: '/account/users',
      },
      // Restricted users can't view the Transfers tab regardless of their grants
      {
        display: 'Service Transfers',
        hide: _isRestrictedUser,
        href: '/account/service-transfers',
      },
      {
        display: 'Maintenance',
        href: '/account/maintenance',
      },
      // Restricted users with read_write account access can view Settings.
      {
        display: 'Account Settings',
        hide: !hasFullAccountAccess,
        href: '/account/settings',
      },
    ],
    [hasFullAccountAccess, _isRestrictedUser]
  );

  const userName = profile?.username ?? '';

  const renderLink = (link: MenuLink) => {
    if (link.hide) {
      return null;
    }

    return (
      <Grid key={link.display} xs={12}>
        <Link
          data-testid={`menu-item-${link.display}`}
          onClick={handleClose}
          style={{ fontSize: '0.875rem' }}
          to={link.href}
        >
          {link.display}
        </Link>
      </Grid>
    );
  };

  const getEndIcon = () => {
    if (matchesSmDown) {
      return undefined;
    }
    if (open) {
      return <KeyboardArrowUp sx={{ height: 26, width: 26 }} />;
    }
    return (
      <KeyboardArrowDown sx={{ color: '#9ea4ae', height: 26, width: 26 }} />
    );
  };

  return (
    <>
      <Button
        sx={(theme) => ({
          '& .MuiButton-endIcon': {
            marginLeft: '4px',
          },
          backgroundColor: open ? theme.bg.app : undefined,
          height: '50px',
          minWidth: 'unset',
          textTransform: 'none',
        })}
        aria-describedby={id}
        data-testid="nav-group-profile"
        disableRipple
        endIcon={getEndIcon()}
        onClick={handleClick}
        startIcon={<GravatarByEmail email={profile?.email ?? ''} />}
      >
        <Hidden mdDown>
          <Typography sx={{ fontSize: '0.875rem' }}>{userName}</Typography>
        </Hidden>
      </Button>
      <Popover
        PaperProps={{
          sx: {
            padding: 2.5,
          },
        }}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        anchorEl={anchorEl}
        id={id}
        onClose={handleClose}
        open={open}
      >
        <Stack minWidth={250} spacing={2}>
          <Box
            sx={(theme) => ({
              color: theme.textColors.headlineStatic,
              fontSize: '1.1rem',
            })}
          >
            <strong>{userName}</strong>
          </Box>
          <Box>
            <Heading>My Profile</Heading>
            <Divider color="#9ea4ae" />
            <Grid container rowSpacing={1.5}>
              <Grid direction="column" wrap="nowrap" xs={6}>
                {profileLinks.slice(0, 4).map(renderLink)}
              </Grid>
              <Grid direction="column" wrap="nowrap" xs={6}>
                {profileLinks.slice(4).map(renderLink)}
              </Grid>
            </Grid>
          </Box>
          {_hasAccountAccess && (
            <Box>
              <Heading>Account</Heading>
              <Divider color="#9ea4ae" />
              <Stack mt={1} spacing={1.5}>
                {accountLinks.map((menuLink) =>
                  menuLink.hide ? null : (
                    <Link
                      data-testid={`menu-item-${menuLink.display}`}
                      key={menuLink.display}
                      onClick={handleClose}
                      style={{ fontSize: '0.875rem' }}
                      to={menuLink.href}
                    >
                      {menuLink.display}
                    </Link>
                  )
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </Popover>
    </>
  );
});

const Heading = styled(Typography)(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontSize: '.75rem',
  letterSpacing: 1.875,
  textTransform: 'uppercase',
}));
