import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { firewallSettingsFactory } from 'src/factories';
import {
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories/subnets';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import { VPCSubnetsTable } from './VPCSubnetsTable';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useSearch: vi.fn().mockReturnValue({ query: undefined }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: queryMocks.useSearch,
  };
});

describe('VPC Subnets table', () => {
  it('should display filter input, subnet label, id, ip range, number of linodes, and action menu', async () => {
    const subnet = subnetFactory.build({
      linodes: [
        subnetAssignedLinodeDataFactory.build({ id: 1 }),
        subnetAssignedLinodeDataFactory.build({ id: 2 }),
        subnetAssignedLinodeDataFactory.build({ id: 3 }),
      ],
    });
    server.use(
      http.get('*/vpcs/:vpcId/subnets', () => {
        return HttpResponse.json(makeResourcePage([subnet]));
      }),
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettingsFactory.build());
      })
    );

    const {
      getAllByRole,
      getAllByText,
      getByPlaceholderText,
      getByText,
      queryByTestId,
    } = await renderWithThemeAndRouter(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={1}
        vpcRegion=""
      />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    getByPlaceholderText('Filter Subnets by label or id');
    getByText('Subnet Label');
    getByText(subnet.label);
    getByText('Subnet ID');
    getAllByText(subnet.id);

    getByText('Subnet IP Range');
    getByText(subnet.ipv4!);

    getByText('Resources');
    getByText(subnet.linodes.length + subnet.nodebalancers.length);

    const actionMenuButton = getAllByRole('button')[4];
    await userEvent.click(actionMenuButton);

    getByText('Assign Linodes');
    getByText('Unassign Linodes');
    getByText('Edit');
    getByText('Delete');
  });

  it('should display no linodes text if there are no linodes associated with the subnet', async () => {
    const subnet = subnetFactory.build({ linodes: [] });
    server.use(
      http.get('*/vpcs/:vpcId/subnets', () => {
        return HttpResponse.json(makeResourcePage([subnet]));
      }),
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettingsFactory.build());
      })
    );

    const { getAllByRole, getByText, queryByTestId } =
      await renderWithThemeAndRouter(
        <VPCSubnetsTable
          isVPCLKEEnterpriseCluster={false}
          vpcId={2}
          vpcRegion=""
        />
      );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const expandTableButton = getAllByRole('button')[3];
    await userEvent.click(expandTableButton);
    getByText('No Linodes');
  });

  it('should show linode table head data when table is expanded', async () => {
    const subnet = subnetFactory.build({
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 1 })],
    });
    server.use(
      http.get('*/vpcs/:vpcId/subnets', () => {
        return HttpResponse.json(makeResourcePage([subnet]));
      }),
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettingsFactory.build());
      })
    );
    const { getAllByRole, getByText, queryByTestId } =
      await renderWithThemeAndRouter(
        <VPCSubnetsTable
          isVPCLKEEnterpriseCluster={false}
          vpcId={3}
          vpcRegion=""
        />
      );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const expandTableButton = getAllByRole('button')[3];
    await userEvent.click(expandTableButton);

    getByText('Linode Label');
    getByText('Status');
    getByText('VPC IPv4');
    getByText('Firewalls');
  });

  it('should display no nodeBalancers text if there are no nodeBalancers associated with the subnet', async () => {
    const subnet = subnetFactory.build();

    server.use(
      http.get('*/vpcs/:vpcId/subnets', () => {
        return HttpResponse.json(makeResourcePage([subnet]));
      }),
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettingsFactory.build());
      })
    );

    const { getAllByRole, getByText, queryByTestId } =
      await renderWithThemeAndRouter(
        <VPCSubnetsTable
          isVPCLKEEnterpriseCluster={false}
          vpcId={2}
          vpcRegion=""
        />,
        { flags: { nodebalancerVpc: true } }
      );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const expandTableButton = getAllByRole('button')[3];
    await userEvent.click(expandTableButton);
    getByText('No NodeBalancers');
  });

  it('should show Nodebalancer table head data when table is expanded', async () => {
    const subnet = subnetFactory.build();
    server.use(
      http.get('*/vpcs/:vpcId/subnets', () => {
        return HttpResponse.json(makeResourcePage([subnet]));
      }),
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettingsFactory.build());
      })
    );
    const { getAllByRole, getByText, queryByTestId } =
      await renderWithThemeAndRouter(
        <VPCSubnetsTable
          isVPCLKEEnterpriseCluster={false}
          vpcId={3}
          vpcRegion=""
        />,
        { flags: { nodebalancerVpc: true } }
      );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const expandTableButton = getAllByRole('button')[3];
    await userEvent.click(expandTableButton);

    getByText('NodeBalancer');
    getByText('Backend Status');
    getByText('VPC IPv4 Range');
  });

  it('should disable Create Subnet button if the VPC is associated with a LKE-E cluster', async () => {
    server.use(
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettingsFactory.build());
      })
    );
    const { getByRole, queryByTestId } = await renderWithThemeAndRouter(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={true}
        vpcId={3}
        vpcRegion=""
      />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    const createButton = getByRole('button', {
      name: 'Create Subnet',
    });
    expect(createButton).toBeDisabled();
  });
});
