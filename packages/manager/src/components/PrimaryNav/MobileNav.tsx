import Backdrop from '@material-ui/core/Backdrop';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';

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
    zIndex: 6
  },
  menuIcon: {
    color: 'white',
    fontSize: '1.125rem',
    height: 50,
    lineHeight: '20px',
    '&:hover': {
      color: 'white'
    },
    '& svg': {
      marginRight: 10
    }
  },
  menu: {
    display: 'none',
    backgroundColor: '#434951',
    position: 'fixed',
    left: 0,
    width: '100vw',
    zIndex: 1200,
    '& span': {
      color: 'white'
    },
    '& .MuiListItem-root': {
      backgroundColor: '#434951'
    }
  },
  showMenu: {
    display: 'block'
  },
  primaryLink: {
    borderTop: '1px solid #59626d',
    padding: '15px 20px',
    paddingRight: 14,
    '& span': {
      fontSize: '1rem'
    },
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '&:focus': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '&.Mui-focusVisable': {
      backgroundColor: theme.bg.primaryNavActiveBG
    }
  },
  nestedLink: {
    padding: '10px 40px',
    '& span': {
      fontSize: '1rem'
    },
    '&.Mui-focusVisable': {
      backgroundColor: theme.bg.primaryNavActiveBG
    }
  }
}));

type NavGroup =
  | 'Compute'
  | 'Network'
  | 'Storage'
  | 'Monitors'
  | 'Marketplace'
  | 'Help & Support'
  | 'Community'
  | 'None';

export const MobileNav: React.FC<Props> = props => {
  const classes = useStyles();

  const { groups } = props;

  const [open, setOpen] = React.useState(false);
  const [openCompute, setOpenCompute] = React.useState(false);
  const [openNetwork, setOpenNetwork] = React.useState(false);
  const [openStorage, setOpenStorage] = React.useState(false);
  const [openMonitors, setOpenMonitors] = React.useState(false);

  const groupMap = {
    Compute: openCompute,
    Network: openNetwork,
    Storage: openStorage,
    Monitors: openMonitors
  };

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const closeNestedMenus = () => {
    setOpenCompute(false);
    setOpenNetwork(false);
    setOpenStorage(false);
    setOpenMonitors(false);
  };

  const handleClick = (group: NavGroup) => {
    closeNestedMenus();

    switch (group) {
      case 'Compute':
        setOpenCompute(!openCompute);
        break;
      case 'Network':
        setOpenNetwork(!openNetwork);
        break;
      case 'Storage':
        setOpenStorage(!openStorage);
        break;
      case 'Monitors':
        setOpenMonitors(!openMonitors);
        break;
      default:
        return;
    }
  };

  // TODO: fix hover/focus state and expanding/collapsing arrow

  return (
    <>
      {/* How we are preventing scroll on the body */}
      {open
        ? document.body.classList.add('overflow-hidden')
        : document.body.classList.remove('overflow-hidden')}

      <Backdrop className={classes.settingsBackdrop} open={open} />
      <IconButton
        className={classes.menuIcon}
        onClick={toggleMenu}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <CloseIcon /> : <MenuIcon />} Menu
      </IconButton>
      <List className={`${classes.menu} ${open && classes.showMenu}`}>
        {groups.map((thisGroup: any) => {
          // For each group, filter out hidden links
          const filteredLinks = thisGroup.links.filter(
            (thisLink: any) => !thisLink.hide
          );
          if (filteredLinks.length === 0) {
            return null;
          }

          // Render a singular PrimaryNavLink for links without a group
          if (thisGroup.group === 'None' && filteredLinks.length === 1) {
            const link = filteredLinks[0];

            return (
              <ListItem
                button
                className={classes.primaryLink}
                style={{
                  borderTop: `${link.display === 'Dashboard' ? 'none' : ''}`
                }}
              >
                <Link to={link.href} onClick={() => setOpen(false)}>
                  <ListItemText primary={link.display} />
                </Link>
              </ListItem>
            );
          }

          // Otherwise return a NavGroup (dropdown menu)
          return (
            <>
              <ListItem
                key={thisGroup.group}
                button
                className={classes.primaryLink}
                onClick={() => handleClick(thisGroup.group)}
              >
                <ListItemText primary={thisGroup.group} />
                <KeyboardArrowDown className={classes.caret} />
              </ListItem>
              <Collapse in={groupMap[thisGroup.group]}>
                <List component="div" disablePadding>
                  {filteredLinks.map((thisLink: any) => (
                    <ListItem
                      key={thisLink.group}
                      button
                      className={classes.nestedLink}
                    >
                      <Link to={thisLink.href} onClick={() => setOpen(false)}>
                        <ListItemText primary={thisLink.display} />
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          );
        })}
      </List>
    </>
  );
};

export default MobileNav;
