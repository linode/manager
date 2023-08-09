import React from 'react';

import { DEFAULT_DELAY, LandingLoading } from './LandingLoading';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LandingLoading> = {
  argTypes: {},
  args: {
    children: undefined,
    delayInMS: DEFAULT_DELAY,
    shouldDelay: false,
  },
  component: LandingLoading,
  title: 'Components/Loading States/LandingLoading',
};

export default meta;

type Story = StoryObj<typeof LandingLoading>;

export const Default: Story = {
  args: {},
  render: (args) => <LandingLoading {...args} />,
};
