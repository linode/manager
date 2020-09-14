import Backdrop from '@material-ui/core/Backdrop';
import IconButton from '@material-ui/core/IconButton';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
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
import RootRef from '../core/RootRef';

interface Props {
  groups: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.125rem',
    height: 50,
    lineHeight: '20px',
    '& svg': {
      marginTop: -2,
      marginRight: 10
    },
    [theme.breakpoints.up(750)]: {
      display: 'none'
    }
  },
  navDropdown: {
    backgroundColor: '#434951',
    left: '0 !important',
    width: '100%',
    zIndex: 3000
  },
  menuWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > *': {
      borderBottom: '1px solid #59626d !important'
    }
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: 1,
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
      },
      '&:hover': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG
      }
    }
  },
  caret: {
    color: '#9ea4ae',
    marginTop: 2
  },
  linkItem: {
    fontFamily: theme.font.normal,
    opacity: 1,
    transition: theme.transitions.create(['color']),
    whiteSpace: 'nowrap'
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      display: 'flex',
      position: 'relative',
      width: '100%'
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
      width: '100%'
    },
    '&[data-reach-menu-items][data-selected]': {
      backgroundColor: theme.bg.primaryNavActiveBG
    }
  },
  menuItemLink: {
    '&[data-reach-menu-item]': {
      display: 'flex',
      color: theme.color.primaryNavText,
      fontSize: '1rem',
      paddingTop: 15,
      paddingBottom: 15,
      paddingLeft: 40,
      paddingRight: 40,
      '&:hover': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG
      }
    },
    '&[data-reach-menu-item][data-selected]': {
      backgroundColor: theme.bg.primaryNavActiveBG
    }
  },
  menuItemLinkNoGroup: {
    '&[data-reach-menu-item]': {
      paddingLeft: 20,
      paddingRight: 14,
      '&:hover': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG
      }
    }
  },
  settingsBackdrop: {
    backgroundColor: 'rgba(50, 54, 60, 0.5)',
    top: 50,
    left: 0,
    zIndex: 1
  },
  menuIcon: {
    color: 'white'
  },
  menu: {
    display: 'none'
  }
}));

export const MobileNav: React.FC<Props> = props => {
  const classes = useStyles();

  const { groups } = props;

  const ref = React.useRef<HTMLButtonElement>(null);

  const [open, setOpen] = React.useState(false);

  const toggleMenu = () => {
    if (open) {
      hideMenu();
      setOpen(false);
    } else {
      showMenu();
      setOpen(true);
    }
    // console.log(
    //   document.getElementById('mobile-menu')?.getAttribute('display')
    // );
    // if (document.getElementById('mobile-menu').style.display === 'block') {
    //   hideMenu();
    //   console.log('hide');
    // } else {
    //   showMenu();
    //   console.log('show');
    // }
  };

  const showMenu = () => {
    document.getElementById('mobile-menu')?.style.display = 'block';
  };

  const hideMenu = () => {
    document.getElementById('mobile-menu')?.style.display = 'none';
  };

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    // <ReachMenu key={window.location.pathname}>
    //   {({ isExpanded }) => {
    //     return (
    //       <>
    //         <MenuButton
    //           id="mobile-menu-initiator"
    //           aria-label={isExpanded ? 'Close menu' : 'Open menu'}
    //           className={classes.navIcon}
    //         >
    //           {isExpanded ? <CloseIcon /> : <MenuIcon />}
    //           Menu
    //         </MenuButton>
    //         <MenuPopover className={classes.navDropdown} portal={false}>
    //           <div className={classes.menuWrapper}>
    //             {groups.map((thisGroup: any) => {
    //               // For each group, filter out hidden links.
    //               const filteredLinks = thisGroup.links.filter(
    //                 (thisLink: any) => !thisLink.hide
    //               );
    //               if (filteredLinks.length === 0) {
    //                 return null;
    //               }

    //               // Render a singular PrimaryNavLink for links without a group.
    //               if (
    //                 thisGroup.group === 'None' &&
    //                 filteredLinks.length === 1
    //               ) {
    //                 const link = filteredLinks[0];

    //                 return (
    //                   <MenuItems
    //                     className={classes.menuItemList}
    //                     key={link.display}
    //                   >
    //                     <MenuLink
    //                       key={link.display}
    //                       as={Link}
    //                       to={link.href}
    //                       className={`${classes.menuItemLink} ${classes.menuItemLinkNoGroup}`}
    //                     >
    //                       {link.display}
    //                     </MenuLink>
    //                   </MenuItems>
    //                 );
    //               }

    //               return (
    //                 <ReachMenu key={thisGroup.group}>
    //                   <MenuButton
    //                     className={`${classes.menuButton} ${classes.linkItem}`}
    //                   >
    //                     {thisGroup.group}
    //                     <KeyboardArrowDown className={classes.caret} />
    //                   </MenuButton>
    //                   <MenuPopover
    //                     className={classes.menuPopover}
    //                     portal={false}
    //                   >
    //                     <MenuItems
    //                       className={classes.menuItemList}
    //                       key={thisGroup}
    //                     >
    //                       {filteredLinks.map((thisLink: any) => (
    //                         <MenuLink
    //                           data-testid={`menu-item-${thisLink.display}`}
    //                           key={thisLink.display}
    //                           as={Link}
    //                           to={thisLink.href}
    //                           className={classes.menuItemLink}
    //                           disabled={
    //                             window.location.pathname === thisLink.href
    //                           }
    //                         >
    //                           {thisLink.display}
    //                         </MenuLink>
    //                       ))}
    //                     </MenuItems>
    //                   </MenuPopover>
    //                 </ReachMenu>
    //               );
    //             })}
    //           </div>
    //         </MenuPopover>
    //         <Backdrop className={classes.settingsBackdrop} open={isExpanded} />
    //       </>
    //     );
    //   }}
    // </ReachMenu>
    <>
      <IconButton edge="start" onClick={toggleMenu} aria-label="menu">
        <MenuIcon className={classes.menuIcon} />
      </IconButton>
      <List id="mobile-menu" className={classes.menu}>
        <ListItem button onClick={handleClick}>
          <ListItemText primary="A" />
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button>
              <ListItemText primary="Starred" />
            </ListItem>
          </List>
        </Collapse>
        <ListItem button onClick={handleClick}>
          <ListItemText primary="B" />
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button>
              <ListItemText primary="Starred" />
            </ListItem>
          </List>
        </Collapse>
      </List>
    </>
  );
};

export default MobileNav;
