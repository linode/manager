import React from 'react';

import { formatPercentage, getMetrics } from 'src/utilities/statMetrics';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LineGraph } from './LineGraph';

import type { DataSet, LineGraphProps } from './LineGraph';

vi.mock('@mui/material/styles', async () => {
  const actual = await vi.importActual('@mui/material/styles');
  return {
    ...actual,
    useTheme: () => ({
      borderColors: {
        borderTable: '#000',
      },
      breakpoints: {
        down: vi.fn(() => ({})),
        up: vi.fn(() => ({})),
      },
      color: {
        black: '#000',
      },
      font: {
        normal: 'normal',
      },
      palette: {
        primary: {
          main: '#000',
        },
      },
      spacing: vi.fn(() => 0),
      textColors: {
        tableHeaders: '#000',
      },
    }),
  };
});

vi.mock('@mui/material/useMediaQuery', async () => {
  const actual = await vi.importActual('@mui/material/useMediaQuery');
  return {
    ...actual,
    default: () => false,
  };
});

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useInsertionEffect: vi.fn(() => {}),
    useState: vi.fn(() => ['legendRendered', vi.fn()]),
  };
});

const data: DataSet['data'] = [
  [1644330600000, 0.1],
  [1644330900000, 0.2],
];

describe('GaugePercent Component', () => {
  const defaultProps: LineGraphProps = {
    accessibleDataTable: { unit: '%' },
    ariaLabel: 'Stats and metrics for Linode-1',
    data: [],
    showToday: true,
    timezone: 'America/New_York',
    unit: 'Unit',
  };

  it('renders', () => {
    const { getByTestId } = renderWithTheme(<LineGraph {...defaultProps} />);
    const linegraphWrapper = getByTestId('linegraph-wrapper');

    expect(linegraphWrapper).toBeInTheDocument();
  });

  it('renders the canvas element with aria-label', () => {
    const { getByLabelText } = renderWithTheme(<LineGraph {...defaultProps} />);
    const canvas = getByLabelText(defaultProps.ariaLabel || '');

    expect(canvas).toBeInTheDocument();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('renders a legend table if legendRows is provided', async () => {
    const metrics = getMetrics(data as number[][]);
    const { getByRole } = renderWithTheme(
      <LineGraph
        {...defaultProps}
        data={[
          {
            backgroundColor: 'blue',
            borderColor: 'transparent',
            data,
            label: 'CPU %',
          },
        ]}
        legendRows={[
          {
            data: metrics,
            format: formatPercentage,
            legendColor: 'blue',
            legendTitle: 'CPU %',
          },
        ]}
      />
    );

    const table = getByRole('table');

    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute(
      'aria-label',
      'Controls for Stats and metrics for Linode-1'
    );
  });
});
