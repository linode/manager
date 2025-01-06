import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from 'src/components/PrimaryNav/constants';
import { TOPMENU_HEIGHT } from 'src/features/TopMenu/TopMenu';

import PrimaryNav from './PrimaryNav';
import { useScrollingUtils } from './utils';

export interface SideMenuProps {
  /**
   * Callback to close the menu.
   */
  closeMenu: () => void;
  /**
   * If true, the menu will be collapsed.
   */
  collapse: boolean;
  desktopMenuToggle: () => void;
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
  const { closeMenu, collapse, desktopMenuToggle, open } = props;
  const { isAtTop } = useScrollingUtils();
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
          <PrimaryNav
            closeMenu={closeMenu}
            desktopMenuToggle={desktopMenuToggle}
            isCollapsed={false}
          />
        </StyledDrawer>
      </Hidden>
      <Hidden implementation="css" mdDown>
        <StyledDrawer
          collapse={collapse}
          data-testid="side-menu"
          isAtTop={isAtTop}
          open
          variant="permanent"
        >
          <PrimaryNav
            closeMenu={closeMenu}
            desktopMenuToggle={desktopMenuToggle}
            isCollapsed={collapse}
          />
        </StyledDrawer>
      </Hidden>
    </>
  );
};

const StyledDrawer = styled(Drawer, {
  label: 'StyledSideMenuDrawer',
  shouldForwardProp: (prop) => prop !== 'collapse' && prop !== 'isAtTop',
})<{ collapse?: boolean; isAtTop?: boolean }>(({ theme, ...props }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.tokens.sideNavigation.Background.Default,
    boxShadow: 'none',
    height: props.isAtTop ? `calc(100% - ${TOPMENU_HEIGHT}px)` : '100%',
    left: 'inherit',
    overflowX: 'hidden',
    position: 'absolute',
    [theme.breakpoints.up('md')]: {
      borderRight: `1px solid ${theme.tokens.sideNavigation.Border}`,
    },
    transform: 'none',
    transition: 'width linear 100ms, height linear 250ms',
    width: SIDEBAR_WIDTH,
  },
  ...(props.collapse && {
    [theme.breakpoints.up('md')]: {
      '& .MuiDrawer-paper': {
        '&:hover': {
          '& .primaryNavLink, .akamai-logo-name, p': {
            opacity: 1,
          },
          '.MuiAccordion-region, div[class*="StyledSingleLinkBox"]': {
            maxHeight: '100%',
          },
          overflowY: 'auto',
          width: SIDEBAR_WIDTH,
        },
        [theme.breakpoints.up('sm')]: {
          overflowY: 'hidden',
        },
        width: `${SIDEBAR_COLLAPSED_WIDTH}px`,
      },
      '& a[aria-current="true"]': {
        background: theme.tokens.sideNavigation.SelectedMenuItem.Background,
      },
      '&.MuiDrawer-docked': {
        height: '100%',
      },
      // when the nav is collapsed, we want to visually hide expanded content and single links like Managed
      '.MuiAccordion-region, div[class*="StyledSingleLinkBox"]': {
        maxHeight: 0,
        overflow: 'hidden',
        transition: 'max-height .1s linear',
      },
    },
  }),
}));
