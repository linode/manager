import { render } from '@testing-library/react';
import * as React from 'react';

import { kubernetesClusterFactory } from 'src/factories';
import { wrapWithTableBody, wrapWithTheme } from 'src/utilities/testHelpers';

import { KubernetesClusterRow, Props } from './KubernetesClusterRow';

const cluster = kubernetesClusterFactory.build({ region: 'us-central' });

const props: Props = {
  cluster,
  openDeleteDialog: vi.fn(),
  openUpgradeDialog: vi.fn(),
};

describe('ClusterRow component', () => {
  it('should render', () => {
    const { getByTestId } = render(
      wrapWithTheme(wrapWithTableBody(<KubernetesClusterRow {...props} />))
    );

    getByTestId('cluster-row');
  });

  it('renders a TableRow with label, and region', () => {
    const { getByText } = render(
      wrapWithTableBody(<KubernetesClusterRow {...props} />)
    );

    getByText('cluster-0');
    getByText('Dallas, TX');
  });

  it('renders HA chip for highly available clusters and hides chip for non-ha clusters', () => {
    const { getByTestId, queryByTestId, rerender } = render(
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
