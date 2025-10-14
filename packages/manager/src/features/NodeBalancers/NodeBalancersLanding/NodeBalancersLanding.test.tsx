import { nodeBalancerFactory } from '@linode/utilities';
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancersLanding } from './NodeBalancersLanding';

const queryMocks = vi.hoisted(() => ({
  useMatch: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      create_nodebalancer: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useMatch: queryMocks.useMatch,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
  };
});

beforeAll(() => {
  mockMatchMedia();
  queryMocks.useParams.mockReturnValue({ id: 1 });
});

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

  it('should disable the "Create NodeBalancer" button if the user does not have permission', async () => {
    const { getByRole } = renderWithTheme(<NodeBalancersLanding />);

    await waitFor(() => {
      const createNodeBalancerBtn = getByRole('button', {
        name: 'Create NodeBalancer',
      });

      expect(createNodeBalancerBtn).toBeInTheDocument();
      expect(createNodeBalancerBtn).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('should enable the "Create NodeBalancer" button if the user has permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_nodebalancer: true,
      },
    });

    const { getByRole } = renderWithTheme(<NodeBalancersLanding />);

    await waitFor(() => {
      const createNodeBalancerBtn = getByRole('button', {
        name: 'Create NodeBalancer',
      });

      expect(createNodeBalancerBtn).toBeInTheDocument();
      expect(createNodeBalancerBtn).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });
});
