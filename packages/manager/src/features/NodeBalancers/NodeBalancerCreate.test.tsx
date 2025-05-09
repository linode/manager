import { regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { subnetFactory, vpcFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import NodeBalancerCreate from './NodeBalancerCreate';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

// Note: see nodeblaancers-create-in-complex-form.spec.ts for an e2e test of this flow
describe('NodeBalancerCreate', () => {
  queryMocks.useFlags.mockReturnValue({
    nodebalancerVpc: true,
  });
  it('renders all parts of the NodeBalancerCreate page', () => {
    const { getAllByText, getByLabelText, getByText } = renderWithTheme(
      <NodeBalancerCreate />
    );

    // confirm nodebalancer fields render
    expect(getByLabelText('NodeBalancer Label')).toBeVisible();
    expect(getByLabelText('Add Tags')).toBeVisible();
    expect(getByLabelText('Region')).toBeVisible();

    // confirm Firewall panel renders
    expect(getByLabelText('Assign Firewall')).toBeVisible();
    expect(getByText('Create Firewall')).toBeVisible();
    expect(
      getByText(
        /Assign an existing Firewall to this NodeBalancer to control inbound network traffic./
      )
    ).toBeVisible();

    // confirm VPC Panel renders
    expect(getByLabelText('Assign VPC')).toBeVisible();

    // confirm default configuration renders - only confirming headers, as we have additional
    // unit tests to check the functionality of the NodeBalancerConfigPanel
    expect(getByText('Configuration - Port 80')).toBeVisible();
    expect(getByText('Active Health Checks')).toBeVisible();
    expect(getAllByText('Passive Checks')).toHaveLength(2);
    expect(getByText('Backend Nodes')).toBeVisible();

    // confirm summary renders
    expect(getByText('Summary')).toBeVisible();
    expect(getByText('Configs')).toBeVisible();
    expect(getByText('Nodes')).toBeVisible();
    expect(getByText('Create NodeBalancer')).toBeVisible();
  });

  describe('VPC Section', () => {
    it('render no options for the VPC select if no region is selected', async () => {
      renderWithTheme(<NodeBalancerCreate />);

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
        http.get(`*/v4/regions`, () => {
          return HttpResponse.json(makeResourcePage([region]));
        })
      );

      renderWithTheme(<NodeBalancerCreate />);
      const regionSelect = screen.getByPlaceholderText('Select a Region');

      // Open the Region Select
      await userEvent.click(regionSelect);

      await userEvent.click(
        await screen.findByText(region.id, { exact: false })
      );

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

      const subnets = subnetFactory.buildList(3);

      const vpcWithSubnet = vpcFactory.build({
        subnets,
        region: 'us-east',
      });

      server.use(
        http.get(`*/v4/regions`, () => {
          return HttpResponse.json(makeResourcePage([region]));
        })
      );
      server.use(
        http.get('*/vpcs', () => {
          return HttpResponse.json(makeResourcePage([vpcWithSubnet]));
        })
      );

      renderWithTheme(<NodeBalancerCreate />);
      const regionSelect = screen.getByPlaceholderText('Select a Region');

      await userEvent.click(regionSelect);

      await userEvent.click(
        await screen.findByText(region.id, { exact: false })
      );

      const vpcSelect = screen.getByLabelText('Assign VPC');

      await userEvent.click(vpcSelect);

      await userEvent.click(
        await screen.findByText(vpcWithSubnet.label, { exact: false })
      );

      expect(screen.getByLabelText('Subnet')).toBeVisible();
    });

    it('does not renders VPC IPv4 Select when a subnet is not selected', async () => {
      const region = regionFactory.build({
        capabilities: ['NodeBalancers', 'VPCs'],
        id: 'us-east',
        label: 'Newark, NJ',
      });

      const subnets = subnetFactory.buildList(3);

      const vpcWithSubnet = vpcFactory.build({
        subnets,
        region: 'us-east',
      });

      server.use(
        http.get(`*/v4/regions`, () => {
          return HttpResponse.json(makeResourcePage([region]));
        })
      );
      server.use(
        http.get('*/vpcs', () => {
          return HttpResponse.json(makeResourcePage([vpcWithSubnet]));
        })
      );

      renderWithTheme(<NodeBalancerCreate />);
      const regionSelect = screen.getByPlaceholderText('Select a Region');

      await userEvent.click(regionSelect);

      await userEvent.click(
        await screen.findByText(region.id, { exact: false })
      );

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

    it('renders VPC IPv4 Select when a subnet is selected', async () => {
      const region = regionFactory.build({
        capabilities: ['NodeBalancers', 'VPCs'],
        id: 'us-east',
        label: 'Newark, NJ',
      });

      const subnets = subnetFactory.buildList(3);

      const vpcWithSubnet = vpcFactory.build({
        subnets,
        region: 'us-east',
      });

      server.use(
        http.get(`*/v4/regions`, () => {
          return HttpResponse.json(makeResourcePage([region]));
        })
      );
      server.use(
        http.get('*/vpcs', () => {
          return HttpResponse.json(makeResourcePage([vpcWithSubnet]));
        })
      );

      renderWithTheme(<NodeBalancerCreate />);
      const regionSelect = screen.getByPlaceholderText('Select a Region');

      await userEvent.click(regionSelect);

      await userEvent.click(
        await screen.findByText(region.id, { exact: false })
      );

      const vpcSelect = screen.getByLabelText('Assign VPC');

      await userEvent.click(vpcSelect);

      await userEvent.click(
        await screen.findByText(vpcWithSubnet.label, { exact: false })
      );

      const subnetSelect = screen.getByLabelText('Subnet');
      await userEvent.click(subnetSelect);

      await userEvent.click(
        await screen.findByText(subnets[0].label, { exact: false })
      );
      expect(
        screen.getByLabelText(
          `NodeBalancer IPv4 CIDR for ${subnets[0].label}`,
          {
            exact: false,
          }
        )
      ).toBeVisible();
    });
  });
});
