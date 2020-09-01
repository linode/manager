import * as React from 'react';
import { types } from 'src/__data__/types';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodePoolsDisplay, Props } from './NodePoolsDisplay';

// Custom type to match the mock data we have in __data__.
const mockPools = nodePoolFactory.buildList(1, { type: 'g5-standard-1' });

const props: Props = {
  pools: mockPools,
  types: types.map(thisType => ({
    ...thisType,
    heading: 'heading',
    subHeadings: ['a', 'subheading']
  })),
  updatePool: jest.fn(),
  deletePool: jest.fn(),
  addNodePool: jest.fn(),
  recycleAllNodes: jest.fn(),
  clusterLabel: 'a cluster'
};

describe('NodeTable', () => {
  it('Includes the plan label', () => {
    const { getByText } = renderWithTheme(<NodePoolsDisplay {...props} />);
    getByText('Linode 2GB');
  });
});
