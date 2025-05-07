import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertMaxSelectionText } from './AlertMaxSelectionText';

describe('AlertMaxSelectionText', () => {
  it('displays correct max selection text based on passed maxSelectionCount', () => {
    const { getByTestId } = renderWithTheme(
      <AlertMaxSelectionText maxSelectionCount={2} />
    );
    expect(getByTestId('warning-tip')).toBeInTheDocument();
    expect(getByTestId('warning-tip')).toHaveTextContent(
      'You can select up to 2 entities.'
    );
  });
});
