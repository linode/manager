import { Global } from '@linode/design-language-system';
import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';

import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from './constants';
import PrimaryNav from './PrimaryNav';

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
   * Callback to toggle the desktop menu.
   */
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

  return (
    <>
      <Hidden mdUp>
        <StyledDrawer
          data-testid="side-menu-mobile"
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
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
  shouldForwardProp: (prop) => prop !== 'collapse',
})<{ collapse?: boolean }>(({ theme, ...props }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: Global.Color.Neutrals[90],
    boxShadow: 'none',
    height: '100%',
    left: 'inherit',
    overflow: 'hidden',
    position: 'absolute',
    [theme.breakpoints.up('md')]: {
      borderRight: `1px solid ${theme.tokens.component.SideNavigation.Border}`,
    },
    transform: 'none',
    transition: 'width linear 100ms, height linear 250ms',
    width: SIDEBAR_WIDTH,
  },
  ...(props.collapse && {
    [theme.breakpoints.up('md')]: {
      '& .MuiDrawer-paper': {
        '&:hover': {
          '& .primaryNavLink, .akamai-logo-name, .productFamilyName': {
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
