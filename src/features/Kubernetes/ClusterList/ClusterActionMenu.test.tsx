import * as React from 'react';
import { cleanup, render } from 'react-testing-library';
import { ClusterActionMenu } from './ClusterActionMenu';

import { includesActions, wrapWithTheme } from 'src/utilities/testHelpers';

jest.mock('src/components/ActionMenu/ActionMenu');

const props = {
  clusterId: '123456',
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn()
};

afterEach(cleanup);

describe('Kubernetes cluster action menu', () => {
  it('should include the correct Kube actions', () => {
    const { queryByText } = render(
      wrapWithTheme(<ClusterActionMenu {...props} />)
    );
    includesActions(['Download kubeconfig'], queryByText);
  });
});
