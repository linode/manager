import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import {
  MenuButton,
  MenuItems,
  MenuLink,
  MenuPopover,
  Menu as ReachMenu,
} from '@reach/menu-button';
import { positionRight } from '@reach/popover';
import * as React from 'react';

import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { Hidden } from 'src/components/Hidden';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useGrants } from 'src/queries/profile';

interface MenuLink {
  display: string;
  hide?: boolean;
  href: string;
}

export const menuLinkStyle = (linkColor: string) => ({
  '&[data-reach-menu-item]': {
    '&:focus, &:hover': {
      backgroundColor: 'transparent',
      color: linkColor,
    },
    '&[data-reach-menu-item][data-selected]:not(:hover)': {
      backgroundColor: 'transparent',
      color: linkColor,
      outline: 'dotted 1px #c1c1c0',
    },
    alignItems: 'center',
    color: linkColor,
    cursor: 'pointer',
    display: 'flex',
    fontSize: '0.875rem',
    padding: '8px 24px',
  },
  lineHeight: 1,
});

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

  const { data: grants } = useGrants();
  const userName = profile?.username ?? '';
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

  const renderLink = (menuLink: MenuLink) =>
    menuLink.hide ? null : (
      <Grid key={menuLink.display} xs={12}>
        <StyledMenuLink
          data-testid={`menu-item-${menuLink.display}`}
          href={menuLink.href}
        >
          {menuLink.display}
        </StyledMenuLink>
      </Grid>
    );

  return (
    <div>
      <ReachMenu>
        <Tooltip
          disableTouchListener
          enterDelay={500}
          leaveDelay={0}
          title="Profile & Account"
        >
          <StyledMenuButton data-testid="nav-group-profile">
            <StyledGravatarByEmail email={profile?.email ?? ''} />
            <Hidden mdDown>
              <Typography sx={(theme) => ({ paddingLeft: theme.spacing() })}>
                {userName}
              </Typography>
            </Hidden>
            <KeyboardArrowDown
              sx={(theme) => ({
                color: '#9ea4ae',
                fontSize: 26,
                margin: '2px 0px 0px 2px',
                [theme.breakpoints.down('md')]: { display: 'none' },
              })}
            />
          </StyledMenuButton>
        </Tooltip>
        <StyledMenuPopover data-qa-user-menu position={positionRight}>
          <StyledMenuItems>
            <StyledUserNameDiv>
              <strong>{userName}</strong>
            </StyledUserNameDiv>
            <StyledMenuHeaderDiv>My Profile</StyledMenuHeaderDiv>
            <Grid container>
              <Grid
                sx={(theme) => ({
                  '& > div': { whiteSpace: 'normal' },
                  marginBottom: theme.spacing(2),
                })}
                direction="column"
                wrap="nowrap"
                xs={6}
              >
                {profileLinks.slice(0, 4).map(renderLink)}
              </Grid>
              <Grid
                sx={(theme) => ({
                  '& > div': { whiteSpace: 'normal' },
                  marginBottom: theme.spacing(2),
                })}
                direction="column"
                wrap="nowrap"
                xs={6}
              >
                {profileLinks.slice(4).map(renderLink)}
              </Grid>
            </Grid>
            {_hasAccountAccess ? (
              <>
                <StyledMenuHeaderDiv>Account</StyledMenuHeaderDiv>
                <Grid container>
                  <Grid>
                    {accountLinks.map((menuLink) =>
                      menuLink.hide ? null : (
                        <StyledMenuLink
                          data-testid={`menu-item-${menuLink.display}`}
                          href={menuLink.href}
                          key={menuLink.display}
                        >
                          {menuLink.display}
                        </StyledMenuLink>
                      )
                    )}
                  </Grid>
                </Grid>
              </>
            ) : null}
          </StyledMenuItems>
        </StyledMenuPopover>
      </ReachMenu>
    </div>
  );
});

const StyledMenuButton = styled(MenuButton, {
  label: 'StyledMenuButton',
})(({ theme }) => ({
  '&[data-reach-menu-button]': {
    '&[aria-expanded="true"]': {
      '& > svg': {
        color: '#0683E3',
        marginTop: 4,
        transform: 'rotate(180deg)',
      },
      background: theme.bg.app,
    },
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    height: 50,
    [theme.breakpoints.down('md')]: {
      paddingLeft: 12,
      paddingRight: 12,
    },
    [theme.breakpoints.down(360)]: {
      paddingLeft: theme.spacing(),
      paddingRight: theme.spacing(),
    },
  },
  alignItems: 'center',
  display: 'flex',
  paddingRight: 10,
  [theme.breakpoints.down(360)]: {
    paddingLeft: 3,
  },
  [theme.breakpoints.up('sm')]: {
    paddingLeft: 12,
  },
}));

const StyledMenuHeaderDiv = styled('div', {
  label: 'StyledMenuHeaderDiv',
})(({ theme }) => ({
  borderBottom: '1px solid #9ea4ae',
  color: theme.textColors.headlineStatic,
  fontSize: '.75rem',
  letterSpacing: 1.875,
  margin: `${theme.spacing(0)} ${theme.spacing(3)} ${theme.spacing()}`,
  padding: '16px 0 8px',
  textTransform: 'uppercase',
}));

const StyledMenuLink = styled(MenuLink, {
  label: 'StyledMenuLink',
})(({ theme }) => ({
  '&[data-reach-menu-item]': {
    '&:focus, &:hover': {
      backgroundColor: 'transparent',
      color: theme.textColors.linkActiveLight,
    },
    '&[data-reach-menu-item][data-selected]:not(:hover)': {
      backgroundColor: 'transparent',
      color: theme.textColors.linkActiveLight,
      outline: 'dotted 1px #c1c1c0',
    },
    alignItems: 'center',
    color: theme.textColors.linkActiveLight,
    cursor: 'pointer',
    display: 'flex',
    fontSize: '0.875rem',
    lineHeight: 1,
    padding: '8px 24px',
  },
}));

const StyledMenuItems = styled(MenuItems, {
  label: 'StyledMenuItems',
})(({ theme }) => ({
  '&[data-reach-menu-items]': {
    backgroundColor: theme.bg.bgPaper,
    border: 'none',
    padding: 0,
    paddingBottom: theme.spacing(1.5),
    width: 300,
  },
  boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
}));

const StyledMenuPopover = styled(MenuPopover, {
  label: 'StyledMenuPopover',
})(({ theme }) => ({
  '&[data-reach-menu], &[data-reach-menu-popover]': {
    position: 'absolute',
    [theme.breakpoints.down('lg')]: {
      left: 0,
    },
    top: 50,
    zIndex: 3000,
  },
}));

const StyledUserNameDiv = styled('div', {
  label: 'StyledUserNameDiv',
})(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontSize: '1.1rem',
  margin: `-1px ${theme.spacing(3)} ${theme.spacing(0)}`,
  paddingTop: theme.spacing(2),
}));

const StyledGravatarByEmail = styled(GravatarByEmail, {
  label: 'StyledGravatarByEmail',
})(({ theme }) => ({
  '& svg': {
    color: '#c9c7c7',
    height: 30,
    width: 30,
  },
  alignItems: 'center',
  borderRadius: '50%',
  display: 'flex',
  height: 30,
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    height: '28px',
    width: '28px',
  },
  transition: theme.transitions.create(['box-shadow']),
  width: 30,
}));
