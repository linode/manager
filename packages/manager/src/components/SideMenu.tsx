import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import Drawer from 'src/components/core/Drawer';

import PrimaryNav from './PrimaryNav/PrimaryNav';

const useStyles = makeStyles((theme: Theme) => ({
  collapsedDesktopMenu: {
    '&:hover': {
      '& .primaryNavLink': {
        opacity: 1,
      },
      overflowY: 'auto',
      width: '190px !important',
    },
    [theme.breakpoints.up('sm')]: {
      overflowY: 'hidden',
    },
    width: '52px !important',
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
  closeMenu: () => void;
  collapse: boolean;
  open: boolean;
}

type CombinedProps = Props;

export const SideMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { closeMenu, collapse, open } = props;

  return (
    <>
      <Hidden mdUp>
        <Drawer
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          classes={{
            paper: classes.menuPaper,
          }}
          onClose={closeMenu}
          open={open}
          variant="temporary"
        >
          <PrimaryNav closeMenu={closeMenu} isCollapsed={false} />
        </Drawer>
      </Hidden>
      <Hidden implementation="css" mdDown>
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
