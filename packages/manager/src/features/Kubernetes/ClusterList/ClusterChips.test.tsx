import { render } from '@testing-library/react';
import React from 'react';

import { kubernetesClusterFactory } from 'src/factories';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { ClusterChips } from './ClusterChips';

const mockCluster = kubernetesClusterFactory.build({
  control_plane: { high_availability: false },
});
const mockHACluster = kubernetesClusterFactory.build({
  control_plane: { high_availability: true },
});
const mockEnterpriseCluster = kubernetesClusterFactory.build({
  tier: 'enterprise',
});
const mockStandardCluster = kubernetesClusterFactory.build({
  tier: 'standard',
});

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/account/account', () => {
  const actual = vi.importActual('src/queries/account/account');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

describe('Kubernetes cluster action menu', () => {
  it('renders an HA chip if the cluster is high availability', () => {
    const { getByText } = render(
      wrapWithTheme(<ClusterChips cluster={mockHACluster} />)
    );

    expect(getByText('HA', { exact: false }));
  });

  it('does not render an HA chip if the cluster is not high availability', () => {
    const { queryByText } = render(
      wrapWithTheme(<ClusterChips cluster={mockCluster} />)
    );

    expect(queryByText('HA', { exact: false })).toBe(null);
  });

  it('renders both enterprise and HA chips for an enterprise cluster if the feature is enabled', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['Kubernetes Enterprise'],
      },
    });

    const { getByText } = render(
      wrapWithTheme(<ClusterChips cluster={mockEnterpriseCluster} />, {
        flags: {
          lkeEnterprise: {
            enabled: true,
            ga: false,
            la: true,
          },
        },
      })
    );

    expect(getByText('HA', { exact: false })).toBeVisible();
    expect(getByText('ENTERPRISE')).toBeVisible();
  });

  it('does not render an enterprise chip for an enterprise cluster if the feature is disabled', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['Kubernetes Enterprise'],
      },
    });

    const { getByText, queryByText } = render(
      wrapWithTheme(<ClusterChips cluster={mockEnterpriseCluster} />, {
        flags: {
          lkeEnterprise: {
            enabled: false,
            ga: false,
            la: true,
          },
        },
      })
    );

    expect(getByText('HA', { exact: false })).toBeVisible();
    expect(queryByText('ENTERPRISE')).toBe(null);
  });

  it('does not render an enterprise chip for a standard cluster', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['Kubernetes Enterprise'],
      },
    });

    const { queryByText } = render(
      wrapWithTheme(<ClusterChips cluster={mockStandardCluster} />, {
        flags: {
          lkeEnterprise: {
            enabled: true,
            ga: false,
            la: true,
          },
        },
      })
    );

    expect(queryByText('HA')).toBe(null);
    expect(queryByText('ENTERPRISE')).toBe(null);
  });
});
