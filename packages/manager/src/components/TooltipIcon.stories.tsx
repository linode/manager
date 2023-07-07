import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { TooltipIcon } from './TooltipIcon';

const meta: Meta<typeof TooltipIcon> = {
  title: 'Components/Tooltip/Tooltip Icon',
  component: TooltipIcon,
};

type Story = StoryObj<typeof TooltipIcon>;

export const Default: Story = {
  render: (args) => <TooltipIcon {...args} />,
  args: {
    text: 'Hello World',
    status: 'help',
  },
};

export default meta;
