import * as React from 'react';
import { QueryClient } from 'react-query';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodePoolsDisplay, Props } from './NodePoolsDisplay';

const props: Props = {
  clusterID: 123,
  clusterLabel: 'a cluster',
};

describe('NodeTable', () => {
  it('Includes the plan label', async () => {
    const queryClient = new QueryClient();
    const { findAllByText } = renderWithTheme(<NodePoolsDisplay {...props} />, {
      queryClient,
    });

    await findAllByText('Linode 1 GB');
  });
});
