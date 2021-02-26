import * as kube from '@linode/api-v4/lib/kubernetes/kubernetes';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { ClusterActionMenu } from './ClusterActionMenu';
import { includesActions, wrapWithTheme } from 'src/utilities/testHelpers';

jest.mock('src/components/ActionMenu/ActionMenu');
const mockGetKubeConfig = jest.spyOn<any, any>(kube, 'getKubeConfig');

const props = {
  clusterId: 123456,
  clusterLabel: 'my-cluster',
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
  openDialog: jest.fn(),
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
