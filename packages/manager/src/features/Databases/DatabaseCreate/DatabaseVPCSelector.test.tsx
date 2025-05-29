import { regionFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { subnetFactory, vpcFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseVPCSelector } from './DatabaseVPCSelector';

import type { PrivateNetwork } from '@linode/api-v4';

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useRegionQuery: vi.fn().mockReturnValue({ data: {} }),
  useAllVPCsQuery: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useRegionQuery: queryMocks.useRegionQuery,
    useAllVPCsQuery: queryMocks.useAllVPCsQuery,
  };
});

const mockIpv4 = '10.0.0.0/24';

const mockRegion = regionFactory.build({
  capabilities: ['VPCs'],
  id: 'us-east',
  label: 'Newark, NJ',
});

const mockSubnets = subnetFactory.buildList(1, {
  ipv4: mockIpv4,
  id: 123,
  label: 'Subnet 1',
});

const mockVPCWithSubnet = vpcFactory.build({
  id: 1234,
  label: 'VPC 1',
  region: 'us-east',
  subnets: mockSubnets,
});

const setUpBaseMocks = () => {
  queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
  queryMocks.useAllVPCsQuery.mockReturnValue({
    data: [mockVPCWithSubnet],
    isLoading: false,
  });
};

describe('DatabaseVPCSelector', () => {
  const mockProps = {
    errors: {},
    onChange: vi.fn(),
    onConfigurationChange: vi.fn(),
    privateNetworkValues: {
      vpc_id: null,
      subnet_id: null,
      public_access: false,
    },
    resetFormFields: vi.fn(),
    selectedRegionId: '',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useRegionQuery.mockReturnValue({
      data: null,
    });

    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  it('Should render the VPC selector heading', () => {
    const { getByText } = renderWithTheme(
      <DatabaseVPCSelector {...mockProps} />
    );
    expect(getByText('Assign a VPC', { exact: true })).toBeInTheDocument();
  });

  it('Should render VPC autocomplete in initial disabled state', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseVPCSelector {...mockProps} />
    );
    const vpcSelector = getByTestId('database-vpc-selector');
    expect(vpcSelector).toBeInTheDocument();
    expect(vpcSelector.querySelector('input')).toBeDisabled();
    expect(
      getByText(
        'In the Select Engine and Region section, select a region with an existing VPC to see available VPCs.',
        { exact: true }
      )
    ).toBeInTheDocument();
  });

  it('Should enable VPC autocomplete when VPCs are available', () => {
    const subnets = subnetFactory.buildList(3, { ipv4: mockIpv4 });

    const vpcWithSubnet = vpcFactory.build({
      subnets,
      region: 'us-east',
    });

    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });

    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [vpcWithSubnet],
      isLoading: false,
    });

    const mockEnabledProps = { ...mockProps, selectedRegionId: 'us-east' };
    const { getByTestId } = renderWithTheme(
      <DatabaseVPCSelector {...mockEnabledProps} />
    );

    const vpcSelector = getByTestId('database-vpc-selector');
    expect(vpcSelector).toBeInTheDocument();
    expect(vpcSelector.querySelector('input')).toBeEnabled();
  });

  it('Should enable Subnet autocomplete when VPC is selected', async () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });

    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [mockVPCWithSubnet],
      isLoading: false,
    });

    const mockPrivateNetwork: PrivateNetwork = {
      vpc_id: 1234,
      subnet_id: null,
      public_access: false,
    };

    const mockEnabledProps = {
      ...mockProps,
      privateNetworkValues: mockPrivateNetwork,
      selectedRegionId: 'us-east',
    };
    const { getByTestId } = renderWithTheme(
      <DatabaseVPCSelector {...mockEnabledProps} />
    );

    const vpcSelector = getByTestId('database-vpc-selector');
    const vpcSelectorInput = vpcSelector.querySelector(
      'input'
    ) as HTMLInputElement;
    expect(vpcSelectorInput?.value).toBe(mockVPCWithSubnet.label);
    const subnetSelector = getByTestId('database-subnet-selector');
    expect(subnetSelector).toBeInTheDocument();
    expect(subnetSelector.querySelector('input')).toBeEnabled();
  });

  it('Should set fields for VPC, Subnet, and Public Access based on privateNetworkValues values', async () => {
    queryMocks.useRegionQuery.mockReturnValue({
      data: mockRegion,
    });

    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [mockVPCWithSubnet],
      isLoading: false,
    });

    const mockPrivateNetwork: PrivateNetwork = {
      vpc_id: 1234,
      subnet_id: 123,
      public_access: true,
    };

    const mockEnabledProps = {
      ...mockProps,
      privateNetworkValues: mockPrivateNetwork,
      selectedRegionId: 'us-east',
    };
    const { getByTestId } = renderWithTheme(
      <DatabaseVPCSelector {...mockEnabledProps} />
    );

    const vpcSelector = getByTestId('database-vpc-selector');
    const vpcSelectorInput = vpcSelector.querySelector(
      'input'
    ) as HTMLInputElement;
    const subnetSelector = getByTestId('database-subnet-selector');
    const expectedSubnetValue = `${mockSubnets[0].label} (${mockSubnets[0].ipv4})`;
    const publicAccessCheckbox = getByTestId('database-public-access-checkbox');

    expect(vpcSelectorInput?.value).toBe(mockVPCWithSubnet.label);
    expect(subnetSelector).toBeInTheDocument();
    expect(subnetSelector.querySelector('input')?.value).toBe(
      expectedSubnetValue
    );
    expect(publicAccessCheckbox).toBeInTheDocument();
    expect(publicAccessCheckbox.querySelector('input')).toBeChecked();
  });

  it('Should clear VPC and subnet when selectedRegionId changes', () => {
    // Initial region, VPC, and subnet
    const region1 = regionFactory.build({
      capabilities: ['VPCs'],
      id: 'us-east',
      label: 'Newark, NJ',
    });
    const region2 = regionFactory.build({
      capabilities: ['VPCs'],
      id: 'us-west',
      label: 'Fremont, CA',
    });

    // Set up mocks for initial render
    queryMocks.useRegionQuery.mockReturnValue({ data: region1 });
    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [mockVPCWithSubnet],
      isLoading: false,
    });

    const mockPrivateNetwork: PrivateNetwork = {
      vpc_id: 1234,
      subnet_id: 123,
      public_access: true,
    };

    const resetFormFields = vi.fn();
    const onConfigurationChange = vi.fn();

    const { rerender, getByTestId } = renderWithTheme(
      <DatabaseVPCSelector
        {...mockProps}
        onConfigurationChange={onConfigurationChange}
        privateNetworkValues={mockPrivateNetwork}
        resetFormFields={resetFormFields}
        selectedRegionId="us-east"
      />
    );

    // Change region to a new one
    queryMocks.useRegionQuery.mockReturnValue({ data: region2 });
    queryMocks.useAllVPCsQuery.mockReturnValue({ data: [], isLoading: false });

    rerender(
      <DatabaseVPCSelector
        {...mockProps}
        onConfigurationChange={onConfigurationChange}
        privateNetworkValues={mockPrivateNetwork}
        resetFormFields={resetFormFields}
        selectedRegionId="us-west"
      />
    );

    expect(resetFormFields).toHaveBeenCalled();
    expect(onConfigurationChange).toHaveBeenCalledWith(null);
    const vpcSelector = getByTestId('database-vpc-selector');
    expect((vpcSelector.querySelector('input') as HTMLInputElement).value).toBe(
      ''
    );
  });

  it('Should NOT clear VPC and subnet when selectedRegionId changes from undefined to a valid region', () => {
    // Initial render with no region selected
    queryMocks.useRegionQuery.mockReturnValue({ data: null });
    queryMocks.useAllVPCsQuery.mockReturnValue({ data: [], isLoading: false });

    const resetFormFields = vi.fn();
    const onConfigurationChange = vi.fn();

    const { rerender } = renderWithTheme(
      <DatabaseVPCSelector
        {...mockProps}
        onConfigurationChange={onConfigurationChange}
        resetFormFields={resetFormFields}
        selectedRegionId=""
      />
    );

    // Now render with a valid region
    queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
    queryMocks.useAllVPCsQuery.mockReturnValue({ data: [], isLoading: false });

    rerender(
      <DatabaseVPCSelector
        {...mockProps}
        onConfigurationChange={onConfigurationChange}
        resetFormFields={resetFormFields}
        selectedRegionId="us-east"
      />
    );

    expect(resetFormFields).not.toHaveBeenCalled();
    expect(onConfigurationChange).not.toHaveBeenCalledWith(null);
  });

  it('Should show long helper text when no region is selected', () => {
    const { getByText } = renderWithTheme(
      <DatabaseVPCSelector {...mockProps} selectedRegionId="" />
    );
    expect(
      getByText(
        'In the Select Engine and Region section, select a region with an existing VPC to see available VPCs.',
        { exact: true }
      )
    ).toBeInTheDocument();
  });

  it('Should show short helper text when a region is selected but no VPCs are available', () => {
    queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
    queryMocks.useAllVPCsQuery.mockReturnValue({ data: [], isLoading: false });

    const { getByText } = renderWithTheme(
      <DatabaseVPCSelector {...mockProps} selectedRegionId="us-east" />
    );
    expect(
      getByText('No VPC is available in the selected region.', { exact: true })
    ).toBeInTheDocument();
  });

  it('Should NOT show helper text when VPCs are available', () => {
    const vpcWithSubnet = vpcFactory.build({
      region: 'us-east',
      subnets: subnetFactory.buildList(1, { ipv4: mockIpv4 }),
    });
    queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [vpcWithSubnet],
      isLoading: false,
    });

    const { queryByText } = renderWithTheme(
      <DatabaseVPCSelector {...mockProps} selectedRegionId="us-east" />
    );
    expect(
      queryByText('No VPC is available in the selected region.')
    ).not.toBeInTheDocument();
    expect(
      queryByText(
        'In the Select Engine and Region section, select a region with an existing VPC to see available VPCs.'
      )
    ).not.toBeInTheDocument();
  });

  it('Should show subnet validation error text when there is a subnet error', () => {
    setUpBaseMocks();
    const mockPrivateNetwork: PrivateNetwork = {
      vpc_id: 1234,
      subnet_id: null,
      public_access: false,
    };

    const mockErrors = {
      private_network: {
        subnet_id: 'Subnet is required.',
      },
    };

    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseVPCSelector
        {...mockProps}
        errors={mockErrors}
        privateNetworkValues={mockPrivateNetwork}
        selectedRegionId="us-east"
      />
    );

    const subnetSelector = getByTestId('database-subnet-selector');
    expect(subnetSelector).toBeInTheDocument();
    expect(getByText('Subnet is required.')).toBeInTheDocument();
  });

  it('Should clear subnet field when the VPC field is cleared', async () => {
    setUpBaseMocks();
    const onChange = vi.fn();

    // Start with both VPC and subnet selected
    const mockPrivateNetwork: PrivateNetwork = {
      vpc_id: 1234,
      subnet_id: 123,
      public_access: false,
    };

    const { getByTestId } = renderWithTheme(
      <DatabaseVPCSelector
        {...mockProps}
        onChange={onChange}
        privateNetworkValues={mockPrivateNetwork}
        selectedRegionId="us-east"
      />
    );

    // Simulate clearing the VPC field (user clears the Autocomplete)
    const vpcSelector = getByTestId('database-vpc-selector');
    const clearButton = vpcSelector.querySelector(
      'button[title="Clear"]'
    ) as HTMLElement;
    await userEvent.click(clearButton);
    // ...assertions as above...
    expect(onChange).toHaveBeenCalledWith('private_network.vpc_id', null);
    expect(onChange).toHaveBeenCalledWith('private_network.subnet_id', null);
    expect(onChange).toHaveBeenCalledWith(
      'private_network.public_access',
      false
    );
  });

  it('Should call onChange for the VPC field when a value is selected', async () => {
    setUpBaseMocks();
    const onChange = vi.fn();

    // Start with no VPC selected
    const mockPrivateNetwork: PrivateNetwork = {
      vpc_id: null,
      subnet_id: null,
      public_access: false,
    };

    const { getByTestId, findByText } = renderWithTheme(
      <DatabaseVPCSelector
        {...mockProps}
        onChange={onChange}
        privateNetworkValues={mockPrivateNetwork}
        selectedRegionId="us-east"
      />
    );

    // Simulate selecting a VPC from the Autocomplete
    const vpcSelector = getByTestId('database-vpc-selector').querySelector(
      'input'
    ) as HTMLInputElement;
    // Open the autocomplete dropdown
    await userEvent.click(vpcSelector);

    // Select the option
    const newVPC = await findByText('VPC 1');
    await userEvent.click(newVPC);

    expect(onChange).toHaveBeenCalledWith(
      'private_network.vpc_id',
      mockVPCWithSubnet.id
    );
  });

  it('Should call onChange for the Subnet field when subnet value is selected', async () => {
    setUpBaseMocks();
    const onChange = vi.fn();

    // Start with VPC selected and no subnet selection
    const mockPrivateNetwork: PrivateNetwork = {
      vpc_id: 1234,
      subnet_id: null,
      public_access: false,
    };

    const { getByTestId, findByText } = renderWithTheme(
      <DatabaseVPCSelector
        {...mockProps}
        onChange={onChange}
        privateNetworkValues={mockPrivateNetwork}
        selectedRegionId="us-east"
      />
    );

    // Simulate selecting a Subnet from the Autocomplete
    const subnetSelector = getByTestId(
      'database-subnet-selector'
    ).querySelector('input') as HTMLInputElement;

    await userEvent.click(subnetSelector);

    // Select the option
    const expectedSubnetLabel = `${mockSubnets[0].label} (${mockSubnets[0].ipv4})`;
    const newSubnet = await findByText(expectedSubnetLabel);
    await userEvent.click(newSubnet);

    expect(onChange).toHaveBeenCalledWith(
      'private_network.subnet_id',
      mockSubnets[0].id
    );
  });
});
