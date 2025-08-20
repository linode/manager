import { useAccount, useProfile } from '@linode/queries';
import { BetaChip, Box, Divider, Stack, Typography } from '@linode/ui';
import { styled } from '@mui/material';
import Grid from '@mui/material/Grid';
import Popover from '@mui/material/Popover';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { Link } from 'src/components/Link';
import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { SwitchAccountButton } from 'src/features/Account/SwitchAccountButton';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { useIsIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
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
  isBeta?: boolean;
  to: string;
}

const profileLinks: MenuLink[] = [
  {
    display: 'Display',
    to: '/profile/display',
  },
  { display: 'Login & Authentication', to: '/profile/auth' },
  { display: 'SSH Keys', to: '/profile/keys' },
  { display: 'LISH Console Settings', to: '/profile/lish' },
  {
    display: 'API Tokens',
    to: '/profile/tokens',
  },
  { display: 'OAuth Apps', to: '/profile/clients' },
  { display: 'Referrals', to: '/profile/referrals' },
  { display: 'My Settings', to: '/profile/settings' },
  { display: 'Log Out', to: '/logout' },
];

export const UserMenuPopover = (props: UserMenuPopoverProps) => {
  const { anchorEl, isDrawerOpen, onClose, onDrawerOpen } = props;
  const sessionContext = React.useContext(switchAccountSessionContext);
  const flags = useFlags();
  const theme = useTheme();

  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { isIAMEnabled } = useIsIAMEnabled();

  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const isProxyUser = profile?.user_type === 'proxy';

  const canSwitchBetweenParentOrProxyAccount =
    (profile?.user_type === 'parent' && !isChildAccountAccessRestricted) ||
    profile?.user_type === 'proxy';

  const open = Boolean(anchorEl);
  const id = open ? 'user-menu-popover' : undefined;

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
        display: 'Billing',
        to: flags?.iamRbacPrimaryNavChanges ? '/billing' : '/account/billing',
      },
      {
        display:
          flags?.iamRbacPrimaryNavChanges && isIAMEnabled
            ? 'Identity & Access'
            : 'Users & Grants',
        to:
          flags?.iamRbacPrimaryNavChanges && isIAMEnabled
            ? '/iam'
            : flags?.iamRbacPrimaryNavChanges && !isIAMEnabled
              ? '/users'
              : '/account/users',
        isBeta: flags?.iamRbacPrimaryNavChanges && isIAMEnabled,
      },
      {
        display: 'Quotas',
        hide: !flags.limitsEvolution?.enabled,
        to: flags?.iamRbacPrimaryNavChanges ? '/quotas' : '/account/quotas',
      },
      {
        display: 'Login History',
        to: flags?.iamRbacPrimaryNavChanges
          ? '/login-history'
          : '/account/login-history',
      },
      {
        display: 'Service Transfers',
        to: flags?.iamRbacPrimaryNavChanges
          ? '/service-transfers'
          : '/account/service-transfers',
      },
      {
        display: 'Maintenance',
        to: flags?.iamRbacPrimaryNavChanges
          ? '/maintenance'
          : '/account/maintenance',
      },
      {
        display: 'Settings',
        to: flags?.iamRbacPrimaryNavChanges ? '/settings' : '/account/settings',
      },
    ],
    [isIAMEnabled, flags]
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
          to={link.to}
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
        <Box>
          <Heading>
            {flags?.iamRbacPrimaryNavChanges ? 'Administration' : 'Account'}
          </Heading>
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
                  to={menuLink.to}
                >
                  {menuLink.display}
                  {menuLink?.isBeta ? <BetaChip component="span" /> : null}
                </Link>
              )
            )}
          </Stack>
        </Box>
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
