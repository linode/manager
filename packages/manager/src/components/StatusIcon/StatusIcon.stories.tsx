import React from 'react';

import { StatusIcon } from './StatusIcon';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof StatusIcon> = {
  component: StatusIcon,
  title: 'Icons/StatusIcon',
};

type Story = StoryObj<typeof StatusIcon>;

export const Default: Story = {
  args: {
    pulse: false,
    status: 'active',
  },
  parameters: {
    controls: { include: ['pulse', 'status', 'ariaLabel'] },
  },
  render: (args) => <StatusIcon {...args} />,
};

export default meta;
