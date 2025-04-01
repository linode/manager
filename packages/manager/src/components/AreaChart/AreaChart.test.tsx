import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AreaChart } from './AreaChart';
import { timeData } from './utils';

const props = {
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
};

class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

describe('AreaChart', () => {
  window.ResizeObserver = ResizeObserver;
  it('renders an AreaChart', () => {
    const { container } = renderWithTheme(<AreaChart {...props} />);

    expect(
      container.querySelector('recharts-responsive-container')
    ).toBeVisible();
  });
});
