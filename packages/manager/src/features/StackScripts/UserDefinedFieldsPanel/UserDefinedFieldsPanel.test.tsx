import * as React from 'react';
import UserDefinedFieldsPanel from './UserDefinedFieldsPanel';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('UserDefinedFieldsPanel', () => {
  it('does not show a <Notice /> about temporary nodes when a One-Click App without clusters is selected', () => {
    const { queryByTestId } = renderWithTheme(
      <UserDefinedFieldsPanel
        handleChange={() => null}
        udf_data={[]}
        selectedLabel={''}
        selectedUsername={''}
      />
    );

    expect(queryByTestId('temp-node-notice')).not.toBeInTheDocument();
  });

  it('shows a <Notice /> about temporary nodes when a One-Click App with clusters is selected', () => {
    const { queryByTestId } = renderWithTheme(
      <UserDefinedFieldsPanel
        handleChange={() => null}
        udf_data={[{ name: 'node_options' }]}
        userDefinedFields={[
          { name: 'node_options', label: 'Set Number of Nodes' },
        ]}
        selectedLabel={''}
        selectedUsername={''}
      />
    );

    expect(queryByTestId('temp-node-notice')).toBeInTheDocument();
  });
});
