import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import {
  Menu as ReachMenu,
  MenuButton,
  MenuItems,
  MenuLink,
  MenuPopover
} from '@reach/menu-button';
import { positionRight } from '@reach/popover';
import * as React from 'react';
import { Link } from 'react-router-dom';
import UserIcon from 'src/assets/icons/user.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Grid from 'src/components/core/Grid';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { getGravatarUrl } from 'src/utilities/gravatar';

interface MenuLink {
  display: string;
  href: string;
  hide?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  menu: {
    transform: `translateY(${theme.spacing(1)}px)`
  },
  button: {
    borderRadius: 30,
    order: 4,
    padding: theme.spacing(1),
    '&:hover, &.active': {
      '& $username': {
        color: theme.palette.primary.main
      },
      '& $userWrapper': {
        boxShadow: '0 0 10px #bbb'
      }
    },
    '&:focus': {
      '& $username': {
        color: theme.palette.primary.main
      }
    }
  },
  userWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: theme.transitions.create(['box-shadow']),
    height: 28,
    width: 28,
    [theme.breakpoints.down('md')]: {
      width: '28px',
      height: '28px'
    }
  },
  leftIcon: {
    borderRadius: '50%',
    height: 30,
    width: 30
  },
  username: {
    maxWidth: '135px',
    overflow: 'hidden',
    paddingRight: 15,
    textOverflow: 'ellipsis',
    transition: theme.transitions.create(['color']),
    whiteSpace: 'nowrap',
    // Hides username as soon as things start to scroll
    [theme.breakpoints.down(1345)]: {
      ...theme.visually.hidden
    }
  },
  menuItem: {
    fontFamily: 'LatoWeb',
    fontSize: '.9rem',
    '&:hover, &:focus': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive,
      color: 'white'
    }
  },
  hidden: {
    ...theme.visually.hidden
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(),
    '&[data-reach-menu-button]': {
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: 0,
      color: '#c9c7c7',
      cursor: 'pointer',
      fontSize: '1rem',
      height: 50,
      textTransform: 'inherit',
      '&[aria-expanded="true"]': {
        '& $caret': {
          transform: 'rotate(180deg)'
        }
      }
    },
    '&:hover, &:focus': {
      backgroundColor: theme.cmrBGColors.bgStatusChip
    }
  },
  gravatar: {
    height: 30,
    width: 30,
    borderRadius: '50%'
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      position: 'absolute',
      top: 50,
      zIndex: 3000,
      [theme.breakpoints.down('md')]: {
        left: 0
      }
    }
  },
  caret: {
    color: '#9ea4ae',
    fontSize: 26,
    marginTop: 4,
    marginLeft: 2,
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  menuItemList: {
    boxShadow: '0 6px 7px 0 rgba(0, 0, 0, 0.2)',
    '&[data-reach-menu-items]': {
      backgroundColor: theme.bg.pureWhite,
      border: 'none',
      padding: 0,
      paddingBottom: theme.spacing(1.5),
      width: 300
    }
  },
  menuHeader: {
    borderBottom: '1px solid #9ea4ae',
    color: theme.cmrTextColors.headlineStatic,
    fontSize: '.875rem',
    letterSpacing: 1.875,
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    padding: '16px 0',
    textTransform: 'uppercase'
  },
  profileWrapper: {
    maxHeight: 200,
    width: '100%'
  },
  accountColumn: {
    whiteSpace: 'normal',
    width: '100%'
  },
  menuItemLink: {
    lineHeight: 1,
    '&[data-reach-menu-item]': {
      display: 'flex',
      alignItems: 'center',
      color: theme.cmrTextColors.linkActiveMedium,
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '8px 24px',
      '&:focus, &:hover': {
        backgroundColor: theme.cmrBGColors.bgApp,
        color: theme.cmrTextColors.linkActiveMedium
      }
    },
    '&[data-reach-menu-item][data-selected]': {
      backgroundColor: theme.cmrBGColors.bgApp,
      color: theme.cmrTextColors.linkActiveMedium
    }
  },
  userName: {
    color: theme.cmrTextColors.headlineStatic,
    fontSize: '1.1rem',
    marginTop: -1,
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    paddingTop: theme.spacing(2)
  }
}));

