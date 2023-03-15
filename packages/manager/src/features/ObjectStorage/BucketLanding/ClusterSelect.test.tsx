import { renderWithTheme } from 'src/utilities/testHelpers';
import ClusterSelect from './ClusterSelect';
import React from 'react';

jest.mock('src/components/EnhancedSelect/Select');

describe('ClusterSelect', () => {
  it('Renders a select with object storage clusters', () => {
    const { getByText } = renderWithTheme(
      <ClusterSelect
        selectedCluster={''}
        onChange={() => null}
        onBlur={() => null}
      />
    );
    getByText('Region');
  });
});
