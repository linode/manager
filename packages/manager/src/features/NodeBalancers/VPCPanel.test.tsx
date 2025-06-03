import { regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { subnetFactory, vpcFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { VPCPanel } from './VPCPanel';

beforeAll(() => mockMatchMedia());

const props = {
  errors: [],
  ipv4Change: vi.fn(),
  regionSelected: '',
  subnetChange: vi.fn(),
  setIsVpcSelected: vi.fn(),
};

describe('VPCPanel', () => {
  it('render no options for the VPC select if no region is selected', async () => {
    renderWithTheme(<VPCPanel {...props} />);

    const vpcSelect = screen.getByLabelText('Assign VPC');

    expect(vpcSelect).toBeVisible();
    await userEvent.click(vpcSelect);

    await screen.findByText('Select a region to see available VPCs.', {
      exact: false,
    });
  });

  it('renders a warning if the selected region does not support VPC', async () => {
    const region = regionFactory.build({
      capabilities: ['NodeBalancers'],
      id: 'us-east',
      label: 'Newark, NJ',
    });

    server.use(
      http.get('*/vpcs', () => {
        return HttpResponse.json(makeResourcePage([]));
      }),
      http.get(`*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const _props = { ...props, regionSelected: region.id };
    renderWithTheme(<VPCPanel {..._props} />);

    await screen.findByText('VPC is not available in the selected region.', {
      exact: false,
    });
  });

  it('renders a subnet select if a VPC is selected', async () => {
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
      http.get('*/vpcs', () => {
        return HttpResponse.json(makeResourcePage([vpcWithSubnet]));
      }),
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

    await userEvent.click(vpcSelect);

    await userEvent.click(
      await screen.findByText(vpcWithSubnet.label, { exact: false })
    );
    expect(screen.getByLabelText('Subnet')).toBeVisible();
  });

  it('renders VPC IPv4 Select when a subnet is selected', async () => {
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
      http.get('*/vpcs', () => {
        return HttpResponse.json(makeResourcePage([vpcWithSubnet]));
      }),
      http.get(`*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const subnetsProp = [
      {
        subnet_id: subnets[0].id,
        ipv4_range: '',
      },
    ];

    const _props = {
      ...props,
      regionSelected: region.id,
      subnets: subnetsProp,
      vpcSelected: vpcWithSubnet,
    };

    renderWithTheme(<VPCPanel {..._props} />);

    const vpcSelect = screen.getByLabelText('Assign VPC');

    await userEvent.click(vpcSelect);

    await userEvent.click(
      await screen.findByText(vpcWithSubnet.label, { exact: false })
    );

    const checkbox = screen.getByTestId('vpc-ipv4-checkbox');

    await userEvent.click(checkbox);

    expect(
      screen.getByLabelText(
        'Auto-assign a /30 CIDR in each subnet for this NodeBalancer'
      )
    ).not.toBeChecked();

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

  it('does not renders VPC IPv4 Select when a subnet is not selected', async () => {
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
      http.get('*/vpcs', () => {
        return HttpResponse.json(makeResourcePage([vpcWithSubnet]));
      }),
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

    await userEvent.click(vpcSelect);

    await userEvent.click(
      await screen.findByText(vpcWithSubnet.label, { exact: false })
    );

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
