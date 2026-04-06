import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { ClusterNetworkingPanel } from './ClusterNetworkingPanel';

const queryMocks = vi.hoisted(() => ({
  useRegionQuery: vi.fn().mockReturnValue({ data: { capabilities: ['VPCs'] } }),
  useAllVPCsQuery: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useIsLkeEnterpriseEnabled: vi.fn(() => ({
    isLkeEnterprisePhase2BYOVPCFeatureEnabled: true,
    isLkeEnterprisePhase2DualStackFeatureEnabled: true,
  })),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useRegionQuery: queryMocks.useRegionQuery,
    useAllVPCsQuery: queryMocks.useAllVPCsQuery,
  };
});

vi.mock('../kubeUtils', async () => {
  const actual = await vi.importActual('../kubeUtils');
  return {
    ...actual,
    useIsLkeEnterpriseEnabled: queryMocks.useIsLkeEnterpriseEnabled,
  };
});

const props = {
  selectedRegionId: 'us-east',
};

const defaultValues = {
  stack_type: 'ipv4',
  nodePools: [],
};

describe('ClusterNetworkingPanel', () => {
  it('renders IP version options and VPC radio buttons when LKE-E phase2MTC feature is enabled', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <ClusterNetworkingPanel {...props} />,
      useFormOptions: {
        defaultValues,
      },
    });

    // Confirm stack type section
    expect(getByText('IP Stack')).toBeVisible();
    expect(getByText('IPv4')).toBeVisible();
    expect(getByText('IPv4 + IPv6 (dual-stack)')).toBeVisible();

    // Confirm VPC section
    expect(getByText('VPC')).toBeVisible();
    expect(
      getByText('Automatically generate a VPC for this cluster')
    ).toBeVisible();
    expect(getByText('Use an existing VPC')).toBeVisible();
  });

  it('selects correct default values for radio buttons', () => {
    const { getByRole } = renderWithThemeAndHookFormContext({
      component: <ClusterNetworkingPanel {...props} />,
      useFormOptions: {
        defaultValues,
      },
    });

    // Confirm stack type default
    expect(getByRole('radio', { name: 'IPv4' })).toBeChecked();
    expect(
      getByRole('radio', { name: 'IPv4 + IPv6 (dual-stack)' })
    ).not.toBeChecked();

    // Confirm VPC default
    expect(
      getByRole('radio', {
        name: 'Automatically generate a VPC for this cluster',
      })
    ).toBeChecked();

    expect(
      getByRole('radio', {
        name: 'Use an existing VPC',
      })
    ).not.toBeChecked();
  });

  it('shows VPC and Subnet fields when "Use an existing VPC" is selected', async () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <ClusterNetworkingPanel {...props} />,
      useFormOptions: {
        defaultValues,
      },
    });

    await userEvent.click(getByLabelText('Use an existing VPC'));

    // Confirm VPC options display
    expect(getByLabelText('VPC')).toBeVisible();
    expect(getByLabelText('Subnet')).toBeVisible();
  });
});
