import * as kube from '@linode/api-v4/lib/kubernetes/kubernetes';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { includesActions, wrapWithTheme } from 'src/utilities/testHelpers';

import { ClusterActionMenu } from './ClusterActionMenu';

const mockGetKubeConfig = vi.spyOn<any, any>(kube, 'getKubeConfig');

// Mock snackbar to prevent "Can't perform a React state update on an unmounted component" warning.
vi.mock('notistack', () => ({
  ...vi.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: vi.fn(),
    };
  },
}));

const props = {
  closeSnackbar: vi.fn(),
  clusterId: 123456,
  clusterLabel: 'my-cluster',
  enqueueSnackbar: vi.fn(),
  openDialog: vi.fn(),
  ...reactRouterProps,
};

describe('Kubernetes cluster action menu', () => {
  it('should include the correct Kube actions', () => {
    const { queryByText } = render(
      wrapWithTheme(<ClusterActionMenu {...props} />)
    );
    includesActions(['Download kubeconfig', 'Delete'], queryByText);
  });

  it('should query the API for a config file when Download kubeconfig is clicked', () => {
    const { getByText } = render(
      wrapWithTheme(<ClusterActionMenu {...props} />)
    );
    fireEvent.click(getByText(/download/i));
    expect(mockGetKubeConfig).toHaveBeenCalledWith(123456);
  });
});
