import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { TooltipIcon } from './TooltipIcon';

const meta: Meta<typeof TooltipIcon> = {
  component: TooltipIcon,
  title: 'Components/Tooltip/Tooltip Icon',
};

type Story = StoryObj<typeof TooltipIcon>;

export const Default: Story = {
  args: {
    status: 'help',
    text: 'Hello World',
  },
  render: (args) => <TooltipIcon {...args} />,
};

export const VariableWidth: Story = {
  args: {
    status: 'help',
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    width: 500,
  },
  render: (args) => <TooltipIcon {...args} />,
};

export default meta;
