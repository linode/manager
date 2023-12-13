import * as React from 'react';

import { GaugePercent } from './GaugePercent';

import type { GaugePercentProps } from './GaugePercent';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<GaugePercentProps> = {
  render: (args) => <GaugePercent {...args} />,
};

const meta: Meta<GaugePercentProps> = {
  args: {
    height: 150,
    innerText: '25%',
    innerTextFontSize: 12,
    max: 200,
    subTitle: 'CPU',
    value: 50,
    width: 150,
  },
  component: GaugePercent,
  title: 'Components/Analytics & Graphs/GaugesPercent',
};
export default meta;
