import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { subnetFactory, vpcFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseVPCSubnetSelect } from './CloudPulseVPCSubnetSelect';

const queryMock = vi.hoisted(() => ({
  useAllVpcsQuery: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllVPCsQuery: queryMock.useAllVpcsQuery,
  };
});

const onChange = vi.fn();

const vpcs = vpcFactory.build({
  subnets: subnetFactory.buildList(2),
});

describe('CloudPulseVPCSubnet', () => {
  const component = <CloudPulseVPCSubnetSelect multiple onChange={onChange} />;
  beforeEach(() => {
    vi.resetAllMocks();
    queryMock.useAllVpcsQuery.mockReturnValue({
      isLoading: false,
      data: [vpcs],
    });
  });
  it('should render vpc subnet filter', () => {
    renderWithTheme(component);

    const filter = screen.getByTestId('vpc-subnet-filter');

    expect(filter).toBeInTheDocument();
  });

  it('Should render vpc subnet options', async () => {
    renderWithTheme(component);

    const openButton = await screen.findByRole('button', { name: 'Open' });

    await userEvent.click(openButton);

    const options = screen.getAllByRole('option');

    // options[0] is Select All button
    expect(options).toHaveLength(3);
    expect(options[1]).toHaveTextContent(
      `${vpcs.label}_${vpcs.subnets[0].label}`
    );
  });

  it('Should click options', async () => {
    renderWithTheme(component);

    const openButton = await screen.findByRole('button', { name: 'Open' });

    await userEvent.click(openButton);

    const options = screen.getAllByRole('option');

    await userEvent.click(options[1]);

    expect(onChange).toHaveBeenCalledWith([vpcs.subnets[0].id]);

    // click select all button
    await userEvent.click(options[0]);

    expect(onChange).toHaveBeenCalledWith([
      vpcs.subnets[0].id,
      vpcs.subnets[1].id,
    ]);
  });
});
