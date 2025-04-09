import * as React from 'react';

import { LineGraph } from 'src/components/LineGraph/LineGraph';
import { formatPercentage, getMetrics } from 'src/utilities/statMetrics';

import type { DataSet, LineGraphProps } from './LineGraph';
import type { Meta, StoryObj } from '@storybook/react';

const data: DataSet['data'] = [
  [1644330600000, 0.45],
  [1644330900000, 0.45],
  [1644331200000, 0.46],
  [1644331500000, 0.46],
  [1644331800000, 0.45],
  [1644332100000, 1.11],
  [1644332400000, 1.11],
  [1644332700000, 0.48],
  [1644333000000, 0.57],
  [1644333300000, 0.66],
  [1644333600000, 0.46],
  [1644333900000, 0.45],
  [1644334200000, 0.45],
  [1644334500000, 0.46],
  [1644334800000, 0.46],
  [1644335100000, 0.45],
  [1644335400000, 0.44],
  [1644335700000, 0.46],
  [1644336000000, 0.46],
  [1644336300000, 0.45],
  [1644336600000, 0.45],
  [1644336900000, 0.46],
  [1644337200000, 0.45],
  [1644337500000, 0.47],
  [1644337800000, 0.63],
  [1644338100000, 0.26],
  [1644338400000, 0.45],
  [1644338700000, 0.45],
  [1644339000000, 0.46],
  [1644339300000, 0.46],
  [1644339600000, 0.45],
  [1644339900000, 0.45],
  [1644340200000, 0.46],
  [1644340500000, 0.45],
];

const metrics = getMetrics(data as number[][]);

export const Default: StoryObj<LineGraphProps> = {
  render: (args) => <LineGraph {...args} />,
};

export const WithLegend: StoryObj<LineGraphProps> = {
  render: (args) => (
    <LineGraph
      {...args}
      legendRows={[
        {
          data: metrics,
          format: formatPercentage,
          legendColor: 'blue',
          legendTitle: 'CPU %',
        },
      ]}
    />
  ),
};

const meta: Meta<LineGraphProps> = {
  args: {
    accessibleDataTable: {
      unit: '%',
    },
    chartHeight: 300,
    data: [
      {
        backgroundColor: 'rgba(54, 131, 220, 0.7)',
        borderColor: 'transparent',
        data,
        label: 'CPU (%)',
      },
    ],
    nativeLegend: false,
    showToday: true,
    timezone: 'America/New_York',
    unit: '%',
  },
  component: LineGraph,
  title: 'Components/Graphs/LineGraph',
};
export default meta;
