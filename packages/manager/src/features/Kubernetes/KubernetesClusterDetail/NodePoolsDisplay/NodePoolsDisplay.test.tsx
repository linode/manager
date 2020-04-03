import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { types } from 'src/__data__/types';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { linodeFactory } from 'src/factories/linodes';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodePoolsDisplay, Props } from './NodePoolsDisplay';

afterEach(cleanup);

const request = require.requireMock('linode-js-sdk/lib/linodes');
jest.mock('linode-js-sdk/lib/linodes');

const mockLinodes = linodeFactory.buildList(3);

request.getLinodes = jest.fn().mockResolvedValue({
  results: 3,
  pages: 1,
  page: 1,
  data: mockLinodes
});

// Custom type to match the mock data we have in __data__.
const mockPools = nodePoolFactory.buildList(1, { type: 'g5-standard-1' });

const props: Props = {
  pools: mockPools,
  types: types.map(thisType => ({
    ...thisType,
    heading: 'heading',
    subHeadings: ['a', 'subheading']
  }))
};

describe('NodeTable', () => {
  it('Includes the plan label', () => {
    const { getByText } = renderWithTheme(<NodePoolsDisplay {...props} />);
    getByText('Linode 2GB');
  });
});
