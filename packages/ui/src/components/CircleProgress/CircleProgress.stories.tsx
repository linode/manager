import React from 'react';

import { CircleProgress } from './CircleProgress';

import type { CircleProgressProps } from './CircleProgress';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<CircleProgressProps> = {
  render: (args) => <CircleProgress {...args} />,
};

const meta: Meta<CircleProgressProps> = {
  args: { size: 'md' },
  component: CircleProgress,
  title: 'Components/Loading States/Circle Progress',
};

export default meta;
