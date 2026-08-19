import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseTooltip } from './CloudPulseTooltip';

describe('CloudPulseTooltip', () => {
  const baseProps = {
    accessibilityLayer: false,
    active: true,
    activeIndex: '0',
    coordinate: {
      x: 100,
      y: 100,
    },
    label: 1720000000000,
    timezone: 'UTC',
    unit: '%',
  };

  it('shows all metrics that match selected metric value at the timestamp', () => {
    const payload = [
      {
        dataKey: 'cpu',
        graphicalItemId: 'graph-1',
        payload: {
          cpu: 1.6,
          disk: 2.1,
          memory: 1.6,
          timestamp: 1720000000000,
        },
        value: 1.6,
      },
    ];

    renderWithTheme(
      <CloudPulseTooltip
        {...baseProps}
        customTooltipOptions={{
          active: true,
          tooltipFilter: {
            dataKey: 'cpu',
          },
        }}
        payload={payload}
      />
    );
    screen.getByText('cpu');
    screen.getByText('memory');
    expect(screen.queryByText('disk')).not.toBeInTheDocument();
  });

  it('returns no metric rows when selected metric key is missing for current timestamp', () => {
    const payload = [
      {
        dataKey: 'cpu',
        graphicalItemId: 'graph-1',
        payload: {
          disk: 2.1,
          memory: 1.6,
          timestamp: 1720000000000,
        },
        value: 2.1,
      },
    ];

    renderWithTheme(
      <CloudPulseTooltip
        {...baseProps}
        customTooltipOptions={{
          active: true,
          tooltipFilter: {
            dataKey: 'cpu',
          },
        }}
        payload={payload}
      />
    );

    expect(screen.queryByText('disk')).not.toBeInTheDocument();
    expect(screen.queryByText('memory')).not.toBeInTheDocument();
  });
});
