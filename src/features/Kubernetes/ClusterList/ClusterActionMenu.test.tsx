import * as React from 'react';
import { cleanup, fireEvent, render } from 'react-testing-library';
import { ClusterActionMenu } from './ClusterActionMenu';
const requests = require.requireMock('../../../services/kubernetes');

import { includesActions, wrapWithTheme } from 'src/utilities/testHelpers';

jest.mock('src/components/ActionMenu/ActionMenu');
jest.mock('src/services/kubernetes', () => ({
  getKubeConfig: () => jest.fn()
}));

requests.getKubeConfig = jest
  .fn()
  .mockResolvedValueOnce({ kubeconfig: 'SSBhbSBhIHRlYXBvdA==' });

const props = {
  clusterId: 123456,
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
  openDialog: jest.fn()
};

afterEach(cleanup);

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
    expect(requests.getKubeConfig).toHaveBeenCalledWith(123456);
  });
});
