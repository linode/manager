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
  jest.clearAllMocks();
});

const loadingTestId = 'circle-progress';

const propsDelete = {
  handleDelete: jest.fn(),
};

describe('VPC Subnets table', () => {
  it('should display subnet label, id, ip range, number of linodes, and action menu', async () => {
    const subnet = subnetFactory.build({ linodes: [1, 2, 3] });
    server.use(
      rest.get('*/vpcs/:vpcId/subnets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([subnet])));
      })
    );

    const {
      getAllByRole,
      getAllByText,
      getByTestId,
      getByText,
    } = renderWithTheme(
      <VPCSubnetsTable handleDelete={propsDelete.handleDelete} vpcId={1} />,
      { queryClient }
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

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
      <VPCSubnetsTable handleDelete={propsDelete.handleDelete} vpcId={2} />
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
      <VPCSubnetsTable handleDelete={propsDelete.handleDelete} vpcId={3} />
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

  it('should not allow the subnet delete action menu button to be clicked if there are linodes associated with subnet', async () => {
    const subnet = subnetFactory.build({ linodes: [1, 2, 3] });
    server.use(
      rest.get('*/vpcs/:vpcId/subnets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([subnet])));
      })
    );

    const {
      getAllByRole,
      getByTestId,
      getByText,
    } = renderWithTheme(
      <VPCSubnetsTable handleDelete={propsDelete.handleDelete} vpcId={1} />,
      { queryClient }
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const actionMenuButton = getAllByRole('button')[3];
    fireEvent.click(actionMenuButton);
    const deleteButton = getByText('Delete');
    fireEvent.click(deleteButton);
    expect(propsDelete.handleDelete).not.toHaveBeenCalled();
  });

  it('should allow the subnet delete action menu button to be clicked if there are no linodes associated with subnet', async () => {
    const subnet = subnetFactory.build({
      id: 99,
      label: 'delete this',
      linodes: [],
    });
    server.use(
      rest.get('*/vpcs/:vpcId/subnets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([subnet])));
      })
    );

    const screen = renderWithTheme(
      <VPCSubnetsTable handleDelete={propsDelete.handleDelete} vpcId={1} />,
      { queryClient }
    );

    await waitForElementToBeRemoved(screen.getByTestId(loadingTestId));

    const actionMenuButton = screen.getAllByRole('button')[3];
    fireEvent.click(actionMenuButton);
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(propsDelete.handleDelete).toHaveBeenCalledWith(99, 'delete this');
  });
});
