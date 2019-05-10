import * as React from 'react';
import { cleanup, render } from 'react-testing-library';

import { clusters } from 'src/__data__/kubernetes';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import ClusterList from './ClusterList';

afterEach(cleanup);

describe('ClusterList component', () => {
  it('should display content', () => {
    const { getAllByTestId } = render(
      wrapWithTheme(<ClusterList clusters={clusters} />)
    );
    expect(getAllByTestId('cluster-row')).toHaveLength(clusters.length);
  });
});
