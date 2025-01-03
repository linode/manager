import * as React from 'react';

import { TopMenu } from './TopMenu';

import type { TopMenuProps } from './TopMenu';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<TopMenuProps> = {
  render: (args) => <TopMenu {...args} />,
};

const meta: Meta<TopMenuProps> = {
  args: {
    desktopMenuToggle: () => null,
    username: 'User 1',
  },
  component: TopMenu,
  title: 'Features/Navigation/Top Menu',
};
export default meta;
