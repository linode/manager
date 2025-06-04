import { regionFactory } from '@linode/utilities';
import * as React from 'react';

import { kubernetesClusterFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  renderWithThemeAndRouter,
  wrapWithTableBody,
  wrapWithTheme,
} from 'src/utilities/testHelpers';

import { KubernetesClusterRow } from './KubernetesClusterRow';

import type { Props } from './KubernetesClusterRow';

const cluster = kubernetesClusterFactory.build({ region: 'us-central' });

const props: Props = {
  cluster,
  openDeleteDialog: vi.fn(),
  openUpgradeDialog: vi.fn(),
};

describe('ClusterRow component', () => {
  it('should render', async () => {
    const { getByTestId } = await renderWithThemeAndRouter(
      wrapWithTheme(wrapWithTableBody(<KubernetesClusterRow {...props} />))
    );

    getByTestId('cluster-row');
  });

  it('renders a TableRow with label, and region', async () => {
    server.use(
      http.get('*/regions', () => {
        const regions = regionFactory.buildList(1, {
          id: 'us-central',
          label: 'Fake Region, NC',
        });
        return HttpResponse.json(makeResourcePage(regions));
      })
    );

    const { findByText, getByText } = await renderWithThemeAndRouter(
      wrapWithTableBody(<KubernetesClusterRow {...props} />)
    );

    getByText('cluster-1');
    await findByText('US, Fake Region, NC');
  });

  it('renders HA chip for highly available clusters and hides chip for non-ha clusters', async () => {
    const { getByTestId, queryByTestId, rerender } =
      await renderWithThemeAndRouter(
        wrapWithTableBody(
          <KubernetesClusterRow
            {...props}
            cluster={kubernetesClusterFactory.build({
              control_plane: { high_availability: true },
            })}
          />
        )
      );

    getByTestId('ha-chip');

    rerender(
      wrapWithTableBody(
        <KubernetesClusterRow
          {...props}
          cluster={kubernetesClusterFactory.build({
            control_plane: { high_availability: false },
          })}
        />
      )
    );
    expect(queryByTestId('ha-chip')).toBeNull();
  });
});
