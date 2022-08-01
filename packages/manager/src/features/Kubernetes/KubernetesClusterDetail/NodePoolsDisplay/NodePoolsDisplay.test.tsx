import * as React from 'react';
import { extendedTypes } from 'src/__data__/ExtendedType';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodePoolsDisplay, Props } from './NodePoolsDisplay';

// Custom type to match the mock data we have in __data__.
const mockPools = nodePoolFactory.buildList(1, { type: 'g6-standard-1' });

const props: Props = {
  pools: mockPools,
  types: extendedTypes,
  updatePool: jest.fn(),
  deletePool: jest.fn(),
  addNodePool: jest.fn(),
  recycleAllPoolNodes: jest.fn(),
  recycleAllClusterNodes: jest.fn(),
  recycleNode: jest.fn(),
  getNodePools: jest.fn(),
  clusterID: 123,
  clusterLabel: 'a cluster',
};

describe('NodeTable', () => {
  it('Includes the plan label', () => {
    const { getByText } = renderWithTheme(<NodePoolsDisplay {...props} />);
    getByText('Linode 2GB');
  });
});
