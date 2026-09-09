import React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseGraphPicker } from './CloudPulseGraphPicker';

import type { CloudPulseGraphPickerProps } from './chartTypes';

vi.mock('./CloudPulseBarChart', () => ({
  CloudPulseBarChart: (props: CloudPulseGraphPickerProps) => (
    <div
      aria-label="CloudPulse bar chart"
      data-variant={props.variant}
      data-widget-label={props.widgetLabel}
      data-zoom-reset-key={props.zoomResetKey}
      role="img"
    />
  ),
}));

vi.mock('./CloudPulseLineGraph', () => ({
  CloudPulseLineGraph: (props: CloudPulseGraphPickerProps) => (
    <div
      aria-label="CloudPulse line graph"
      data-variant={props.variant}
      data-widget-label={props.widgetLabel}
      data-zoom-reset-key={props.zoomResetKey}
      role="img"
    />
  ),
}));

const mockProps: CloudPulseGraphPickerProps = {
  areas: [
    {
      color: 'theme.color.green',
      dataKey: 'system_cpu_utilization_percent',
    },
  ],
  ariaLabel: 'CPU Utilization',
  data: [{ system_cpu_utilization_percent: 10, timestamp: 1672531200000 }],
  timezone: 'UTC',
  unit: '%',
  widgetLabel: 'CPU Utilization',
  xAxis: {
    tickFormat: 'HH:mm',
    tickGap: 50,
  },
  zoomResetKey: 'test-zoom',
};

describe('CloudPulseGraphPicker', () => {
  it.each(['area', 'line'] as const)(
    'renders CloudPulseLineGraph for the %s variant',
    (variant) => {
      const { getByRole, queryByRole } = renderWithTheme(
        <CloudPulseGraphPicker {...mockProps} variant={variant} />
      );
      const lineGraph = getByRole('img', { name: 'CloudPulse line graph' });

      expect(lineGraph).toHaveAttribute('data-variant', variant);
      expect(lineGraph).toHaveAttribute(
        'data-widget-label',
        mockProps.widgetLabel
      );
      expect(lineGraph).toHaveAttribute(
        'data-zoom-reset-key',
        mockProps.zoomResetKey
      );
      expect(
        queryByRole('img', { name: 'CloudPulse bar chart' })
      ).not.toBeInTheDocument();
    }
  );

  it.each(['bar', 'stacked-bar'] as const)(
    'renders CloudPulseBarChart for the %s variant',
    (variant) => {
      const { getByRole, queryByRole } = renderWithTheme(
        <CloudPulseGraphPicker {...mockProps} variant={variant} />
      );
      const barChart = getByRole('img', { name: 'CloudPulse bar chart' });

      expect(barChart).toHaveAttribute('data-variant', variant);
      expect(barChart).toHaveAttribute(
        'data-widget-label',
        mockProps.widgetLabel
      );
      expect(barChart).toHaveAttribute(
        'data-zoom-reset-key',
        mockProps.zoomResetKey
      );
      expect(
        queryByRole('img', { name: 'CloudPulse line graph' })
      ).not.toBeInTheDocument();
    }
  );

  it('renders nothing for an unsupported variant', () => {
    const { container } = renderWithTheme(
      <CloudPulseGraphPicker
        {...mockProps}
        variant={'unsupported' as CloudPulseGraphPickerProps['variant']}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
