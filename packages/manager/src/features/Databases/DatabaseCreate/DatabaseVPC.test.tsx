import { regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { subnetFactory, vpcFactory } from 'src/factories';
import { DatabaseCreateVPC } from 'src/features/Databases/DatabaseCreate/DatabaseCreateVPC';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import type { DatabaseCreateValues } from './DatabaseCreate';
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

const initialHelperText =
  'In the Select Engine and Region section, select a region with an existing VPC to see available VPCs.';
const altHelperText = 'No VPC is available in the selected region.';

const vpcSelectorTestId = 'database-vpc-selector';
const subnetSelectorTestId = 'database-subnet-selector';
const vpcPlaceholder = 'Select a VPC';
const subnetPlaceholder = 'Select a subnet';

describe('DatabaseCreateVPC', () => {
  const defaultPrivateNetworkValues = {
    vpc_id: null,
    subnet_id: null,
    public_access: false,
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
    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: { private_network: defaultPrivateNetworkValues },
      },
    });
    const vpcField = screen.getByText('Assign a VPC', { exact: true });
    expect(vpcField).toBeInTheDocument();
  });

  it('Should render VPC autocomplete in initial disabled state', () => {
    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: { private_network: defaultPrivateNetworkValues },
      },
    });
    const vpcSelector = screen.getByTestId(vpcSelectorTestId);
    expect(vpcSelector).toBeInTheDocument();
    const vpcSelectorInput = screen.getByPlaceholderText(vpcPlaceholder);
    expect(vpcSelectorInput).toBeDisabled();
    const expectedHelperText = screen.getByText(initialHelperText, {
      exact: true,
    });
    expect(expectedHelperText).toBeInTheDocument();
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

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: defaultPrivateNetworkValues,
          region: 'us-east',
        },
      },
    });

    const vpcSelector = screen.getByTestId(vpcSelectorTestId);
    expect(vpcSelector).toBeInTheDocument();
    const vpcSelectorInput = screen.getByPlaceholderText(vpcPlaceholder);
    expect(vpcSelectorInput).toBeEnabled();
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

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: mockPrivateNetwork,
          region: 'us-east',
        },
      },
    });

    const vpcInput = screen.getByPlaceholderText(
      vpcPlaceholder
    ) as HTMLInputElement;
    expect(vpcInput?.value).toBe(mockVPCWithSubnet.label);
    const subnetSelector = screen.getByTestId(subnetSelectorTestId);
    expect(subnetSelector).toBeInTheDocument();
    const subnetInput = screen.getByPlaceholderText(subnetPlaceholder);
    expect(subnetInput).toBeEnabled();
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

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: mockPrivateNetwork,
          region: 'us-east',
        },
      },
    });

    const vpcInput = screen.getByPlaceholderText(
      vpcPlaceholder
    ) as HTMLInputElement;
    const subnetSelector = screen.getByTestId(subnetSelectorTestId);
    const expectedSubnetValue = `${mockSubnets[0].label} (${mockSubnets[0].ipv4})`;
    const publicAccessCheckbox = screen.getByTestId(
      'database-public-access-checkbox'
    );

    expect(vpcInput?.value).toBe(mockVPCWithSubnet.label);
    expect(subnetSelector).toBeInTheDocument();

    const subnetInput = screen.getByPlaceholderText(
      subnetPlaceholder
    ) as HTMLInputElement;
    expect(subnetInput?.value).toBe(expectedSubnetValue);
    expect(publicAccessCheckbox).toBeInTheDocument();
    expect(publicAccessCheckbox.querySelector('input')).toBeChecked();
  });

  it.skip('Should clear VPC and subnet when selectedRegionId changes', () => {
    // why have this component clear the VPC and subnet when the region changes?
    // This should be in the RegionSelect's onChange handler rather than here...

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

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: mockPrivateNetwork,
          region: 'us-east',
        },
      },
    });

    // Change region to a new one
    queryMocks.useRegionQuery.mockReturnValue({ data: region2 });
    queryMocks.useAllVPCsQuery.mockReturnValue({ data: [], isLoading: false });

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: mockPrivateNetwork,
          region: 'us-west',
        },
      },
    });

    expect(resetFormFields).toHaveBeenCalled();
    expect(onConfigurationChange).toHaveBeenCalledWith(null);
    const vpcInput = screen.getByPlaceholderText(
      vpcPlaceholder
    ) as HTMLInputElement;
    expect((vpcInput as HTMLInputElement).value).toBe('');
  });

  it('Should not clear VPC and subnet when selectedRegionId changes from undefined to a valid region', () => {
    // Initial render with no region selected
    queryMocks.useRegionQuery.mockReturnValue({ data: null });
    queryMocks.useAllVPCsQuery.mockReturnValue({ data: [], isLoading: false });

    const resetFormFields = vi.fn();
    const onConfigurationChange = vi.fn();

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: defaultPrivateNetworkValues,
          region: '',
        },
      },
    });

    // Now render with a valid region
    queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
    queryMocks.useAllVPCsQuery.mockReturnValue({ data: [], isLoading: false });

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: defaultPrivateNetworkValues,
          region: 'us-east',
        },
      },
    });

    expect(resetFormFields).not.toHaveBeenCalled();
    expect(onConfigurationChange).not.toHaveBeenCalledWith(null);
  });

  it('Should show long helper text when no region is selected', () => {
    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: defaultPrivateNetworkValues,
          region: '',
        },
      },
    });
    const expectedHelperText = screen.getByText(initialHelperText, {
      exact: true,
    });
    expect(expectedHelperText).toBeInTheDocument();
  });

  it('Should show short helper text when a region is selected but no VPCs are available', () => {
    queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
    queryMocks.useAllVPCsQuery.mockReturnValue({ data: [], isLoading: false });

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: defaultPrivateNetworkValues,
          region: 'us-east',
        },
      },
    });

    const expectedHelperText = screen.getByText(altHelperText, { exact: true });
    expect(expectedHelperText).toBeInTheDocument();
  });

  it('Should not show helper text when VPCs are available', () => {
    const vpcWithSubnet = vpcFactory.build({
      region: 'us-east',
      subnets: subnetFactory.buildList(1, { ipv4: mockIpv4 }),
    });
    queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [vpcWithSubnet],
      isLoading: false,
    });

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: defaultPrivateNetworkValues,
          region: 'us-east',
        },
      },
    });

    const expectedAltHelperText = screen.queryByText(altHelperText);
    const expectedInitialHelperText = screen.queryByText(initialHelperText);
    expect(expectedAltHelperText).not.toBeInTheDocument();
    expect(expectedInitialHelperText).not.toBeInTheDocument();
  });

  it('Should hide the subnet field when the VPC field is cleared', async () => {
    setUpBaseMocks();
    // Start with both VPC and subnet selected
    const mockPrivateNetwork: PrivateNetwork = {
      vpc_id: 1234,
      subnet_id: 123,
      public_access: false,
    };

    renderWithThemeAndHookFormContext<DatabaseCreateValues>({
      component: <DatabaseCreateVPC onChange={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          private_network: mockPrivateNetwork,
          region: 'us-east',
        },
      },
    });

    // Clear VPC selection
    const vpcSelector = screen.getByTestId(vpcSelectorTestId);
    const clearButton = vpcSelector.querySelector(
      'button[title="Clear"]'
    ) as HTMLElement;
    await userEvent.click(clearButton);

    const subnetSelector = screen.queryByTestId(subnetSelectorTestId);
    expect(subnetSelector).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'The cluster will have public access by default if a VPC is not assigned.'
      )
    ).toBeVisible();
  });
});
