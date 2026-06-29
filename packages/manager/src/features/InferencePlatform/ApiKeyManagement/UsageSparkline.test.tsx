import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UsageSparkline } from './UsageSparkline';

describe('UsageSparkline', () => {
  it('renders with data', () => {
    const { container } = renderWithTheme(
      <UsageSparkline data={[10, 20, 30, 40, 50]} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with empty data', () => {
    const { container } = renderWithTheme(<UsageSparkline data={[]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with custom width', () => {
    const { container } = renderWithTheme(
      <UsageSparkline data={[10, 20, 30]} width={200} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
  });

  it('renders polyline for the sparkline', () => {
    const { container } = renderWithTheme(
      <UsageSparkline data={[10, 20, 30]} />
    );
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
  });

  it('renders polygon for the area fill', () => {
    const { container } = renderWithTheme(
      <UsageSparkline data={[10, 20, 30]} />
    );
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeInTheDocument();
  });
});
