import { fireEvent } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { subnetFactory } from 'src/factories/subnets';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { VPCSubnetsTable } from './VPCSubnetsTable';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'circle-progress';

describe('VPC Subnets table', () => {
  it('should display filter input, subnet label, id, ip range, number of linodes, and action menu', async () => {
    const subnet = subnetFactory.build({ linodes: [1, 2, 3] });
    server.use(
      rest.get('*/vpcs/:vpcId/subnets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([subnet])));
      })
    );

    const {
      getAllByRole,
      getAllByText,
      getByPlaceholderText,
      getByTestId,
      getByText,
    } = renderWithTheme(<VPCSubnetsTable vpcId={1} />, { queryClient });

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

    const actionMenuButton = getAllByRole('button')[3];
    fireEvent.click(actionMenuButton);

    getByText('Assign Linode');
    getByText('Unassign Linode');
    getByText('Edit');
    getByText('Delete');
  });

  it('should display no linodes text if there are no linodes associated with the subnet', async () => {
    const subnet = subnetFactory.build({ linodes: [] });
    server.use(
      rest.get('*/vpcs/:vpcId/subnets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([subnet])));
      })
    );

    const { getAllByRole, getByTestId, getByText } = renderWithTheme(
      <VPCSubnetsTable vpcId={2} />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const expandTableButton = getAllByRole('button')[2];
    fireEvent.click(expandTableButton);
    getByText('No Linodes');
  });

  it('should show linode table head data when table is expanded', async () => {
    const subnet = subnetFactory.build({ linodes: [1] });
    server.use(
      rest.get('*/vpcs/:vpcId/subnets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([subnet])));
      })
    );
    const { getAllByRole, getByTestId, getByText } = renderWithTheme(
      <VPCSubnetsTable vpcId={3} />
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const expandTableButton = getAllByRole('button')[2];
    fireEvent.click(expandTableButton);

    getByText('Linode Label');
    getByText('Status');
    getByText('Linode ID');
    getByText('VPC IPv4');
    getByText('Firewalls');
  });
});
