import React from 'react';

import { CircleProgress } from './CircleProgress';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof CircleProgress>;

export const Default: Story = {
  render: (args) => <CircleProgress {...args} />,
};

const meta: Meta<typeof CircleProgress> = {
  component: CircleProgress,
  title: 'Components/Loading States/Circle Progress',
};

export default meta;
