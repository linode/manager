import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LandingLoading, DEFAULT_DELAY } from './LandingLoading';

const meta: Meta<typeof LandingLoading> = {
  title: 'Components/LandingLoading',
  component: LandingLoading,
  argTypes: {},
  args: {
    shouldDelay: false,
    delayInMS: DEFAULT_DELAY,
    children: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof LandingLoading>;

export const Default: Story = {
  args: {},
  render: (args) => <LandingLoading {...args} />,
};
