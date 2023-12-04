import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';

import PrimaryNav from './PrimaryNav';

export const SIDEBAR_WIDTH = 190;
export const SIDEBAR_COLLAPSED_WIDTH = 52;

export interface SideMenuProps {
  /**
   * Callback to close the menu.
   */
  closeMenu: () => void;
  /**
   * If true, the menu will be collapsed.
   */
  collapse: boolean;
  /**
   * If true, the menu will be open. Has no effect unless the viewport is less than 960px.
   */
  open: boolean;
}

/**
 * The wrapper for the primary navigation menu.
 *
 * The Linodes landing page is considered the homepage unless the account is managed. Otherwise, clicking on the Linode logo will take the user to the Managed landing page.
 */
export const SideMenu = (props: SideMenuProps) => {
  const { closeMenu, collapse, open } = props;

  return (
    <>
      <Hidden mdUp>
        <StyledDrawer
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          data-testid="side-menu-mobile"
          onClose={closeMenu}
          open={open}
          variant="temporary"
        >
          <PrimaryNav closeMenu={closeMenu} isCollapsed={false} />
        </StyledDrawer>
      </Hidden>
      <Hidden implementation="css" mdDown>
        <StyledDrawer
          collapse={collapse}
          data-testid="side-menu"
          open
          variant="permanent"
        >
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
        width: `${SIDEBAR_COLLAPSED_WIDTH}px`,
      },
      '&.MuiDrawer-docked': {
        height: '100%',
      },
    },
  }),
}));
