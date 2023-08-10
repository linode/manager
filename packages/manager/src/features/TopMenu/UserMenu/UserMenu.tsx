import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
// import {
//   MenuButton,
//   MenuItems,
//   MenuLink,
//   MenuPopover,
//   Menu as ReachMenu,
// } from '@reach/menu-button';
// import { positionRight } from '@reach/popover';
import * as React from 'react';
import { Button } from 'src/components/Button/Button';

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

const useStyles = makeStyles((theme: Theme) => ({
  accountColumn: {
    whiteSpace: 'normal',
    width: '100%',
  },
  button: {
    '&:focus': {
      '& $username': {
        color: theme.palette.primary.main,
      },
    },
    '&:hover, &.active': {
      '& $userWrapper': {
        boxShadow: '0 0 10px #bbb',
      },
      '& $username': {
        color: theme.palette.primary.main,
      },
    },
    borderRadius: 30,
    order: 4,
    padding: theme.spacing(1),
  },
  caret: {
    color: '#9ea4ae',
    fontSize: 26,
    marginLeft: 2,
    marginTop: 2,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  gravatar: {
    borderRadius: '50%',
    height: 30,
    width: 30,
  },
  hidden: {
    ...theme.visually.hidden,
  },
  inlineUserName: {
    fontSize: '0.875rem',
    paddingLeft: theme.spacing(),
  },
  leftIcon: {
    borderRadius: '50%',
    height: 30,
    width: 30,
  },
  menu: {
    transform: `translateY(${theme.spacing(1)})`,
  },
  menuButton: {
    '&[data-reach-menu-button]': {
      '&[aria-expanded="true"]': {
        '& $caret': {
          color: '#0683E3',
          marginTop: 4,
          transform: 'rotate(180deg)',
        },
        background: theme.bg.app,
      },
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: 0,
      color: '#c9c7c7',
      cursor: 'pointer',
      fontSize: '1rem',
      height: 50,
      textTransform: 'inherit',
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
    lineHeight: 1,
    paddingRight: 10,
    [theme.breakpoints.down(360)]: {
      paddingLeft: 3,
    },
    [theme.breakpoints.up('sm')]: {
      paddingLeft: 12,
    },
  },
  menuHeader: {
    borderBottom: '1px solid #9ea4ae',
    color: theme.textColors.headlineStatic,
    fontSize: '.75rem',
    letterSpacing: 1.875,
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    padding: '16px 0 8px',
    textTransform: 'uppercase',
  },
  menuItem: {
    '&:hover, &:focus': {
      backgroundColor: theme.name === 'light' ? '#3a3f46' : '#23262a',
      color: 'white',
    },
    fontFamily: 'LatoWeb',
    fontSize: '.9rem',
  },
  menuItemLink: menuLinkStyle(theme.textColors.linkActiveLight),
  menuItemList: {
    '&[data-reach-menu-items]': {
      backgroundColor: theme.bg.bgPaper,
      border: 'none',
      padding: 0,
      paddingBottom: theme.spacing(1.5),
      width: 300,
    },
    boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)',
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      position: 'absolute',
      [theme.breakpoints.down('lg')]: {
        left: 0,
      },
      top: 50,
      zIndex: 3000,
    },
  },
  profileWrapper: {
    '& > div': {
      whiteSpace: 'normal',
    },
    marginBottom: theme.spacing(2),
  },
  userName: {
    color: theme.textColors.headlineStatic,
    fontSize: '1.1rem',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: -1,
    paddingTop: theme.spacing(2),
  },
  userWrapper: {
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
  },
  username: {
    maxWidth: '135px',
    overflow: 'hidden',
    paddingRight: 15,
    textOverflow: 'ellipsis',
    // Hides username as soon as things start to scroll
    [theme.breakpoints.down(1345)]: {
      ...theme.visually.hidden,
    },
    transition: theme.transitions.create(['color']),
    whiteSpace: 'nowrap',
  },
}));

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

export const UserMenu = () => {
  const classes = useStyles();

  const {
    _hasAccountAccess,
    _isRestrictedUser,
    profile,
  } = useAccountManagement();

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
  const id = open ? 'simple-popover' : undefined;

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

  const renderLink = (menuLink: MenuLink) =>
    menuLink.hide ? null : (
      <Grid key={menuLink.display} xs={12}>
        <Link
          className={classes.menuItemLink}
          data-testid={`menu-item-${menuLink.display}`}
          style={{ fontSize: '0.875rem' }}
          to={menuLink.href}
        >
          {menuLink.display}
        </Link>
      </Grid>
    );

  return (
    <>
      <Button aria-describedby={id} onClick={handleClick}>
        <GravatarByEmail
          className={classes.userWrapper}
          email={profile?.email ?? ''}
        />
        <Hidden mdDown>
          <Typography className={classes.inlineUserName}>{userName}</Typography>
        </Hidden>
        <KeyboardArrowDown className={classes.caret} />
      </Button>
      <Popover
        PaperProps={{
          sx: {
            minWidth: 300,
          },
        }}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        anchorEl={anchorEl}
        id={id}
        onClose={handleClose}
        open={open}
      >
        <div className={classes.menuItemList}>
          <div className={classes.userName}>
            <strong>{userName}</strong>
          </div>
          <div className={classes.menuHeader}>My Profile</div>
          <Grid container marginX={3} rowSpacing={1}>
            <Grid
              className={classes.profileWrapper}
              direction="column"
              wrap="nowrap"
              xs={6}
            >
              {profileLinks.slice(0, 4).map(renderLink)}
            </Grid>
            <Grid
              className={classes.profileWrapper}
              direction="column"
              wrap="nowrap"
              xs={6}
            >
              {profileLinks.slice(4).map(renderLink)}
            </Grid>
          </Grid>
          {_hasAccountAccess ? (
            <>
              <div className={classes.menuHeader}>Account</div>
              <Stack marginX={3} spacing={2}>
                {accountLinks.map((menuLink) =>
                  menuLink.hide ? null : (
                    <Link
                      data-testid={`menu-item-${menuLink.display}`}
                      key={menuLink.display}
                      style={{ fontSize: '0.875rem' }}
                      to={menuLink.href}
                    >
                      {menuLink.display}
                    </Link>
                  )
                )}
              </Stack>
            </>
          ) : null}
        </div>
      </Popover>
    </>
  );
};

export default React.memo(UserMenu);
