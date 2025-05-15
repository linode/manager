import React from 'react';

import { LinearProgress } from './LinearProgress';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LinearProgress> = {
  component: LinearProgress,
  title: 'Components/Loading States/Linear Progress',
};

type Story = StoryObj<typeof LinearProgress>;

export const Default: Story = {
  render: (args) => <LinearProgress {...args} />,
};

export default meta;
