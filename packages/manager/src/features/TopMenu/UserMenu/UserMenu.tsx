import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { styled, useMediaQuery } from '@mui/material';
import Popover from '@mui/material/Popover';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Avatar } from 'src/components/Avatar/Avatar';
import { AvatarForProxy } from 'src/components/AvatarForProxy';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Stack } from 'src/components/Stack';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { SwitchAccountButton } from 'src/features/Account/SwitchAccountButton';
import { SwitchAccountDrawer } from 'src/features/Account/SwitchAccountDrawer';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAccount } from 'src/queries/account/account';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { sendSwitchAccountEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getStorage, setStorage } from 'src/utilities/storage';

import { getCompanyNameOrEmail } from './utils';

import type { GlobalGrantTypes } from '@linode/api-v4/lib/account';
import type { Theme } from '@mui/material';

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
  const { data: grants } = useGrants();
  const { enqueueSnackbar } = useSnackbar();
  const sessionContext = React.useContext(switchAccountSessionContext);

  const hasGrant = (grant: GlobalGrantTypes) =>
    grants?.global?.[grant] ?? false;
  const isRestrictedUser = profile?.restricted ?? false;
  const hasAccountAccess = !isRestrictedUser || hasGrant('account_access');
  const hasReadWriteAccountAccess = hasGrant('account_access') === 'read_write';
  const isParentUser = profile?.user_type === 'parent';
  const isProxyUser = profile?.user_type === 'proxy';
  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });
  const canSwitchBetweenParentOrProxyAccount =
    (!isChildAccountAccessRestricted && isParentUser) || isProxyUser;
  const open = Boolean(anchorEl);
  const id = open ? 'user-menu-popover' : undefined;

  const companyNameOrEmail = getCompanyNameOrEmail({
    company: account?.company,
    profile,
  });

  const { isParentTokenExpired } = useIsParentTokenExpired({ isProxyUser });

  // Used for fetching parent profile and account data by making a request with the parent's token.
  const proxyHeaders = isProxyUser
    ? {
        Authorization: getStorage(`authentication/parent_token/token`),
      }
    : undefined;

  const { data: parentProfile } = useProfile({ headers: proxyHeaders });

  const userName = (isProxyUser ? parentProfile : profile)?.username ?? '';

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
    if (isProxyUser && !getStorage('is_proxy_user')) {
      // Flag for proxy user to display success toast once.
      setStorage('is_proxy_user', 'true');

      enqueueSnackbar(`Account switched to ${companyNameOrEmail}.`, {
        variant: 'success',
      });
    }
  }, [isProxyUser, companyNameOrEmail, enqueueSnackbar]);

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

  const handleAccountSwitch = () => {
    if (isParentTokenExpired) {
      return sessionContext.updateState({
        isOpen: true,
      });
    }

    setIsDrawerOpen(true);
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
          startIcon={isProxyUser ? <AvatarForProxy /> : <Avatar />}
        >
          <Hidden mdDown>
            <Stack alignItems={'flex-start'}>
              <Typography
                sx={{
                  fontSize: companyNameOrEmail ? '0.775rem' : '0.875rem',
                }}
              >
                {userName}
              </Typography>
              {companyNameOrEmail && (
                <Typography
                  sx={(theme) => ({
                    fontFamily: theme.font.bold,
                    fontSize: '0.875rem',
                  })}
                >
                  {companyNameOrEmail}
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
          {canSwitchBetweenParentOrProxyAccount && (
            <Typography>Current account:</Typography>
          )}
          <Typography
            color={(theme) => theme.textColors.headlineStatic}
            fontSize="1.1rem"
          >
            <strong>
              {canSwitchBetweenParentOrProxyAccount && companyNameOrEmail
                ? companyNameOrEmail
                : userName}
            </strong>
          </Typography>
          {canSwitchBetweenParentOrProxyAccount && (
            <SwitchAccountButton
              onClick={() => {
                sendSwitchAccountEvent('User Menu');
                handleAccountSwitch();
              }}
              buttonType="outlined"
              data-testid="switch-account-button"
            />
          )}
          <Box>
            <Heading>My Profile</Heading>
            <Divider color="#9ea4ae" />
            <Grid columnSpacing={2} container rowSpacing={1}>
              <Grid container direction="column" wrap="nowrap" xs={6}>
                {profileLinks.slice(0, 4).map(renderLink)}
              </Grid>
              <Grid container direction="column" wrap="nowrap" xs={6}>
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
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        userType={profile?.user_type}
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
