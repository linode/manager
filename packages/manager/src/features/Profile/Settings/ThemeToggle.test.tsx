import { shallow } from 'enzyme';
import * as React from 'react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('should render', () => {
    shallow(<ThemeToggle toggleTheme={jest.fn()} />);
  });
});
