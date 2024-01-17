import { GlobalGrantTypes } from '@linode/api-v4/lib/account';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { Theme, styled, useMediaQuery } from '@mui/material';
import Popover from '@mui/material/Popover';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Stack } from 'src/components/Stack';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { SwitchAccountButton } from 'src/features/Account/SwitchAccountButton';
import { SwitchAccountDrawer } from 'src/features/Account/SwitchAccountDrawer';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { useAccountUser } from 'src/queries/accountUsers';
import { useGrants, useProfile } from 'src/queries/profile';
import { getStorage } from 'src/utilities/storage';

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
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { data: user } = useAccountUser(profile?.username ?? '');
  const { data: grants } = useGrants();
  const { enqueueSnackbar } = useSnackbar();
  const flags = useFlags();

  const hasGrant = (grant: GlobalGrantTypes) =>
    grants?.global?.[grant] ?? false;
  const isRestrictedUser = profile?.restricted ?? false;
  const hasAccountAccess = !isRestrictedUser || hasGrant('account_access');
  const hasReadWriteAccountAccess = hasGrant('account_access') === 'read_write';
  const user_type = user?.user_type;
  const hasParentChildAccountAccess = Boolean(flags.parentChildAccountAccess);
  const isParentUser = user_type === 'parent';
  const isProxyUser = user_type === 'proxy';
  const canSwitchBetweenAccounts = isParentUser || isProxyUser;
  const open = Boolean(anchorEl);
  const id = open ? 'user-menu-popover' : undefined;
  const companyName = (user_type && account?.company) ?? '';
  const showCompanyName = hasParentChildAccountAccess && companyName;

  // Used for fetching parent profile and account data by making a request with the parent's token.
  const proxyHeaders =
    hasParentChildAccountAccess && isProxyUser
      ? {
          Authorization: getStorage(`authentication/parent_token/token`),
        }
      : undefined;

  const { data: parentProfile } = useProfile({ headers: proxyHeaders });

  const userName =
    (hasParentChildAccountAccess && isProxyUser ? parentProfile : profile)
      ?.username ?? '';

  const matchesSmDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    // Run after we've switched to a proxy user.
    if (isProxyUser) {
      enqueueSnackbar(`Account switched to ${companyName}.`, {
        variant: 'success',
      });
    }
  }, [isProxyUser, companyName, enqueueSnackbar]);

  const accountLinks: MenuLink[] = React.useMemo(
    () => [
      {
        display: 'Billing & Contact Information',
        href: '/account/billing',
      },
      // Restricted users can't view the Users tab regardless of their grants
      {
        display: 'Users & Grants',
        hide: isRestrictedUser,
        href: '/account/users',
      },
      // Restricted users can't view the Transfers tab regardless of their grants
      {
        display: 'Service Transfers',
        hide: isRestrictedUser,
        href: '/account/service-transfers',
      },
      {
        display: 'Maintenance',
        href: '/account/maintenance',
      },
      // Restricted users with read_write account access can view Settings.
      {
        display: 'Account Settings',
        hide: !hasReadWriteAccountAccess,
        href: '/account/settings',
      },
    ],
    [hasReadWriteAccountAccess, isRestrictedUser]
  );

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
    const sx = {
      height: 26,
      width: 26,
    };

    return matchesSmDown ? undefined : open ? (
      <KeyboardArrowUp sx={sx} />
    ) : (
      <KeyboardArrowDown sx={{ color: '#9ea4ae', ...sx }} />
    );
  };

  return (
    <>
      <Tooltip
        disableTouchListener
        enterDelay={500}
        leaveDelay={0}
        title="Profile & Account"
      >
        <Button
          sx={(theme) => ({
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
            <Stack alignItems={'flex-start'}>
              <Typography
                sx={{
                  fontSize: showCompanyName ? '0.775rem' : '0.875rem',
                }}
              >
                {userName}
              </Typography>
              {showCompanyName && (
                <Typography
                  sx={(theme) => ({
                    fontFamily: theme.font.bold,
                    fontSize: '0.875rem',
                  })}
                >
                  {companyName}
                </Typography>
              )}
            </Stack>
          </Hidden>
        </Button>
      </Tooltip>
      <Popover
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        slotProps={{
          paper: {
            sx: {
              paddingX: 2.5,
              paddingY: 2,
            },
          },
        }}
        anchorEl={anchorEl}
        data-testid={id}
        id={id}
        marginThreshold={0}
        onClose={handleClose}
        open={open}
        // When the Switch Account drawer is open, hide the user menu popover so it's not covering the drawer.
        sx={{ zIndex: isDrawerOpen ? 0 : 1 }}
      >
        <Stack data-qa-user-menu minWidth={250} spacing={2}>
          {canSwitchBetweenAccounts && (
            <Typography>You are currently logged in as:</Typography>
          )}
          <Typography
            color={(theme) => theme.textColors.headlineStatic}
            fontSize="1.1rem"
          >
            <strong>{canSwitchBetweenAccounts ? companyName : userName}</strong>
          </Typography>
          {canSwitchBetweenAccounts && (
            <SwitchAccountButton
              buttonType="outlined"
              onClick={() => setIsDrawerOpen(true)}
            />
          )}
          <Box>
            <Heading>My Profile</Heading>
            <Divider color="#9ea4ae" />
            <Grid container>
              <Grid
                container
                direction="column"
                rowGap={1}
                wrap="nowrap"
                xs={6}
              >
                {profileLinks.slice(0, 4).map(renderLink)}
              </Grid>
              <Grid
                container
                direction="column"
                rowGap={1}
                wrap="nowrap"
                xs={6}
              >
                {profileLinks.slice(4).map(renderLink)}
              </Grid>
            </Grid>
          </Box>
          {hasAccountAccess && (
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
      <SwitchAccountDrawer
        onClose={() => {
          return setIsDrawerOpen(false);
        }}
        isProxyUser={isProxyUser}
        open={isDrawerOpen}
      />
    </>
  );
});

const Heading = styled(Typography)(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontSize: '.75rem',
  letterSpacing: 1.875,
  textTransform: 'uppercase',
}));
