import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LineGraph } from './LineGraph';

import type { LineGraphProps } from './LineGraph';

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
});
