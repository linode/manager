import React from 'react';
import { BarPercent } from './BarPercent';
import type { BarPercentProps } from './BarPercent';
import type { Meta, StoryObj } from '@storybook/react';

/** Default BarPercent */
export const Default: StoryObj<BarPercentProps> = {
  render: (args) => <BarPercent {...args} />,
};

/** Narrow BarPercent */
export const Narrow: StoryObj<BarPercentProps> = {
  render: (args) => <BarPercent {...args} narrow value={20} />,
};

const meta: Meta<BarPercentProps> = {
  title: 'Components/Loading States/Bar Percent',
  component: BarPercent,
  args: { max: 100, value: 60 },
};
export default meta;
