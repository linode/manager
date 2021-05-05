import * as React from 'react';
import Drawer from 'src/components/core/Drawer';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import PrimaryNav from './PrimaryNav/PrimaryNav';

const useStyles = makeStyles((theme: Theme) => ({
  menuPaper: {
    backgroundColor: theme.bg.primaryNavPaper,
    borderRight: 'none',
    boxShadow: 'none',
    height: '100%',
    width: 190,
    left: 'inherit',
    overflowX: 'hidden',
    transition: 'width linear .1s',
  },
  menuDocked: {
    height: '100%',
  },
  desktopMenu: {
    transform: 'none',
  },
  collapsedDesktopMenu: {
    width: 52,
    '&:hover': {
      overflowY: 'auto',
      width: 190,
      '& .primaryNavLink': {
        opacity: 1,
      },
      '& .logoCollapsed': {
        opacity: 0,
      },
    },
    [theme.breakpoints.up('sm')]: {
      overflowY: 'hidden',
    },
  },
}));

interface Props {
  open: boolean;
  desktopOpen: boolean;
  closeMenu: () => void;
}

type CombinedProps = Props;

export const SideMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { open, desktopOpen, closeMenu } = props;

  return (
    <>
      <Hidden mdUp>
        <Drawer
          classes={{
            paper: classes.menuPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          onClose={closeMenu}
          open={open}
          variant="temporary"
        >
          <PrimaryNav closeMenu={closeMenu} isCollapsed={false} />
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          classes={{
            paper: `${classes.menuPaper} ${
              desktopOpen && classes.collapsedDesktopMenu
            }`,
            docked: classes.menuDocked,
          }}
          className={classes.desktopMenu}
          open
          variant="permanent"
        >
          <PrimaryNav closeMenu={closeMenu} isCollapsed={desktopOpen} />
        </Drawer>
      </Hidden>
    </>
  );
};

export default SideMenu;
