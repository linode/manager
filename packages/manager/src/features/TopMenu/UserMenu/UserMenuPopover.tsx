import { useProfile } from '@linode/queries';
import { Box, Divider, Stack, Typography } from '@linode/ui';
import { styled } from '@mui/material';
import Grid from '@mui/material/Grid';
import Popover from '@mui/material/Popover';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { Link } from 'src/components/Link';
import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { SwitchAccountButton } from 'src/features/Account/SwitchAccountButton';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { sendSwitchAccountEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getStorage } from 'src/utilities/storage';

import { getCompanyNameOrEmail } from './utils';

interface UserMenuPopoverProps {
  anchorEl: HTMLElement | null;
  isDrawerOpen: boolean;
  onClose: () => void;
  onDrawerOpen: (open: boolean) => void;
}

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

export const UserMenuPopover = (props: UserMenuPopoverProps) => {
  const { anchorEl, isDrawerOpen, onClose, onDrawerOpen } = props;
  const sessionContext = React.useContext(switchAccountSessionContext);
  const flags = useFlags();
  const theme = useTheme();

  const {
    _hasAccountAccess,
    _isRestrictedUser,
    account,
    canSwitchBetweenParentOrProxyAccount,
    hasReadWriteAccess,
    profile,
  } = useAccountManagement();

  const open = Boolean(anchorEl);
  const id = open ? 'user-menu-popover' : undefined;
  const isProxyUser = profile?.user_type === 'proxy';

  // Used for fetching parent profile and account data by making a request with the parent's token.
  const proxyHeaders = isProxyUser
    ? {
        Authorization: getStorage(`authentication/parent_token/token`),
      }
    : undefined;

  const companyNameOrEmail = getCompanyNameOrEmail({
    company: account?.company,
    profile,
  });
  const { data: parentProfile } = useProfile({ headers: proxyHeaders });
  const userName = (isProxyUser ? parentProfile : profile)?.username ?? '';

  const { isParentTokenExpired } = useIsParentTokenExpired({ isProxyUser });

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
      {
        display: 'Quotas',
        hide: !flags.limitsEvolution?.enabled,
        href: '/account/quotas',
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
        hide: !hasReadWriteAccess,
        href: '/account/settings',
      },
    ],
    [hasReadWriteAccess, _isRestrictedUser]
  );

  const renderLink = (link: MenuLink) => {
    if (link.hide) {
      return null;
    }

    return (
      <Grid key={link.display} size={12}>
        <Link
          data-testid={`menu-item-${link.display}`}
          onClick={onClose}
          style={{
            color: theme.tokens.alias.Content.Text.Link.Default,
            font: theme.tokens.alias.Typography.Body.Semibold,
          }}
          to={link.href}
        >
          {link.display}
        </Link>
      </Grid>
    );
  };

  const handleAccountSwitch = () => {
    if (isParentTokenExpired) {
      return sessionContext.updateState({
        isOpen: true,
      });
    }

    onDrawerOpen(true);
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'bottom',
      }}
      data-testid={id}
      id={id}
      marginThreshold={0}
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: (theme) => ({
            backgroundColor: theme.tokens.alias.Background.Normal,
            paddingX: theme.tokens.spacing.S24,
            paddingY: theme.tokens.spacing.S16,
          }),
        },
      }}
      // When the Switch Account drawer is open, hide the user menu popover so it's not covering the drawer.
      sx={{ zIndex: isDrawerOpen ? 0 : 1 }}
    >
      <Stack
        data-qa-user-menu
        gap={(theme) => theme.tokens.spacing.S16}
        minWidth={250}
      >
        <Stack display="flex" gap={(theme) => theme.tokens.spacing.S8}>
          {canSwitchBetweenParentOrProxyAccount && (
            <Typography
              sx={(theme) => ({
                color: theme.tokens.alias.Content.Text.Primary.Default,
                font: theme.tokens.alias.Typography.Label.Semibold.S,
              })}
            >
              Current account:
            </Typography>
          )}
          <Typography
            sx={(theme) => ({
              color: theme.tokens.alias.Content.Text.Primary.Default,
              font: theme.tokens.alias.Typography.Label.Bold.L,
            })}
          >
            {canSwitchBetweenParentOrProxyAccount && companyNameOrEmail
              ? companyNameOrEmail
              : userName}
          </Typography>
          {canSwitchBetweenParentOrProxyAccount && (
            <SwitchAccountButton
              buttonType="outlined"
              data-testid="switch-account-button"
              onClick={() => {
                sendSwitchAccountEvent('User Menu');
                handleAccountSwitch();
              }}
            />
          )}
        </Stack>
        <Box>
          <Heading>My Profile</Heading>
          <Divider />
          <Grid columnSpacing={2} container rowSpacing={1}>
            <Grid container direction="column" size={6} wrap="nowrap">
              {profileLinks.slice(0, 4).map(renderLink)}
            </Grid>
            <Grid container direction="column" size={6} wrap="nowrap">
              {profileLinks.slice(4).map(renderLink)}
            </Grid>
          </Grid>
        </Box>
        {_hasAccountAccess && (
          <Box>
            <Heading>Account</Heading>
            <Divider />
            <Stack
              gap={(theme) => theme.tokens.spacing.S8}
              mt={(theme) => theme.tokens.spacing.S8}
            >
              {accountLinks.map((menuLink) =>
                menuLink.hide ? null : (
                  <Link
                    data-testid={`menu-item-${menuLink.display}`}
                    key={menuLink.display}
                    onClick={onClose}
                    style={{
                      color: theme.tokens.alias.Content.Text.Link.Default,
                      font: theme.tokens.alias.Typography.Body.Semibold,
                    }}
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
  );
};

const Heading = styled(Typography)(({ theme }) => ({
  color: theme.tokens.alias.Content.Text.Primary.Default,
  font: theme.tokens.alias.Typography.Heading.Overline,
  letterSpacing: theme.tokens.alias.Typography.Heading.OverlineLetterSpacing,
  textTransform: theme.tokens.alias.Typography.Heading.OverlineTextCase,
}));
