import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodePoolsDisplay, Props } from './NodePoolsDisplay';

const props: Props = {
  clusterID: 123,
  clusterLabel: 'a cluster',
};

describe('NodeTable', () => {
  it('Includes the plan label', async () => {
    const { findAllByText } = renderWithTheme(<NodePoolsDisplay {...props} />);

    await findAllByText('Linode 1 GB');
  });
});
