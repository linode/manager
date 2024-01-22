import React from 'react';

import { tooltipValueFormatter } from 'src/components/AreaChart/utils';
import { getMetrics } from 'src/utilities/statMetrics';

import { AreaChart } from './AreaChart';
import { customLegendData, timeData } from './utils';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const meta: Meta<typeof AreaChart> = {
  component: AreaChart,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ marginTop: '2em' }}>
        <Story />
      </div>
    ),
  ],
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
    height: 300,
    showLegend: true,
    timezone: 'UTC',
    unit: ` Kb/s`,
    xAxis: {
      tickFormat: 'LLL dd',
      tickGap: 30,
    },
  },
  render: (args) => <AreaChart {...args} />,
};

export const CustomLegend: Story = {
  args: {
    areas: [
      {
        color: '#1CB35C',
        dataKey: 'Public Outbound Traffic',
      },
    ],
    ariaLabel: 'Network Transfer History Graph',
    data: timeData,
    height: 360,
    legendRows: [
      {
        data: getMetrics(customLegendData),
        format: (value: number) => tooltipValueFormatter(value, ' Kb/s'),
        legendColor: 'lightGreen',
        legendTitle: 'Public Outbound Traffic',
      },
    ],
    showLegend: true,
    timezone: 'UTC',
    unit: ` Kb/s`,
    xAxis: {
      tickFormat: 'LLL dd',
      tickGap: 30,
    },
  },
  render: (args) => <AreaChart {...args} />,
};
