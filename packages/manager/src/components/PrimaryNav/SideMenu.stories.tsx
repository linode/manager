import { Box, IconButton } from '@linode/ui';
import MenuIcon from '@mui/icons-material/Menu';
import { useArgs } from '@storybook/preview-api';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TopMenuTooltip } from 'src/features/TopMenu/TopMenuTooltip';

import { SideMenu } from './SideMenu';

import type { SideMenuProps } from './SideMenu';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<SideMenuProps> = {
  render: (args) => {
    const SideMenuWrapper = () => {
      const [{ collapse, open }, updateArgs] = useArgs();

      const navHoverText = !collapse
        ? 'Collapse side menu'
        : 'Expand side menu';

      return (
        <Box display="flex">
          <Box
            onClick={() => updateArgs({ open: false })}
            sx={{ minHeight: 800 }}
          >
            <SideMenu
              {...args}
              closeMenu={() => updateArgs({ collapse: true })}
              collapse={args.collapse || collapse}
              open={args.open || open}
            />
          </Box>
          <Box sx={{ ml: '230px' }}>
            <Hidden mdDown>
              <TopMenuTooltip key={navHoverText} title={navHoverText}>
                <IconButton
                  aria-label="open menu"
                  color="inherit"
                  data-testid="open-nav-menu"
                  onClick={() => updateArgs({ collapse: !collapse })}
                  size="large"
                >
                  <MenuIcon />
                </IconButton>
              </TopMenuTooltip>
            </Hidden>
            <Hidden mdUp>
              <TopMenuTooltip key={navHoverText} title={navHoverText}>
                <IconButton
                  aria-label="open menu"
                  color="inherit"
                  onClick={() => updateArgs({ open: !open })}
                  size="large"
                >
                  <MenuIcon />
                </IconButton>
              </TopMenuTooltip>
            </Hidden>
          </Box>
        </Box>
      );
    };

    return SideMenuWrapper();
  },
};

const meta: Meta<SideMenuProps> = {
  args: {
    collapse: false,
    open: false,
  },
  component: SideMenu,
  title: 'Features/Navigation/Side Menu',
};
export default meta;
