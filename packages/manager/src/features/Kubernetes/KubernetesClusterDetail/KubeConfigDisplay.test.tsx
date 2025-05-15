import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { kubeEndpointFactory } from 'src/factories/kubernetesCluster';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { KubeConfigDisplay } from './KubeConfigDisplay';

const props = {
  clusterId: 1,
  clusterLabel: 'cluster-test',
  handleOpenDrawer: vi.fn(),
  isResettingKubeConfig: false,
  setResetKubeConfigDialogOpen: vi.fn(),
};

describe('KubeConfigDisplay', () => {
  it('should display the endpoint with port 443 if it exists', async () => {
    const endpoints = [
      kubeEndpointFactory.build({
        endpoint: `https://test.linodelke.net:6443`,
      }),
      kubeEndpointFactory.build({
        endpoint: `https://test.linodelke.net:443`,
      }),
    ];

    server.use(
      http.get('*/lke/clusters/*/api-endpoints', () => {
        return HttpResponse.json(makeResourcePage(endpoints));
      })
    );

    const { getByText } = renderWithTheme(<KubeConfigDisplay {...props} />);

    await waitFor(() => {
      expect(getByText('https://test.linodelke.net:443')).toBeVisible();
    });
  });

  it('should display first endpoint if the endpoint with port 443 does not exist', async () => {
    const endpoints = [
      kubeEndpointFactory.build({
        endpoint: `https://test.linodelke.net:6443`,
      }),
      kubeEndpointFactory.build({
        endpoint: `https://test.linodelke.net:123`,
      }),
    ];

    server.use(
      http.get('*/lke/clusters/*/api-endpoints', () => {
        return HttpResponse.json(makeResourcePage(endpoints));
      })
    );

    const { getByText } = renderWithTheme(<KubeConfigDisplay {...props} />);

    await waitFor(() => {
      expect(getByText('https://test.linodelke.net:6443')).toBeVisible();
    });
  });
});
