import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';

import PrimaryNav from './PrimaryNav/PrimaryNav';

export const SIDEBAR_WIDTH = 190;

export interface Props {
  closeMenu: () => void;
  collapse: boolean;
  open: boolean;
}

export const SideMenu = (props: Props) => {
  const { closeMenu, collapse, open } = props;

  return (
    <>
      <Hidden mdUp>
        <StyledDrawer
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          onClose={closeMenu}
          open={open}
          variant="temporary"
        >
          <PrimaryNav closeMenu={closeMenu} isCollapsed={false} />
        </StyledDrawer>
      </Hidden>
      <Hidden implementation="css" mdDown>
        <StyledDrawer collapse={collapse} open variant="permanent">
          <PrimaryNav closeMenu={closeMenu} isCollapsed={collapse} />
        </StyledDrawer>
      </Hidden>
    </>
  );
};

const StyledDrawer = styled(Drawer, {
  label: 'StyledSideMenuDrawer',
  shouldForwardProp: (prop) => prop !== 'collapse',
})<{ collapse?: boolean }>(({ theme, ...props }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.bg.primaryNavPaper,
    borderRight: 'none',
    boxShadow: 'none',
    height: '100%',
    left: 'inherit',
    overflowX: 'hidden',
    transform: 'none',
    transition: 'width linear .1s',
    width: SIDEBAR_WIDTH,
  },
  ...(props.collapse && {
    [theme.breakpoints.up('md')]: {
      '& .MuiDrawer-paper': {
        '&:hover': {
          '& .primaryNavLink': {
            opacity: 1,
          },
          overflowY: 'auto',
          width: SIDEBAR_WIDTH,
        },
        [theme.breakpoints.up('sm')]: {
          overflowY: 'hidden',
        },
        width: '52px',
      },
      '&.MuiDrawer-docked': {
        height: '100%',
      },
    },
  }),
}));
