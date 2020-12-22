import { renderWithTheme } from 'src/utilities/testHelpers';
import * as React from 'react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('should render', () => {
    renderWithTheme(<ThemeToggle toggleTheme={jest.fn()} />);
  });
});
