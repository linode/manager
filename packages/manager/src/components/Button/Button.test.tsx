import React from 'react';
import { Button } from './Button';
import { renderWithTheme } from 'src/utilities/testHelpers';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

describe('Button', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(
      <LinodeThemeWrapper>
        <Button>Test</Button>
      </LinodeThemeWrapper>
    );
    getByText('Test');
  });

  it('should render the loading state', () => {
    const { getByTestId } = renderWithTheme(
      <LinodeThemeWrapper>
        <Button loading>Test</Button>
      </LinodeThemeWrapper>
    );

    const loadingIcon = getByTestId('loadingIcon');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('should render the HelpIcon when tooltipText is true', () => {
    const { getByTestId } = renderWithTheme(
      <LinodeThemeWrapper>
        <Button tooltipText="Test">Test</Button>
      </LinodeThemeWrapper>
    );

    const helpIcon = getByTestId('HelpOutlineIcon');
    expect(helpIcon).toBeInTheDocument();
  });
});
