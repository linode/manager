import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ErrorState } from './ErrorState';

describe('Removable Selections List', () => {
  it('renders the ErrorState with specified text properly', () => {
    const props = {
      errorText: 'Some error text here',
    };

    const screen = renderWithTheme(<ErrorState {...props} />);
    expect(screen.getByText('Some error text here')).toBeVisible();
  });
});
