import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { CircularProgress } from './CircularProgress';

const meta: Meta<typeof CircularProgress> = {
  component: CircularProgress,
  title: 'Components/Loading States/Circular Progress',
};

type Story = StoryObj<typeof CircularProgress>;

export const Default: Story = {
  render: (args) => <CircularProgress {...args} />,
};

export default meta;
