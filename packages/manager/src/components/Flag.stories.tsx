import React from 'react';

import { Flag } from './Flag';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Flag> = {
  component: Flag,
  title: 'Icons/Flag',
};

type Story = StoryObj<typeof Flag>;

export const Default: Story = {
  args: {
    country: 'us',
  },
  render: (args) => <Flag {...args} />,
};

export default meta;
