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
      backgroundColor: theme.palette.primary.main,
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
    paddingLeft: 15,
    '&[data-reach-menu-button]': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNav,
      border: 'none',
      borderRadius: 0,
      color: theme.color.primaryNavText,
      cursor: 'pointer',
      fontSize: '1rem',
      height: 50,
      textTransform: 'inherit',
      '&[aria-expanded="true"]': {
        backgroundColor: theme.bg.primaryNavActiveBG,
        '& $caret': {
          transform: 'rotate(180deg)'
        }
      }
    },
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '&:focus': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 7.5
    }
  },
  menuItemLink: {
    lineHeight: 1,
    '&[data-reach-menu-item]': {
      display: 'flex',
      alignItems: 'center',
      color: theme.color.primaryNavText,
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '12px 40px 12px 15px',
      '&:hover': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG
      }
    },
    '&[data-reach-menu-item][data-selected]': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    [theme.breakpoints.down('sm')]: {
      padding: '10px 7.5px'
    }
  },
  menuItemList: {
    '&[data-reach-menu-items]': {
      backgroundColor: theme.bg.primaryNavPaper,
      border: 'none',
      padding: 0
    }
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      marginTop: -1,
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
  }
}));

export const UserMenu: React.FC<{}> = () => {
  const classes = useStyles();

  const [gravatarURL, setGravatarURL] = React.useState<string | undefined>();
  const [gravatarLoading, setGravatarLoading] = React.useState<boolean>(false);

  const { _hasAccountAccess, profile, account } = useAccountManagement();

  const userEmail = profile.data?.email;
  const username = profile.data?.username;

  React.useEffect(() => {
    if (userEmail) {
      setGravatarLoading(true);
      getGravatarUrl(userEmail).then(url => {
        setGravatarLoading(false);
        setGravatarURL(url);
      });
    }
  }, [userEmail]);

  const menuLinks: MenuLink[] = React.useMemo(
    () => [
      {
        display: 'Account',
        href: '/account',
        hide: account.loading || !_hasAccountAccess
      },
      { display: 'My Profile', href: '/profile/display' },
      { display: 'Log Out', href: '/logout' }
    ],
    [account.loading, _hasAccountAccess]
  );

  return (
    <div>
      <ReachMenu>
        <MenuButton
          className={classes.menuButton}
          data-testid="nav-group-profile"
        >
          {gravatarLoading ? (
            <div className={classes.userWrapper}>
              <div className={classes.username}>{username}</div>
            </div>
          ) : gravatarURL === 'not found' ? (
            <div className={classes.userWrapper}>
              <div className={classes.username}>{username}</div>
              <UserIcon className={classes.leftIcon} />
            </div>
          ) : (
            <div className={classes.userWrapper}>
              <img
                src={gravatarURL}
                className={classes.leftIcon}
                alt="Gravatar"
              />
            </div>
          )}
          <KeyboardArrowDown className={classes.caret} />
        </MenuButton>
        <MenuPopover className={classes.menuPopover} position={positionRight}>
          <MenuItems className={classes.menuItemList}>
            {menuLinks.map(menuLink =>
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
          </MenuItems>
        </MenuPopover>
      </ReachMenu>
    </div>
  );
};

export default React.memo(UserMenu);
