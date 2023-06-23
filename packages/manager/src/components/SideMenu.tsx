import * as React from 'react';
import Drawer from 'src/components/core/Drawer';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import PrimaryNav from './PrimaryNav/PrimaryNav';

const useStyles = makeStyles((theme: Theme) => ({
  collapsedDesktopMenu: {
    '&:hover': {
      '& .primaryNavLink': {
        opacity: 1,
      },
      overflowY: 'auto',
      width: 190,
    },
    [theme.breakpoints.up('sm')]: {
      overflowY: 'hidden',
    },
    width: 52,
  },
  desktopMenu: {
    transform: 'none',
  },
  menuDocked: {
    height: '100%',
  },
  menuPaper: {
    backgroundColor: theme.bg.primaryNavPaper,
    borderRight: 'none',
    boxShadow: 'none',
    height: '100%',
    left: 'inherit',
    overflowX: 'hidden',
    transition: 'width linear .1s',
    width: 190,
  },
}));

export interface Props {
  collapse: boolean;
  open: boolean;
  closeMenu: () => void;
}

type CombinedProps = Props;

export const SideMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { closeMenu, collapse, open } = props;

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
      <Hidden mdDown implementation="css">
        <Drawer
          classes={{
            docked: classes.menuDocked,
            paper: `${classes.menuPaper} ${
              collapse && classes.collapsedDesktopMenu
            }`,
          }}
          className={classes.desktopMenu}
          open
          variant="permanent"
        >
          <PrimaryNav closeMenu={closeMenu} isCollapsed={collapse} />
        </Drawer>
      </Hidden>
    </>
  );
};

export default SideMenu;
