import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { nodeBalancerFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancersLanding } from './NodeBalancersLanding';

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';

describe('NodeBalancersLanding', () => {
  it('renders the NodeBalancer empty state if there are no NodeBalancers', async () => {
    server.use(
      http.get('*/nodebalancers', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <NodeBalancersLanding />
    );

    // expect loading state and wait for it to disappear
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByText('NodeBalancers')).toBeVisible();
    expect(getByText('Cloud-based load balancing service')).toBeVisible();
    expect(
      getByText(
        'Add high availability and horizontal scaling to web applications hosted on Linode Compute Instances.'
      )
    ).toBeVisible();
  });

  it('renders the NodeBalancer table if there are NodeBalancers', async () => {
    server.use(
      http.get('*/nodebalancers', () => {
        const nodebalancers = nodeBalancerFactory.buildList(1);
        return HttpResponse.json(makeResourcePage(nodebalancers));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <NodeBalancersLanding />
    );

    // expect loading state and wait for it to disappear
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByText('NodeBalancers')).toBeVisible();
    expect(getByText('Create NodeBalancer')).toBeVisible();

    // confirm table headers
    expect(getByText('Label')).toBeVisible();
    expect(getByText('Backend Status')).toBeVisible();
    expect(getByText('Transferred')).toBeVisible();
    expect(getByText('Ports')).toBeVisible();
    expect(getByText('IP Address')).toBeVisible();
    expect(getByText('Region')).toBeVisible();
  });
});
