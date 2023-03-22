import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodePoolsDisplay, Props } from './NodePoolsDisplay';

const props: Props = {
  clusterID: 123,
  clusterLabel: 'a cluster',
};

describe('NodeTable', () => {
  it('Includes the plan label', async () => {
    const { queryAllByText } = renderWithTheme(<NodePoolsDisplay {...props} />);
    await waitFor(() => expect(queryAllByText('Linode 1 GB')));
  });
});
