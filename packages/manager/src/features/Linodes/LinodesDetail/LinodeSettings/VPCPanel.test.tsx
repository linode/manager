import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { VPCPanel } from './VPCPanel';

beforeAll(() => mockMatchMedia());

const props = {
  additionalIPv4RangesForVPC: [],
  assignPublicIPv4Address: false,
  autoassignIPv4WithinVPC: true,
  handleIPv4RangeChange: vi.fn(),
  handleSelectVPC: vi.fn(),
  handleSubnetChange: vi.fn(),
  handleVPCIPv4Change: vi.fn(),
  region: 'us-east',
  selectedSubnetId: undefined,
  selectedVPCId: undefined,
  toggleAssignPublicIPv4Address: vi.fn(),
  toggleAutoassignIPv4WithinVPCEnabled: vi.fn(),
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
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {...props} />);

    await waitFor(() => {
      expect(wrapper.getByTestId(vpcPanelTestId)).toBeInTheDocument();
    });
  });

  it('should display the Subnet & other subsequent fields if a VPC has been selected and the selected region supports VPCs', async () => {
    const _props = { ...props, region: 'us-east', selectedVPCId: 5 };

    server.use(
      http.get('*/regions', () => {
        const usEast = regionFactory.build({
          capabilities: ['VPCs'],
          id: 'us-east',
        });
        const regions = regionFactory.buildList(5);
        return HttpResponse.json(makeResourcePage([usEast, ...regions]));
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {..._props} />);

    await waitFor(() => {
      expect(
        wrapper.getByTestId(subnetAndAdditionalOptionsTestId)
      ).toBeInTheDocument();
    });
  });

  it('should have the VPC IPv4 auto-assign checkbox checked by default', async () => {
    const _props = {
      ...props,
      region: 'us-east',
      selectedSubnetId: 2,
      selectedVPCId: 5,
    };

    server.use(
      http.get('*/regions', () => {
        const usEast = regionFactory.build({
          capabilities: ['VPCs'],
          id: 'us-east',
        });
        const regions = regionFactory.buildList(5);
        return HttpResponse.json(makeResourcePage([usEast, ...regions]));
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {..._props} />);

    await waitFor(() => {
      // the "Auto-assign a VPC IPv4 address for this Linode in the VPC" checkbox is the first one (0 index)
      expect(wrapper.getAllByRole('checkbox')[0]).toBeChecked();
    });
  });

  it('should not display helper text if there are no vpcs in the selected region', async () => {
    server.use(
      http.get('*/regions', () => {
        const usEast = regionFactory.build({
          capabilities: ['VPCs'],
          id: 'us-east',
        });
        return HttpResponse.json(makeResourcePage([usEast]));
      }),
      http.get('*/vpcs', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {...props} />);

    await waitFor(() => {
      expect(
        wrapper.queryByText(
          'No VPCs exist in the selected region. Click Create VPC to create one.'
        )
      ).not.toBeInTheDocument();
    });
  });
  it('should display an unchecked VPC IPv4 auto-assign checkbox and display the VPC IPv4 input field if there is already a value', async () => {
    const _props = {
      ...props,
      autoassignIPv4WithinVPC: false,
      region: 'us-east',
      selectedSubnetId: 2,
      selectedVPCId: 5,
      vpcIPv4AddressOfLinode: '10.0.4.3',
    };

    server.use(
      http.get('*/regions', () => {
        const usEast = regionFactory.build({
          capabilities: ['VPCs'],
          id: 'us-east',
        });
        const regions = regionFactory.buildList(5);
        return HttpResponse.json(makeResourcePage([usEast, ...regions]));
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {..._props} />);

    await waitFor(() => {
      expect(
        wrapper.getByLabelText(
          'Auto-assign a VPC IPv4 address for this Linode in the VPC'
        )
      ).not.toBeChecked();
      // Using regex here to account for the "(required)" indicator.
      expect(wrapper.getByLabelText(/^VPC IPv4.*/)).toHaveValue('10.0.4.3');
    });
  });
  it('should check the Assign a public IPv4 address checkbox if assignPublicIPv4Address is true', async () => {
    const _props = {
      ...props,
      assignPublicIPv4Address: true,
      region: 'us-east',
      selectedSubnetId: 2,
      selectedVPCId: 5,
    };

    server.use(
      http.get('*/regions', () => {
        const usEast = regionFactory.build({
          capabilities: ['VPCs'],
          id: 'us-east',
        });
        const regions = regionFactory.buildList(5);
        return HttpResponse.json(makeResourcePage([usEast, ...regions]));
      })
    );

    const wrapper = renderWithTheme(<VPCPanel {..._props} />);

    await waitFor(() => {
      expect(
        wrapper.getByLabelText('Assign a public IPv4 address for this Linode')
      ).toBeChecked();
    });
  });
});
