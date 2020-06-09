import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import {
  Menu as ReachMenu,
  MenuButton,
  MenuItems,
  MenuLink,
  MenuPopover
} from '@reach/menu-button';
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
    padding: theme.spacing(1),
    borderRadius: 30,
    order: 4,
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
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: theme.transitions.create(['box-shadow']),
    [theme.breakpoints.down('md')]: {
      margin: 0,
      width: '28px',
      height: '28px'
    }
  },
  leftIcon: {
    width: 30,
    height: 30,
    borderRadius: '50%'
  },
  username: {
    transition: theme.transitions.create(['color']),
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  menuItem: {
    fontSize: '.9rem',
    fontFamily: 'LatoWeb',
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
    '&[data-reach-menu-button]': {
      textTransform: 'inherit',
      borderRadius: 0,
      fontSize: '1rem',
      backgroundColor: theme.bg.primaryNavPaper,
      color: theme.color.primaryNavText,
      cursor: 'pointer',
      border: 'none',
      '&[aria-expanded="true"]': {
        backgroundColor: theme.bg.primaryNavActiveBG,
        '& $caret': {
          transform: 'rotate(180deg)'
        }
      },
      height: 50,
      padding: `0px 3px 0px 3px`
    },
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '&:focus': {
      backgroundColor: theme.bg.primaryNavActiveBG
    }
  },
  menuItemLink: {
    '&[data-reach-menu-item]': {
      cursor: 'pointer',
      fontSize: '1rem',
      paddingTop: 12,
      paddingRight: 40,
      paddingBottom: 12,
      '&:hover': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      display: 'flex',
      alignItems: 'center',
      color: theme.color.primaryNavText
    },
    '&[data-reach-menu-item][data-selected]': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    lineHeight: 1
  },
  menuItemList: {
    '&[data-reach-menu-items]': {
      padding: 0,
      border: 'none',
      whiteSpace: 'normal',
      backgroundColor: theme.bg.primaryNavPaper
    }
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      zIndex: 3000,
      position: 'absolute',
      top: 50,
      // Hack solution to have something semi-working on mobile.
      [theme.breakpoints.down('md')]: {
        left: 0
      }
    }
  },
  caret: {
    fontSize: 26,
    marginTop: 4,
    color: '#9ea4ae',
    marginLeft: 2
  }
}));

export const UserMenu: React.FC<{}> = () => {
  const classes = useStyles();

  const [gravatarURL, setGravatarURL] = React.useState<string | undefined>();
  const [gravatarLoading, setGravatarLoading] = React.useState<boolean>(false);

  const { _hasAccountAccess, profile, account } = useAccountManagement();

  const userEmail = profile.data?.email;

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
            <div className={classes.userWrapper} />
          ) : gravatarURL === 'not found' ? (
            <div className={classes.userWrapper}>
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
        <MenuPopover className={classes.menuPopover} portal={false}>
          <MenuItems className={classes.menuItemList}>
            {menuLinks.map(menuLink => (
              <MenuLink
                key={menuLink.display}
                as={Link}
                to={menuLink.href}
                className={classes.menuItemLink}
                data-testid={`menu-item-${menuLink.display}`}
              >
                {menuLink.display}
              </MenuLink>
            ))}
          </MenuItems>
        </MenuPopover>
      </ReachMenu>
    </div>
  );
};

export default React.memo(UserMenu);
