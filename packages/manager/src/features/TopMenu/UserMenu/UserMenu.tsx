import {
  Button,
  ChevronDownIcon,
  Stack,
  Tooltip,
  Typography,
  omittedProps,
} from '@linode/ui';
import { styled, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import ChevronUp from 'src/assets/icons/chevron-up.svg';
import { Avatar } from 'src/components/Avatar/Avatar';
import { AvatarForProxy } from 'src/components/AvatarForProxy';
import { SwitchAccountDrawer } from 'src/features/Account/SwitchAccountDrawer';
import { useAccount } from 'src/queries/account/account';
import { useProfile } from 'src/queries/profile/profile';
import { getStorage, setStorage } from 'src/utilities/storage';
import { truncateEnd } from 'src/utilities/truncate';

import { UserMenuPopover } from './UserMenuPopover';
import { getCompanyNameOrEmail } from './utils';

import type { Theme } from '@mui/material';

export const UserMenu = React.memo(() => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  const theme = useTheme();

  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { enqueueSnackbar } = useSnackbar();

  const isProxyUser = profile?.user_type === 'proxy';
  const open = Boolean(anchorEl);
  const id = open ? 'user-menu-popover' : undefined;

  const companyNameOrEmail = getCompanyNameOrEmail({
    company: account?.company,
    profile,
  });

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

  const matchesMdDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  );

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

  const getEndIcon = () => {
    if (matchesSmDown) {
      return undefined;
    }
    return open ? (
      <ChevronUp color={theme.tokens.header.Text.Hover} />
    ) : (
      <ChevronDownIcon color={theme.tokens.header.Text.Default} />
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
          startIcon={isProxyUser ? <AvatarForProxy /> : <Avatar />}
        >
          <Stack
            alignItems={'flex-start'}
            sx={{ display: { md: 'flex', xs: 'none' } }}
          >
            <Typography
              sx={{
                font: theme.tokens.typography.Label.Semibold.S,
              }}
            >
              {userName}
            </Typography>
            {companyNameOrEmail && (
              <Typography
                letterSpacing={
                  theme.tokens.typography.Heading.OverlineLetterSpacing
                }
                sx={{
                  font: theme.tokens.typography.Heading.Overline,
                }}
                textTransform={theme.tokens.typography.Heading.OverlineTextCase}
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
      color: theme.tokens.header.Text.Hover,
    },
  },
  '.MuiButton-icon svg': {
    color: open
      ? theme.tokens.header.Text.Hover
      : theme.tokens.header.Text.Default,
  },
  '.MuiButton-startIcon': {
    '.MuiAvatar-root, .MuiTypography-root': {
      font: theme.tokens.typography.Label.Bold.S,
    },
    marginLeft: 0,
    marginRight: theme.tokens.spacing[40],
  },
  '.MuiStack-root .MuiTypography-root': {
    color: open
      ? theme.tokens.header.Text.Hover
      : theme.tokens.header.Text.Default,
  },
  padding: 0,
  textTransform: 'none',
  [theme.breakpoints.down('md')]: {
    '.MuiButton-startIcon': {
      margin: 0,
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.tokens.spacing[30]} ${theme.tokens.spacing[40]}`,
  },
}));
