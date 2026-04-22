import { nodeBalancerFactory } from '@linode/utilities';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LKEClusterInfo } from './LKEClusterInfo';

const queryMocks = vi.hoisted(() => ({
  useKubernetesClusterQuery: vi.fn().mockReturnValue({ status: 'success' }),
}));

vi.mock('src/queries/kubernetes', () => ({
  useKubernetesClusterQuery: queryMocks.useKubernetesClusterQuery,
}));

describe('LKEClusterInfo', () => {
  beforeEach(() => {
    queryMocks.useKubernetesClusterQuery.mockReturnValue({ status: 'success' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when the nodebalancer is not associated with a cluster', () => {
    const nodebalancer = nodeBalancerFactory.build({
      lke_cluster: null,
    });

    const { queryByText } = renderWithTheme(
      <LKEClusterInfo nodebalancer={nodebalancer} />
    );

    expect(queryByText('LKE Cluster')).not.toBeInTheDocument();
    expect(queryMocks.useKubernetesClusterQuery).toHaveBeenCalledWith({
      enabled: false,
      id: -1,
      options: {
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: false,
      },
    });
  });

  it('renders a link to the LKE cluster when the cluster still exists', () => {
    const nodebalancer = nodeBalancerFactory.build({
      lke_cluster: {
        id: 12,
        label: 'cluster-prod',
        type: 'lkecluster',
        url: 'v4/lke/clusters/12',
      },
    });

    const { getByRole, getByText } = renderWithTheme(
      <LKEClusterInfo nodebalancer={nodebalancer} />
    );

    expect(getByText('LKE Cluster')).toBeVisible();
    expect(getByRole('link', { name: 'Cluster cluster-prod' })).toHaveAttribute(
      'href',
      '/kubernetes/clusters/12/summary'
    );
    expect(getByText('(ID: 12)')).toBeVisible();
  });

  it('renders deleted cluster text when the cluster lookup fails', () => {
    queryMocks.useKubernetesClusterQuery.mockReturnValue({ status: 'error' });

    const nodebalancer = nodeBalancerFactory.build({
      lke_cluster: {
        id: 12,
        label: 'cluster-prod',
        type: 'lkecluster',
        url: 'v4/lke/clusters/12',
      },
    });

    const { getByText, queryByRole } = renderWithTheme(
      <LKEClusterInfo nodebalancer={nodebalancer} />
    );

    expect(
      getByText((_, element) => {
        return (
          !!element?.hasAttribute('data-qa-cluster') &&
          element.textContent === 'Cluster: cluster-prod (deleted)'
        );
      })
    ).toBeVisible();
    expect(
      queryByRole('link', { name: 'Cluster cluster-prod' })
    ).not.toBeInTheDocument();
  });
});
