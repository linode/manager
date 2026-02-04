import { useAccount, useProfile } from '@linode/queries';
import {
  Button,
  ChevronDownIcon,
  ChevronUpIcon,
  omittedProps,
  Stack,
  Tooltip,
  Typography,
} from '@linode/ui';
import { truncateEnd } from '@linode/utilities';
import { styled, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Avatar } from 'src/components/Avatar/Avatar';
import { AvatarForDelegateUser } from 'src/components/AvatarForDelegateUser';
import { SwitchAccountDrawer } from 'src/features/Account/SwitchAccountDrawer';
import { useDelegationRole } from 'src/features/IAM/hooks/useDelegationRole';
import { getStorage, setStorage } from 'src/utilities/storage';

import { UserMenuPopover } from './UserMenuPopover';
import { getCompanyNameOrEmail } from './utils';

import type { Theme } from '@mui/material';

export const UserMenu = React.memo(() => {
  const { isProxyOrDelegateUserType, isProxyUserType, isDelegateUserType } =
    useDelegationRole();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  const theme = useTheme();

  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { enqueueSnackbar } = useSnackbar();

  const open = Boolean(anchorEl);
  const id = open ? 'user-menu-popover' : undefined;

  const companyNameOrEmail = getCompanyNameOrEmail({
    company: account?.company,
    profile,
  });

  // Used for fetching parent profile and account data by making a request with the parent's token.
  const proxyHeaders = isProxyOrDelegateUserType
    ? {
        Authorization: getStorage(`authentication/parent_token/token`),
      }
    : undefined;

  const { data: parentProfile } = useProfile({ headers: proxyHeaders });

  const userName =
    (isProxyOrDelegateUserType ? parentProfile : profile)?.username ?? '';

  const matchesSmDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const matchesMdDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  );

  React.useEffect(() => {
    // Run after we've switched to a proxy user.
    if (
      isProxyOrDelegateUserType &&
      (!getStorage('is_proxy_user_type') ||
        !getStorage('is_delegate_user_type'))
    ) {
      // Flag for proxy user to display success toast once.
      if (isProxyUserType) {
        setStorage('is_proxy_user_type', 'true');
      }
      if (isDelegateUserType) {
        setStorage('is_delegate_user_type', 'true');
      }

      enqueueSnackbar(`Account switched to ${companyNameOrEmail}.`, {
        variant: 'success',
      });
    }
  }, [
    isProxyOrDelegateUserType,
    companyNameOrEmail,
    enqueueSnackbar,
    isProxyUserType,
    isDelegateUserType,
  ]);

  const getEndIcon = () => {
    if (matchesSmDown) {
      return undefined;
    }
    return open ? (
      <ChevronUpIcon color={theme.tokens.component.GlobalHeader.Text.Hover} />
    ) : (
      <ChevronDownIcon
        color={theme.tokens.component.GlobalHeader.Text.Default}
      />
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
        <StyledUserMenuButton
          aria-describedby={id}
          data-testid="nav-group-profile"
          disableRipple
          endIcon={!matchesMdDown && getEndIcon()}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          open={open}
          startIcon={
            isProxyOrDelegateUserType ? <AvatarForDelegateUser /> : <Avatar />
          }
        >
          <Stack
            alignItems={'flex-start'}
            sx={{ display: { md: 'flex', xs: 'none' } }}
          >
            <Typography
              sx={{
                font: theme.tokens.alias.Typography.Label.Semibold.S,
              }}
            >
              {userName}
            </Typography>
            {companyNameOrEmail && (
              <Typography
                letterSpacing={
                  theme.tokens.alias.Typography.Heading.OverlineLetterSpacing
                }
                sx={{
                  font: theme.tokens.alias.Typography.Heading.Overline,
                }}
                textTransform={
                  theme.tokens.alias.Typography.Heading.OverlineTextCase
                }
              >
                {truncateEnd(companyNameOrEmail, 24)}
              </Typography>
            )}
          </Stack>
        </StyledUserMenuButton>
      </Tooltip>
      <UserMenuPopover
        anchorEl={anchorEl}
        isDrawerOpen={isDrawerOpen}
        onClose={() => setAnchorEl(null)}
        onDrawerOpen={() => setIsDrawerOpen(true)}
      />
      <SwitchAccountDrawer
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        userType={profile?.user_type}
      />
    </>
  );
});

const StyledUserMenuButton = styled(Button, {
  label: 'StyledUserMenuButton',
  shouldForwardProp: omittedProps(['open']),
})<{ open: boolean }>(({ open, theme }) => ({
  '&:hover, &:focus, &:active': {
    '.MuiButton-icon svg, .MuiStack-root .MuiTypography-root': {
      color: theme.tokens.component.GlobalHeader.Text.Hover,
    },
  },
  '.MuiButton-endIcon svg': {
    height: '16px',
    width: '16px',
  },
  '.MuiButton-icon svg': {
    color: open
      ? theme.tokens.component.GlobalHeader.Text.Hover
      : theme.tokens.component.GlobalHeader.Text.Default,
  },
  '.MuiButton-startIcon': {
    '.MuiAvatar-root, .MuiTypography-root': {
      font: theme.tokens.alias.Typography.Label.Bold.S,
    },
    marginLeft: 0,
    marginRight: theme.tokens.spacing.S8,
  },
  '.MuiStack-root .MuiTypography-root': {
    color: open
      ? theme.tokens.component.GlobalHeader.Text.Hover
      : theme.tokens.component.GlobalHeader.Text.Default,
  },
  padding: 0,
  textTransform: 'none',
  [theme.breakpoints.down('md')]: {
    '.MuiButton-startIcon': {
      margin: 0,
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.tokens.spacing.S6} ${theme.tokens.spacing.S8}`,
  },
}));
