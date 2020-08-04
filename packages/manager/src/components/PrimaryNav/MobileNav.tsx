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
import { makeStyles, Theme } from 'src/components/core/styles';
import { PrimaryLink } from './NavItem';
import { NavGroup } from './PrimaryNav_CMR';

interface Props {
  groups: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  menuWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: 1,
    padding: 0,
    '&[data-reach-menu-button]': {
      backgroundColor: '#434951',
      border: 'none',
      borderRadius: 0,
      color: theme.color.primaryNavText,
      cursor: 'pointer',
      fontSize: '1rem',
      height: 50,
      paddingTop: 15,
      paddingBottom: 15,
      paddingLeft: 20,
      paddingRight: 14,
      textTransform: 'inherit',
      width: '100%',
      '&[aria-expanded="true"]': {
        '& $caret': {
          transform: 'rotate(180deg)'
        }
      }
    },
    '&[data-reach-menu-button]:not(:first-of-type)': {
      borderTop: '1px solid rgba(50, 54, 60, 0.5)'
    }
  },
  caret: {
    color: '#9ea4ae',
    fontSize: 26,
    marginTop: 2
  },
  linkItem: {
    color: theme.color.primaryNavText,
    fontFamily: theme.font.normal,
    opacity: 1,
    transition: theme.transitions.create(['color']),
    whiteSpace: 'nowrap'
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      display: 'flex',
      position: 'relative',
      width: '100%',
      zIndex: 3000
    }
  },
  menuItemList: {
    '&[data-reach-menu-items]': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: '#434951',
      border: 'none',
      padding: 0,
      whiteSpace: 'normal',
      width: '100%',
      '& > div': {
        width: '100%'
      }
    }
  },
  menuItemLink: {
    lineHeight: 1,
    '&[data-reach-menu-item]': {
      display: 'flex',
      color: theme.color.primaryNavText,
      cursor: 'pointer',
      fontSize: '1rem',
      paddingTop: 15,
      paddingBottom: 15,
      paddingLeft: 40,
      paddingRight: 40,
      '&:hover': {
        backgroundColor: '#434951'
      },
      '&:focus': {
        backgroundColor: '#434951'
      }
    },
    '&[data-reach-menu-item][data-selected]': {
      backgroundColor: '#434951'
    }
  }
}));

export const MobileNav: React.FC<Props> = props => {
  const classes = useStyles();
  const { groups } = props;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {groups.map(thisGroup => (
        // eslint-disable-next-line react/jsx-key
        <div className={classes.menuWrapper}>
          <ReachMenu>
            <MenuButton className={`${classes.menuButton} ${classes.linkItem}`}>
              {thisGroup.group}
              <KeyboardArrowDown className={classes.caret} />
            </MenuButton>
            <MenuPopover className={classes.menuPopover} portal={false}>
              <MenuItems className={classes.menuItemList}>
                {thisGroup.links.map(thisLink => (
                  // eslint-disable-next-line react/jsx-key
                  <MenuLink as={Link} className={classes.menuItemLink}>
                    test
                  </MenuLink>
                ))}
              </MenuItems>
            </MenuPopover>
          </ReachMenu>
        </div>
      ))}
    </>
  );
};

export default MobileNav;
