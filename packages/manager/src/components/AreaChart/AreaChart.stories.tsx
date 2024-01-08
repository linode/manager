import React from 'react';

import { AreaChart } from './AreaChart';
import { timeData } from './utils';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AreaChart> = {
  component: AreaChart,
  title: 'Components/Graphs/AreaChart',
};

export default meta;

type Story = StoryObj<typeof AreaChart>;

export const Default: Story = {
  args: {
    areas: [
      {
        color: '#1CB35C',
        dataKey: 'Public Outbound Traffic',
      },
    ],
    ariaLabel: 'Network Transfer History Graph',
    data: timeData,
    height: 190,
    timezone: 'UTC',
    unit: ` Kb/s`,
    xAxis: {
      tickFormat: 'LLL dd',
      tickGap: 30,
    },
  },
  render: (args) => <AreaChart {...args} />,
};
