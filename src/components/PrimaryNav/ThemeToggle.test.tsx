import { shallow } from 'enzyme';
import * as React from 'react';
import { light } from 'src/themes';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  const mockClasses = {
    switchText: '',
    switchWrapper: '',
    toggle: ''
  };

  it('should render', () => {
    shallow(
      <ThemeToggle
        toggleTheme={jest.fn()}
        classes={mockClasses}
        theme={light()}
      />
    );
  });
});
