import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';

import {
  firewallFactory,
  subnetAssignedNodebalancerDataFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { SubnetNodeBalancerRow } from './SubnetNodebalancerRow';

const LOADING_TEST_ID = 'circle-progress';

beforeAll(() => mockMatchMedia());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SubnetNodeBalancerRow', () => {
  const nodebalancer = {
    id: 123,
    label: 'test-nodebalancer',
  };

  const configs = [
    { nodes_status: { up: 3, down: 1 } },
    { nodes_status: { up: 2, down: 2 } },
  ];

  const firewalls = makeResourcePage(
    firewallFactory.buildList(1, { label: 'mock-firewall' })
  );

  const subnetNodebalancer = subnetAssignedNodebalancerDataFactory.build({
    id: nodebalancer.id,
    ipv4_range: '192.168.99.0/30',
  });

  it('renders loading state', async () => {
    const { getByTestId } = renderWithTheme(
      wrapWithTableBody(
        <SubnetNodeBalancerRow
          ipv4={subnetNodebalancer.ipv4_range}
          nodeBalancerId={subnetNodebalancer.id}
        />
      )
    );

    expect(getByTestId(LOADING_TEST_ID)).toBeInTheDocument();
    await waitForElementToBeRemoved(() => getByTestId(LOADING_TEST_ID));
  });

  it('renders nodebalancer row with data', async () => {
    server.use(
      http.get('*/nodebalancers/:id', () => {
        return HttpResponse.json(nodebalancer);
      }),
      http.get('*/nodebalancers/:id/configs', () => {
        return HttpResponse.json(configs);
      }),
      http.get('*/nodebalancers/:id/firewalls', () => {
        return HttpResponse.json(firewalls);
      })
    );

    const { getByText, getByRole } = renderWithTheme(
      wrapWithTableBody(
        <SubnetNodeBalancerRow
          ipv4={subnetNodebalancer.ipv4_range}
          nodeBalancerId={nodebalancer.id}
        />
      )
    );

    await waitFor(() => {
      expect(getByText(nodebalancer.label)).toBeInTheDocument();
    });

    expect(getByText(subnetNodebalancer.ipv4_range)).toBeInTheDocument();
    expect(getByText('mock-firewall')).toBeInTheDocument();

    const nodebalancerLink = getByRole('link', {
      name: nodebalancer.label,
    });

    expect(nodebalancerLink).toHaveAttribute(
      'href',
      `/nodebalancers/${nodebalancer.id}/summary`
    );
  });
});
