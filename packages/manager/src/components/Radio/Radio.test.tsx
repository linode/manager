import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Radio } from './Radio';

// These tests are for a single radio button, not a radio group
describe('Radio', () => {
  it('renders a single radio properly', () => {
    const screen = renderWithTheme(<Radio />);
    screen.debug();
  });
});
