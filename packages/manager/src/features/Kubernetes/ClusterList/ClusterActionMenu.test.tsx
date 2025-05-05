import * as kube from '@linode/api-v4/lib/kubernetes/kubernetes';
import { breakpoints } from '@linode/ui';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { resizeScreenSize, wrapWithTheme } from 'src/utilities/testHelpers';

import { ClusterActionMenu } from './ClusterActionMenu';

const mockGetKubeConfig = vi.spyOn<any, any>(kube, 'getKubeConfig');

// Mock snackbar to prevent "Can't perform a React state update on an unmounted component" warning.
vi.mock('notistack', async () => {
  const actual = await vi.importActual<any>('notistack');
  return {
    ...actual,
    useSnackbar: () => {
      return {
        enqueueSnackbar: vi.fn(),
      };
    },
  };
});

const props = {
  closeSnackbar: vi.fn(),
  clusterId: 123456,
  clusterLabel: 'my-cluster',
  enqueueSnackbar: vi.fn(),
  openDialog: vi.fn(),
  ...reactRouterProps,
};

describe('Kubernetes cluster action menu', () => {
  it('should include the correct Kube actions', async () => {
    resizeScreenSize(breakpoints.values.sm);
    const { getByText, queryByLabelText } = render(
      wrapWithTheme(<ClusterActionMenu {...props} />)
    );

    const actionMenuButton = queryByLabelText(/^Action menu for/)!;

    await userEvent.click(actionMenuButton);
    for (const action of ['Download kubeconfig', 'Delete']) {
      expect(getByText(action)).toBeVisible();
    }
  });

  it('should query the API for a config file when Download kubeconfig is clicked', async () => {
    resizeScreenSize(breakpoints.values.lg);
    const { getByText } = render(
      wrapWithTheme(<ClusterActionMenu {...props} />)
    );

    await fireEvent.click(getByText(/download/i));
    expect(mockGetKubeConfig).toHaveBeenCalledWith(123456);
  });
});
