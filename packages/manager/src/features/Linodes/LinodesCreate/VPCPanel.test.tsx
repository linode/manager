import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { accountFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { VPCPanel, VPCPanelProps } from './VPCPanel';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const props = {
  assignPublicIPv4Address: false,
  autoassignIPv4WithinVPC: true,
  from: 'linodeCreate' as VPCPanelProps['from'],
  handleSelectVPC: jest.fn(),
  handleSubnetChange: jest.fn(),
  handleVPCIPv4Change: jest.fn(),
  region: 'us-east',
  selectedSubnetId: undefined,
  selectedVPCId: undefined,
  toggleAssignPublicIPv4Address: jest.fn(),
  toggleAutoassignIPv4WithinVPCEnabled: jest.fn(),
  vpcIPv4AddressOfLinode: undefined,
};

const vpcPanelTestId = 'vpc-panel';
const subnetAndAdditionalOptionsTestId =
  'subnet-and-additional-options-section';

describe('VPCPanel', () => {
  it('should display the VPC Panel if the user has the VPC account capability', async () => {
    const account = accountFactory.build({
      capabilities: ['VPCs'],
    });

    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(ctx.json(account));
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {...props} />, {
      queryClient,
    });

    await waitFor(() => {
      expect(wrapper.getByTestId(vpcPanelTestId)).toBeInTheDocument();
    });
  });

  it('should display the VPC Panel if the VPC feature flag is on', async () => {
    const wrapper = renderWithTheme(<VPCPanel {...props} />, {
      flags: { vpc: true },
      queryClient,
    });

    await waitFor(() => {
      expect(wrapper.getByTestId(vpcPanelTestId)).toBeInTheDocument();
    });
  });

  it('should not display the VPC Panel if the user does not have the VPC account capability and the VPC feature flag is off', async () => {
    const wrapper = renderWithTheme(<VPCPanel {...props} />, {
      flags: { vpc: false },
      queryClient,
    });

    await waitFor(() => {
      expect(wrapper.queryByTestId(vpcPanelTestId)).not.toBeInTheDocument();
    });
  });

  it('should display the Subnet & other subsequent fields if a VPC has been selected and the selected region supports VPCs', async () => {
    const _props = { ...props, region: 'us-east', selectedVPCId: 5 };

    server.use(
      rest.get('*/regions', (req, res, ctx) => {
        const usEast = regionFactory.build({
          capabilities: ['VPCs'],
          id: 'us-east',
        });
        const regions = regionFactory.buildList(5);
        return res(ctx.json(makeResourcePage([usEast, ...regions])));
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {..._props} />, {
      flags: { vpc: true },
      queryClient,
    });

    await waitFor(() => {
      expect(
        wrapper.getByTestId(subnetAndAdditionalOptionsTestId)
      ).toBeInTheDocument();
    });
  });

  it('should have the VPC IPv4 auto-assign checkbox checked by default', async () => {
    const _props = { ...props, region: 'us-east', selectedVPCId: 5 };

    server.use(
      rest.get('*/regions', (req, res, ctx) => {
        const usEast = regionFactory.build({
          capabilities: ['VPCs'],
          id: 'us-east',
        });
        const regions = regionFactory.buildList(5);
        return res(ctx.json(makeResourcePage([usEast, ...regions])));
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {..._props} />, {
      flags: { vpc: true },
      queryClient,
    });

    await waitFor(() => {
      // the "Auto-assign a VPC IPv4 address for this Linode in the VPC" checkbox is the first one (0 index)
      expect(wrapper.getAllByRole('checkbox')[0]).toBeChecked();
    });
  });
});
