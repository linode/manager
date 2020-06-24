import { cleanup, waitForElement } from '@testing-library/react';
import * as React from 'react';
import { kubeLinodeFactory } from 'src/factories/kubernetesCluster';
import { linodeFactory } from 'src/factories/linodes';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodeTable, Props } from './NodeTable';

afterEach(cleanup);

const request = require.requireMock('@linode/api-v4/lib/linodes');
jest.mock('@linode/api-v4/lib/linodes');

const mockLinodes = linodeFactory.buildList(3);
const mockKubeNodes = kubeLinodeFactory.buildList(3);

request.getLinodes = jest.fn().mockResolvedValue({
  results: 3,
  pages: 1,
  page: 1,
  data: mockLinodes
});

const props: Props = {
  nodes: mockKubeNodes,
  poolId: 1,
  typeLabel: 'Linode 2G',
  openRecycleNodeDialog: jest.fn()
};

describe('NodeTable', () => {
  it('includes label, status, and IP columns', () => {
    const { getByText } = renderWithTheme(<NodeTable {...props} />);
    mockLinodes.forEach(async thisLinode => {
      await waitForElement(() => getByText(thisLinode.label));
      await waitForElement(() => getByText(thisLinode.ipv4[0]));
      await waitForElement(() => getByText('Ready'));
    });
  });
  it('includes the Pool ID', () => {
    const { getByText } = renderWithTheme(<NodeTable {...props} />);
    getByText('Pool ID 1');
  });
});
