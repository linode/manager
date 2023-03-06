import React from 'react';
import Button from './Button';
import { render } from '@testing-library/react';

describe('Button', () => {
  it('should render', () => {
    const { getByText } = render(<Button>Test</Button>);
    getByText('Test');
  });

  it('should render the loading state', () => {
    const { getByTestId } = render(<Button loading>Test</Button>);

    const loadingIcon = getByTestId('loadingIcon');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('should render the HelpIcon when tooltipText is true', () => {
    const { getByTestId } = render(<Button tooltipText="Test">Test</Button>);

    const helpIcon = getByTestId('HelpOutlineIcon');
    expect(helpIcon).toBeInTheDocument();
  });
});
