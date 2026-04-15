import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { reservedIPsFactory } from 'src/factories/networking';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { ReservedIpsLanding } from './ReservedIpsLanding';
import { headers } from './ReservedIpsLandingEmptyStateData';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({ data: { restricted: false } }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';
const reservedIPsEndpoint = '*/networking/reserved/ips';

describe('Reserved IPs Landing', () => {
  it('renders loading state initially', async () => {
    server.use(
      http.get(reservedIPsEndpoint, () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByTestId } = renderWithTheme(<ReservedIpsLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId), {
      timeout: 10000,
    });
  });

  it('renders the empty state when there are no reserved IPs', async () => {
    server.use(
      http.get(reservedIPsEndpoint, () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<ReservedIpsLanding />);

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByText(headers.description)).toBeInTheDocument();
  });

  it('renders the table with reserved IPs', async () => {
    const reservedIPs = reservedIPsFactory.buildList(3, {
      region: 'us-east',
      reserved: true,
    });

    server.use(
      http.get(reservedIPsEndpoint, () => {
        return HttpResponse.json(makeResourcePage(reservedIPs));
      })
    );

    const { getAllByText, getByTestId, queryAllByText } = renderWithTheme(
      <ReservedIpsLanding />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId), {
      timeout: 10000,
    });

    // Table column headers
    getAllByText('IP Address');
    getAllByText('Assigned Resource');
    getAllByText('Region');
    getAllByText('Tags');

    // Check mocked IP addresses rendered in the table
    queryAllByText(reservedIPs[0].address);
  });

  it('renders the "Reserve an IP Address" button', async () => {
    server.use(
      http.get(reservedIPsEndpoint, () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { container, getByTestId } = renderWithTheme(<ReservedIpsLanding />);

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const reserveIPButton = container.querySelector('button');

    expect(reserveIPButton).toBeInTheDocument();
    expect(reserveIPButton).toHaveTextContent('Reserve an IP Address');
  });

  it('renders a row with action menu for each reserved IP', async () => {
    const reservedIPs = reservedIPsFactory.buildList(3, {
      assigned_entity: null,
      reserved: true,
    });

    server.use(
      http.get(reservedIPsEndpoint, () => {
        return HttpResponse.json(makeResourcePage(reservedIPs));
      })
    );

    const { getByLabelText, getByTestId } = renderWithTheme(
      <ReservedIpsLanding />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId), {
      timeout: 10000,
    });

    const actionMenu = getByLabelText(
      `Action menu for Reserved IP ${reservedIPs[0].address}`
    );
    expect(actionMenu).toBeInTheDocument();
  });

  it('opens the action menu with correct options', async () => {
    const reservedIPs = reservedIPsFactory.buildList(1, {
      assigned_entity: null,
      reserved: true,
    });

    server.use(
      http.get(reservedIPsEndpoint, () => {
        return HttpResponse.json(makeResourcePage(reservedIPs));
      })
    );

    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <ReservedIpsLanding />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId), {
      timeout: 10000,
    });

    const actionMenu = getByLabelText(
      `Action menu for Reserved IP ${reservedIPs[0].address}`
    );

    await fireEvent.click(actionMenu);

    getByText('Edit');
    getByText('Unreserve');
  });

  describe('Restricted users', () => {
    it('should have the "Reserve an IP Address" button disabled for restricted users', async () => {
      queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

      server.use(
        http.get(reservedIPsEndpoint, () => {
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { container, getByTestId } = renderWithTheme(
        <ReservedIpsLanding />
      );

      await waitForElementToBeRemoved(getByTestId(loadingTestId));

      const reserveIPButton = container.querySelector('button');

      expect(reserveIPButton).toBeInTheDocument();
      expect(reserveIPButton).toHaveTextContent('Reserve an IP Address');
    });

    it('should have the "Reserve an IP Address" button enabled for users with full access', async () => {
      queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

      server.use(
        http.get(reservedIPsEndpoint, () => {
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { container, getByTestId } = renderWithTheme(
        <ReservedIpsLanding />
      );

      await waitForElementToBeRemoved(getByTestId(loadingTestId));

      const reserveIPButton = container.querySelector('button');

      expect(reserveIPButton).toBeInTheDocument();
      expect(reserveIPButton).toHaveTextContent('Reserve an IP Address');
      expect(reserveIPButton).toBeEnabled();
    });
  });
});
