import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodePoolsDisplay } from './NodePoolsDisplay';

import type { Props } from './NodePoolsDisplay';

const props: Props = {
  clusterCreated: '2025-01-13T02:58:58',
  clusterID: 123,
  clusterLabel: 'a cluster',
  clusterRegionId: 'us-east',
  clusterTier: 'standard',
  regionsData: [],
};

describe('NodeTable', () => {
  it('Includes the plan label', async () => {
    const { queryAllByText } = renderWithTheme(<NodePoolsDisplay {...props} />);
    await waitFor(() => expect(queryAllByText('Linode 1 GB')));
  });
});
