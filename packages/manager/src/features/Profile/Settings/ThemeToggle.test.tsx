import { shallow } from 'enzyme';
import * as React from 'react';
import { light } from 'src/themes';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('should render', () => {
    shallow(<ThemeToggle toggleTheme={jest.fn()} theme={light(4)} />);
  });
});
