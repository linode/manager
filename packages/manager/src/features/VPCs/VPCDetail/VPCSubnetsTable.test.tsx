import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { subnetFactory } from 'src/factories/subnets';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { VPCSubnetsTable } from './VPCSubnetsTable';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('VPC Subnets table', () => {
  it('should display subnet label, id, ip range, number of linodes, and action menu', () => {
    const subnets = subnetFactory.buildList(Math.floor(Math.random() * 10) + 1);
    const {
      getAllByRole,
      getAllByText,
      getByText,
    } = renderWithTheme(<VPCSubnetsTable subnets={subnets} />, { queryClient });

    getByText('Subnet Label');
    getByText(subnets[0].label);
    getByText('Subnet ID');
    getAllByText(subnets[0].id);

    getByText('Subnet IP Range');
    getAllByText(subnets[0].ipv4!);

    getByText('Linodes');
    getAllByText(subnets[0].linodes.length);

    const actionMenuButton = getAllByRole('button')[1];
    fireEvent.click(actionMenuButton);

    getByText('Assign Linode');
    getByText('Unassign Linode');
    getByText('Edit');
    getByText('Delete');
  });

  it('should display no linodes text if there are no linodes associated with the subnet', () => {
    const subnets = subnetFactory.buildList(
      Math.floor(Math.random() * 10) + 1,
      { linodes: [] }
    );
    const { getAllByRole, getByText } = renderWithTheme(
      <VPCSubnetsTable subnets={subnets} />
    );

    const expandTableButton = getAllByRole('button')[0];
    fireEvent.click(expandTableButton);
    getByText('No Linodes');
  });

  it('should show linode table head data when table is expanded', () => {
    const subnets = subnetFactory.buildList(Math.floor(Math.random() * 10) + 1);
    const { getAllByRole, getByText } = renderWithTheme(
      <VPCSubnetsTable subnets={subnets} />
    );

    const expandTableButton = getAllByRole('button')[0];
    fireEvent.click(expandTableButton);

    getByText('Linode Label');
    getByText('Status');
    getByText('Linode ID');
    getByText('VPC IPv4');
    getByText('Firewalls');
  });
});
