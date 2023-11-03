import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Button } from './Button';

describe('Button', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<Button>Test</Button>);
    getByText('Test');
  });

  it('should render the loading state', () => {
    const { getByTestId } = renderWithTheme(<Button loading>Test</Button>);

    const loadingIcon = getByTestId('loadingIcon');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('should render the HelpIcon when tooltipText is true', () => {
    const { getByTestId } = renderWithTheme(
      <Button tooltipText="Test">Test</Button>
    );

    const helpIcon = getByTestId('HelpOutlineIcon');
    expect(helpIcon).toBeInTheDocument();
  });
});