const profileLinks: MenuLink[] = [
  {
    display: 'Display',
    href: '/profile/display'
  },
  { display: 'Authentication', href: '/profile/auth' },
  { display: 'SSH Keys', href: '/profile/keys' },
  { display: 'LISH Settings', href: '/profile/lish' },
  {
    display: 'API Tokens',
    href: '/profile/tokens'
  },
  { display: 'OAuth Apps', href: '/profile/clients' },
  { display: 'Referrals', href: '/profile/referrals' },
  { display: 'Settings', href: '/profile/settings' },
  { display: 'Log Out', href: '/logout' }
];

export const UserMenu: React.FC<{}> = () => {
  const classes = useStyles();

  const [gravatarURL, setGravatarURL] = React.useState<string | undefined>();
  const [gravatarLoading, setGravatarLoading] = React.useState<boolean>(false);

  const {
    profile,
    _hasAccountAccess,
    _isRestrictedUser
  } = useAccountManagement();

  const hasFullAccountAccess =
    profile.data?.grants?.global?.account_access === 'read_write' ||
    !_isRestrictedUser;

  const accountLinks: MenuLink[] = React.useMemo(
    () => [
      {
        display: 'Billing and Contact Information',
        href: '/account/billing'
      },
      // Restricted users can't view the Users tab regardless of their grants
      {
        display: 'Users and Grants',
        href: '/account/users',
        hide: _isRestrictedUser
      },
      // Restricted users with read_write account access can view Settings.
      {
        display: 'Account Settings',
        href: '/account/settings',
        hide: !hasFullAccountAccess
      }
    ],
    [hasFullAccountAccess, _isRestrictedUser]
  );

  const userEmail = profile.data?.email;
  const userName = profile.data?.username ?? '';

  React.useEffect(() => {
    if (userEmail) {
      setGravatarLoading(true);
      getGravatarUrl(userEmail).then(url => {
        setGravatarLoading(false);
        setGravatarURL(url);
      });
    }
  }, [userEmail]);

  const renderLink = (menuLink: MenuLink) =>
    menuLink.hide ? null : (
      <Grid item xs={6}>
        <MenuLink
          key={menuLink.display}
          as={Link}
          to={menuLink.href}
          className={classes.menuItemLink}
          data-testid={`menu-item-${menuLink.display}`}
        >
          {menuLink.display}
        </MenuLink>
      </Grid>
    );

  return (
    <div>
      <ReachMenu>
        <Tooltip
          enterDelay={1000}
          enterTouchDelay={2000}
          leaveTouchDelay={3000}
          placement={'top'}
          title={userName}
        >
          <MenuButton
            className={classes.menuButton}
            data-testid="nav-group-profile"
          >
            {gravatarLoading || gravatarURL === 'not found' ? (
              <div className={classes.userWrapper}>
                <UserIcon />
              </div>
            ) : (
              <div className={classes.userWrapper}>
                <img
                  className={classes.gravatar}
                  src={gravatarURL}
                  alt="Gravatar"
                />
              </div>
            )}
            <KeyboardArrowDown className={classes.caret} />
          </MenuButton>
        </Tooltip>
        <MenuPopover className={classes.menuPopover} position={positionRight}>
          <MenuItems className={classes.menuItemList}>
            <div className={classes.userName}>
              <strong>{userName}</strong>
            </div>
            <div className={classes.menuHeader}>My Profile</div>
            <Grid
              container
              wrap="wrap"
              direction="column"
              className={classes.profileWrapper}
            >
              {profileLinks.map(renderLink)}
            </Grid>
            {_hasAccountAccess ? (
              <>
                <div className={classes.menuHeader}>Account</div>
                <Grid container>
                  <Grid item className={classes.accountColumn}>
                    {accountLinks.map(menuLink =>
                      menuLink.hide ? null : (
                        <MenuLink
                          key={menuLink.display}
                          as={Link}
                          to={menuLink.href}
                          className={classes.menuItemLink}
                          data-testid={`menu-item-${menuLink.display}`}
                        >
                          {menuLink.display}
                        </MenuLink>
                      )
                    )}
                  </Grid>
                </Grid>
              </>
            ) : null}
          </MenuItems>
        </MenuPopover>
      </ReachMenu>
    </div>
  );
};

export default React.memo(UserMenu);
