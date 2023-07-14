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

export default meta;
