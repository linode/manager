import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import UserDefinedFieldsPanel from './UserDefinedFieldsPanel';

describe('UserDefinedFieldsPanel', () => {
  it('does not show a <Notice /> about number of nodes when a One-Click App without clusters is selected', () => {
    const { queryByTestId } = renderWithTheme(
      <UserDefinedFieldsPanel
        handleChange={() => null}
        selectedLabel={''}
        selectedUsername={''}
        udf_data={[]}
      />
    );

    expect(queryByTestId('create-cluster-notice')).not.toBeInTheDocument();
  });

  it('shows a <Notice /> about number of nodes when a One-Click App with clusters is selected', () => {
    const { queryByTestId } = renderWithTheme(
      <UserDefinedFieldsPanel
        userDefinedFields={[
          { label: 'Set Number of Nodes', name: 'cluster_size' },
        ]}
        handleChange={() => null}
        selectedLabel={''}
        selectedUsername={''}
        udf_data={[{ name: 'cluster_size' }]}
      />
    );

    expect(queryByTestId('create-cluster-notice')).toBeInTheDocument();
  });
});
