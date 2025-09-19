import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import ConnectionDetailsRow from './ConnectionDetailsRow';

describe('ConnectionDetailsRow', () => {
  it('should render provided label and children', async () => {
    const { getByText } = renderWithTheme(
      <ConnectionDetailsRow label="Test Label">
        <p>Test Children Prop</p>
      </ConnectionDetailsRow>
    );
    const testLabel = getByText('Test Label');
    const testChildrenProp = getByText('Test Children Prop');

    expect(testLabel).toBeInTheDocument();
    expect(testChildrenProp).toBeInTheDocument();
  });
});
