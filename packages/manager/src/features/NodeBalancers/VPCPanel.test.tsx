import { regionFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { subnetFactory, vpcFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { VPCPanel } from './VPCPanel';

beforeAll(() => mockMatchMedia());

const props = {
  errors: [],
  ipv4Change: vi.fn(),
  regionSelected: '',
  subnetChange: vi.fn(),
  setVpcSelected: vi.fn(),
  vpcSelected: null,
};

describe('VPCPanel', () => {
  it('should render no options for the VPC select if no region is selected', async () => {
    renderWithTheme(<VPCPanel {...props} />);

    const vpcSelect = screen.getByLabelText('Assign VPC');

    expect(vpcSelect).toBeVisible();
    await userEvent.click(vpcSelect);

    await screen.findByText('Select a region to see available VPCs.', {
      exact: false,
    });
  });

  it('should render a warning if the selected region does not support VPC', async () => {
    const region = regionFactory.build({
      capabilities: ['NodeBalancers'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    server.use(
      http.get(`*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const _props = {
      ...props,
      regionSelected: region.id,
    };
    renderWithTheme(<VPCPanel {..._props} />);

    await screen.findByText('VPC is not available in the selected region.', {
      exact: false,
    });
  });

  it('should render a subnet select if a VPC is selected', async () => {
    const region = regionFactory.build({
      capabilities: ['NodeBalancers', 'VPCs'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    const subnets = subnetFactory.buildList(3, { ipv4: '10.0.0.0/24' });

    const vpcWithSubnet = vpcFactory.build({
      subnets,
      region: 'us-east',
    });

    server.use(
      http.get(`*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const _props = {
      ...props,
      regionSelected: region.id,
      vpcSelected: vpcWithSubnet,
    };

    renderWithTheme(<VPCPanel {..._props} />);

    const vpcSelect = screen.getByLabelText('Assign VPC');
    expect(vpcSelect).toHaveValue(vpcWithSubnet.label);

    expect(screen.getByLabelText('Subnet')).toBeVisible();
  });

  it('should auto select a subnet if a VPC has only 1 subnet', async () => {
    const region = regionFactory.build({
      capabilities: ['NodeBalancers', 'VPCs'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    const subnets = subnetFactory.buildList(1, { ipv4: '10.0.0.0/24' });

    const vpcWithSubnet = vpcFactory.build({
      subnets,
      region: 'us-east',
    });

    server.use(
      http.get(`*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const subnetsSelected = [
      {
        subnet_id: subnets[0].id,
      },
    ];

    const _props = {
      ...props,
      regionSelected: region.id,
      vpcSelected: vpcWithSubnet,
      subnetsSelected,
    };

    renderWithTheme(<VPCPanel {..._props} />);

    const vpcSelect = screen.getByLabelText('Assign VPC');
    expect(vpcSelect).toHaveValue(vpcWithSubnet.label);

    const subnetSelect = screen.getByLabelText('Subnet');
    expect(subnetSelect).toHaveValue(
      `${subnets[0].label} (${subnets[0].ipv4})`
    );
  });

  it('should render the VPC IPv4 auto-assign checkbox checked by default', async () => {
    const region = regionFactory.build({
      capabilities: ['NodeBalancers', 'VPCs'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    const subnets = subnetFactory.buildList(1, { ipv4: '10.0.0.0/24' });

    const vpcWithSubnet = vpcFactory.build({
      subnets,
      region: 'us-east',
    });

    server.use(
      http.get(`*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const subnetsSelected = [
      {
        subnet_id: subnets[0].id,
      },
    ];

    const _props = {
      ...props,
      regionSelected: region.id,
      vpcSelected: vpcWithSubnet,
      subnetsSelected,
    };

    renderWithTheme(<VPCPanel {..._props} />);

    const vpcSelect = screen.getByLabelText('Assign VPC');
    expect(vpcSelect).toHaveValue(vpcWithSubnet.label);

    const subnetSelect = screen.getByLabelText('Subnet');
    expect(subnetSelect).toHaveValue(
      `${subnets[0].label} (${subnets[0].ipv4})`
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          'Auto-assign a /30 CIDR in each subnet for this NodeBalancer'
        )
      ).toBeChecked();
    });
  });

  it('should render an unchecked VPC IPv4 auto-assign checkbox and display VPC IPv4 Select when a subnet is selected', async () => {
    const region = regionFactory.build({
      capabilities: ['NodeBalancers', 'VPCs'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    const subnets = subnetFactory.buildList(3, { ipv4: '10.0.0.0/24' });

    const vpcWithSubnet = vpcFactory.build({
      subnets,
      region: 'us-east',
    });

    server.use(
      http.get(`*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const subnetsSelected = [
      {
        subnet_id: subnets[0].id,
        ipv4_range: '',
      },
    ];

    const _props = {
      ...props,
      regionSelected: region.id,
      subnetsSelected,
      vpcSelected: vpcWithSubnet,
    };

    renderWithTheme(<VPCPanel {..._props} />);

    const vpcSelect = screen.getByLabelText('Assign VPC');
    expect(vpcSelect).toHaveValue(vpcWithSubnet.label);

    const subnetSelect = screen.getByLabelText('Subnet');
    expect(subnetSelect).toHaveValue(
      `${subnets[0].label} (${subnets[0].ipv4})`
    );

    const checkbox = screen.getByLabelText(
      'Auto-assign a /30 CIDR in each subnet for this NodeBalancer'
    );

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();

    expect(
      screen.getByLabelText(`${subnets[0].label}`, {
        exact: false,
      })
    ).toBeVisible();

    expect(
      screen.getByLabelText(`NodeBalancer IPv4 CIDR for ${subnets[0].label}`, {
        exact: false,
      })
    ).toBeVisible();
  });

  it('should not render VPC IPv4 Select when a subnet is not selected', async () => {
    const region = regionFactory.build({
      capabilities: ['NodeBalancers', 'VPCs'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    const subnets = subnetFactory.buildList(3, { ipv4: '10.0.0.0/24' });

    const vpcWithSubnet = vpcFactory.build({
      subnets,
      region: 'us-east',
    });

    server.use(
      http.get(`*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const _props = {
      ...props,
      regionSelected: region.id,
      vpcSelected: vpcWithSubnet,
    };

    renderWithTheme(<VPCPanel {..._props} />);

    const vpcSelect = screen.getByLabelText('Assign VPC');
    expect(vpcSelect).toHaveValue(vpcWithSubnet.label);

    const subnetSelect = screen.getByLabelText('Subnet');

    expect(subnetSelect).toHaveValue('');

    expect(
      screen.queryByLabelText(
        `NodeBalancer IPv4 CIDR for ${subnets[0].label}`,
        {
          exact: false,
        }
      )
    ).not.toBeInTheDocument();
  });
});
