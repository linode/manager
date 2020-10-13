import Backdrop from '@material-ui/core/Backdrop';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';

interface Props {
  groups: any;
}

const useStyles = makeStyles((theme: Theme) => ({
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
    }
  },
  showMenu: {
    display: 'block'
  },
  menuItemLinkNoGroup: {
    borderTop: '1px solid #59626d',
    padding: 0,
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '& a': {
      padding: '15px 20px',
      width: '100%',
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG,
        outline: '1px dotted #999'
      }
    },
    '& span': {
      fontSize: '1rem'
    }
  },
  menuItemLink: {
    borderTop: '1px solid #59626d',
    padding: '15px 20px',
    paddingRight: 14,
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '&:focus': {
      backgroundColor: theme.bg.primaryNavActiveBG,
      outline: '1px dotted #999'
    },
    '& span': {
      fontSize: '1rem'
    }
  },
  caret: {
    color: '#9ea4ae',
    marginTop: 2
  },
  nestedLink: {
    padding: 0,
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '& a': {
      padding: '7.5px 40px',
      width: '100%',
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG,
        outline: '1px dotted #999'
      }
    },
    '& span': {
      fontSize: '1rem'
    }
  },
  settingsBackdrop: {
    backgroundColor: 'rgba(50, 54, 60, 0.5)',
    top: 50,
    left: 0,
    zIndex: 6
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
    closeNestedMenus();
    setOpen(isOpen => !isOpen);
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

  const handleClickAway = () => {
    setOpen(false);
  };

  const isGroupOpen = (group: NavGroup) => {
    switch (group) {
      case 'Compute':
        return openCompute;
      case 'Network':
        return openNetwork;
      case 'Storage':
        return openStorage;
      case 'Monitors':
        return openMonitors;
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
      <ClickAwayListener onClickAway={handleClickAway}>
        <>
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
                    data-testid={`menu-item-${link.display}`}
                    className={classes.menuItemLinkNoGroup}
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
                    aria-controls={`menu-${thisGroup.group}`}
                    aria-haspopup="true"
                    button
                    className={classes.menuItemLink}
                    id={`button-${thisGroup.group}`}
                    key={thisGroup.group}
                    onClick={() => handleClick(thisGroup.group)}
                  >
                    <ListItemText primary={thisGroup.group} />
                    {isGroupOpen(thisGroup.group) ? (
                      <ExpandLess className={classes.caret} />
                    ) : (
                      <ExpandMore className={classes.caret} />
                    )}
                  </ListItem>
                  <Collapse in={groupMap[thisGroup.group]}>
                    <List
                      aria-labelledby={`button-${thisGroup.group}`}
                      component="div"
                      disablePadding
                      id={`menu-${thisGroup.group}`}
                      role="menu"
                    >
                      {filteredLinks.map((thisLink: any) => (
                        <ListItem
                          className={classes.nestedLink}
                          data-testid={`menu-item-${thisLink.display}`}
                          key={thisLink.group}
                          role="menuitem"
                        >
                          <Link
                            to={thisLink.href}
                            onClick={() => setOpen(false)}
                          >
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
      </ClickAwayListener>
      <Backdrop className={classes.settingsBackdrop} open={open} />
    </>
  );
};

export default MobileNav;
