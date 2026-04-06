import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import ClusterSelect from './ClusterSelect';

describe('ClusterSelect', () => {
  it('Renders a select with object storage clusters', () => {
    const { getByText } = renderWithTheme(
      <ClusterSelect
        onBlur={() => null}
        onChange={() => null}
        selectedCluster={''}
      />
    );
    getByText('Region');
  });
});
