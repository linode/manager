import { regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it, vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseCreateNetworkingConfiguration } from './DatabaseCreateNetworkingConfiguration';

import type { AccessProps } from './DatabaseCreateAccessControls';
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

const mockRegion = regionFactory.build({
  capabilities: ['VPCs'],
  id: 'us-east',
  label: 'Newark, NJ',
});

describe('DatabaseCreateNetworkingConfiguration', () => {
  const mockAccessControlConfig: AccessProps = {
    disabled: false,
    errors: [],
    ips: [],
    onBlur: vi.fn(),
    onChange: vi.fn(),
    variant: 'networking',
  };

  const mockPrivateNetwork: PrivateNetwork = {
    vpc_id: null,
    subnet_id: null,
    public_access: false,
  };

  const mockProps = {
    accessControlsConfiguration: mockAccessControlConfig,
    errors: {},
    onChange: vi.fn(),
    onNetworkingConfigurationChange: vi.fn(),
    privateNetworkValues: mockPrivateNetwork,
    resetFormFields: vi.fn(),
    selectedRegionId: 'us-east',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useRegionQuery.mockReturnValue({ data: mockRegion });
    queryMocks.useAllVPCsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('renders the networking configuration heading and description', () => {
    renderWithTheme(<DatabaseCreateNetworkingConfiguration {...mockProps} />);
    const ConfigureNetworkingLabel = screen.getByText('Configure Networking', {
      exact: true,
    });
    expect(ConfigureNetworkingLabel).toBeInTheDocument();
    const configureNetworkingDescription = screen.getByText(
      'Configure networking options for the cluster.',
      {
        exact: true,
      }
    );
    expect(configureNetworkingDescription).toBeInTheDocument();
  });

  it('renders DatabaseCreateAccessControls and DatabaseVPCSelector', () => {
    renderWithTheme(<DatabaseCreateNetworkingConfiguration {...mockProps} />);
    const vpcSelector = screen.getByTestId('database-vpc-selector');
    expect(vpcSelector).toBeInTheDocument();
    const manageAccessLabel = screen.getByText('Manage Access');
    expect(manageAccessLabel).toBeInTheDocument();
  });
});
