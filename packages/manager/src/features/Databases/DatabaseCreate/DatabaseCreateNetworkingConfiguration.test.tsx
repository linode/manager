import * as React from 'react';
import { describe, it, vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseCreateNetworkingConfiguration } from './DatabaseCreateNetworkingConfiguration';

import type { AccessProps } from './DatabaseCreateAccessControls';
import type { PrivateNetwork } from '@linode/api-v4';
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

  it('renders the networking configuration heading and description', () => {
    const { getByText } = renderWithTheme(
      <DatabaseCreateNetworkingConfiguration {...mockProps} />
    );
    expect(
      getByText('Configure Networking', {
        exact: true,
      })
    ).toBeInTheDocument();
    expect(
      getByText('Configure networking options for the cluster.', {
        exact: true,
      })
    ).toBeInTheDocument();
  });

  it('renders DatabaseCreateAccessControls and DatabaseVPCSelector', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <DatabaseCreateNetworkingConfiguration {...mockProps} />
    );
    expect(getByTestId('database-vpc-selector')).toBeInTheDocument();
    expect(getByText('Manage Access')).toBeInTheDocument();
  });
});
