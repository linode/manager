import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { LinearProgress } from './LinearProgress';

const meta: Meta<typeof LinearProgress> = {
  title: 'Components/Loading States/Linear Progress',
  component: LinearProgress,
};

type Story = StoryObj<typeof LinearProgress>;

export const Default: Story = {
  render: (args) => <LinearProgress {...args} />,
};

export default meta;
