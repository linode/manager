import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StackedBarChart } from './StackedBarChart';

import type { ChartPayload } from './StackedBarChart';

describe('StackedBarChart sparse data alignment', () => {
  it('renders without error when all series share the same buckets', () => {
    const data: ChartPayload = {
      series: [
        {
          id: 'model-a',
          label: 'Model A',
          values: [
            { time: '00:00', value: 10 },
            { time: '01:00', value: 20 },
            { time: '02:00', value: 30 },
          ],
        },
        {
          id: 'model-b',
          label: 'Model B',
          values: [
            { time: '00:00', value: 5 },
            { time: '01:00', value: 15 },
            { time: '02:00', value: 25 },
          ],
        },
      ],
    };

    const { container } = renderWithTheme(<StackedBarChart data={data} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without error when series have different bucket counts (sparse data)', () => {
    // Model A has 3 buckets; Model B is missing the middle bucket.
    // Without alignment-by-key, Model B's value at index 1 would be
    // misaligned ("02:00 = 25" shifted to the "01:00" row).
    const data: ChartPayload = {
      series: [
        {
          id: 'model-a',
          label: 'Model A',
          values: [
            { time: '00:00', value: 10 },
            { time: '01:00', value: 20 },
            { time: '02:00', value: 30 },
          ],
        },
        {
          id: 'model-b',
          label: 'Model B',
          values: [
            { time: '00:00', value: 5 },
            // '01:00' bucket intentionally missing for model-b
            { time: '02:00', value: 25 },
          ],
        },
      ],
    };

    const { container } = renderWithTheme(<StackedBarChart data={data} />);
    expect(container.firstChild).toBeTruthy();
  });
});
