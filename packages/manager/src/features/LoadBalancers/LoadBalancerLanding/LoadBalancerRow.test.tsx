import React from 'react';

import { loadbalancerFactory } from 'src/factories';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { LoadBalancerRow } from './LoadBalancerRow';

beforeAll(() => mockMatchMedia());

describe('LoadBalancerRow', () => {
  it('renders label and hostname', async () => {
    const loadbalancer = loadbalancerFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <LoadBalancerRow
          handlers={{ onDelete: jest.fn() }}
          loadBalancer={loadbalancer}
        />
      )
    );

    expect(getByText(loadbalancer.label)).toBeVisible();
    expect(getByText(loadbalancer.hostname)).toBeVisible();
  });
});
