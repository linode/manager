import { fireEvent } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import {
  subnetAssignedLinodeDataFactory,
  subnetFactory,
} from 'src/factories/subnets';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { VPCSubnetsTable } from './VPCSubnetsTable';

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';

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
      })
    );

    const {
      getAllByRole,
      getAllByText,
      getByPlaceholderText,
      getByTestId,
      getByText,
    } = renderWithTheme(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={1}
        vpcRegion=""
      />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByPlaceholderText('Filter Subnets by label or id');
    getByText('Subnet Label');
    getByText(subnet.label);
    getByText('Subnet ID');
    getAllByText(subnet.id);

    getByText('Subnet IP Range');
    getByText(subnet.ipv4!);

    getByText('Linodes');
    getByText(subnet.linodes.length);

    const actionMenuButton = getAllByRole('button')[4];
    fireEvent.click(actionMenuButton);

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
      })
    );

    const { getAllByRole, getByTestId, getByText } = renderWithTheme(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={2}
        vpcRegion=""
      />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const expandTableButton = getAllByRole('button')[3];
    fireEvent.click(expandTableButton);
    getByText('No Linodes');
  });

  it('should show linode table head data when table is expanded', async () => {
    const subnet = subnetFactory.build({
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 1 })],
    });
    server.use(
      http.get('*/vpcs/:vpcId/subnets', () => {
        return HttpResponse.json(makeResourcePage([subnet]));
      })
    );
    const { getAllByRole, getByTestId, getByText } = renderWithTheme(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={false}
        vpcId={3}
        vpcRegion=""
      />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const expandTableButton = getAllByRole('button')[3];
    fireEvent.click(expandTableButton);

    getByText('Linode Label');
    getByText('Status');
    getByText('VPC IPv4');
    getByText('Firewalls');
  });

  it('should disable Create Subnet button if the VPC is associated with a LKE-E cluster', async () => {
    const { getByRole, getByTestId } = renderWithTheme(
      <VPCSubnetsTable
        isVPCLKEEnterpriseCluster={true}
        vpcId={3}
        vpcRegion=""
      />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const createButton = getByRole('button', {
      name: 'Create Subnet',
    });
    expect(createButton).toBeDisabled();
  });
});
