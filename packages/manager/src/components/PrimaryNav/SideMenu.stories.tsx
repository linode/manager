import * as React from 'react';

import { Box } from 'src/components/Box';

import { SideMenu } from './SideMenu';

import type { SideMenuProps } from './SideMenu';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<SideMenuProps> = {
  render: (args) => {
    const SideMenuWrapper = () => {
      const [open, setOpen] = React.useState(args.open);

      return (
        <Box sx={{ minHeight: 500 }}>
          <SideMenu {...args} closeMenu={() => setOpen(false)} open={open} />
        </Box>
      );
    };

    return SideMenuWrapper();
  },
};

const meta: Meta<SideMenuProps> = {
  args: {
    closeMenu: () => null,
    collapse: false,
    open: true,
  },
  component: SideMenu,
  title: 'Features/Navigation/Side Menu',
};
export default meta;
