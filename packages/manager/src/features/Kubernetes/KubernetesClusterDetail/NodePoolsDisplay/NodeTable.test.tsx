import * as React from 'react';
import { kubeLinodeFactory } from 'src/factories/kubernetesCluster';
import { linodeFactory } from 'src/factories/linodes';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodeTable, Props } from './NodeTable';

const mockLinodes = linodeFactory.buildList(3);

const mockKubeNodes = kubeLinodeFactory.buildList(3);

const props: Props = {
  nodes: mockKubeNodes,
  poolId: 1,
  typeLabel: 'Linode 2G',
  openRecycleNodeDialog: jest.fn()
};

describe('NodeTable', () => {
  it('includes label, status, and IP columns', () => {
    const { findByText } = renderWithTheme(<NodeTable {...props} />);
    mockLinodes.forEach(async thisLinode => {
      await findByText(thisLinode.label);
      await findByText(thisLinode.ipv4[0]);
      await findByText('Ready');
    });
  });
  it('includes the Pool ID', () => {
    const { getByText } = renderWithTheme(<NodeTable {...props} />);
    getByText('Pool ID 1');
  });
});
