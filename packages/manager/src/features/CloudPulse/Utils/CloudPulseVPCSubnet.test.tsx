import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { subnetFactory, vpcFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseVPCSubnet } from './CloudPulseVPCSubnet';

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

const vpcs = vpcFactory.buildList(2, {
  subnets: subnetFactory.buildList(2),
});

describe('CloudPulseVPCSubnet', () => {
  const component = <CloudPulseVPCSubnet onChange={onChange} />;
  beforeEach(() => {
    vi.resetAllMocks();
    queryMock.useAllVpcsQuery.mockReturnValue({
      isLoading: false,
      data: vpcs,
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
    expect(options).toHaveLength(5);
    expect(options[1]).toHaveTextContent(
      `${vpcs[0].label}_${vpcs[0].subnets[0].label}`
    );
  });

  it('Should click options', async () => {
    renderWithTheme(component);

    const openButton = await screen.findByRole('button', { name: 'Open' });

    await userEvent.click(openButton);

    const options = screen.getAllByRole('option');

    await userEvent.click(options[1]);

    expect(onChange).toHaveBeenCalledWith([vpcs[0].subnets[0].id]);

    // click select all button
    await userEvent.click(options[0]);

    expect(onChange).toHaveBeenCalledWith([
      vpcs[0].subnets[0].id,
      vpcs[0].subnets[1].id,
      vpcs[1].subnets[0].id,
      vpcs[1].subnets[1].id,
    ]);
  });
});
