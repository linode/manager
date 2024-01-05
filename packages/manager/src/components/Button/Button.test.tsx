import { fireEvent, screen } from '@testing-library/react';
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
      <Button disabled tooltipText="Test">
        Test
      </Button>
    );

    const helpIcon = getByTestId('HelpOutlineIcon');
    expect(helpIcon).toBeInTheDocument();
  });

  it('should be disabled if loading', () => {
    const { getByTestId } = renderWithTheme(<Button loading>Test</Button>);
    const button = getByTestId('Button');
    expect(button).toBeDisabled();
  });

  it('should not have the disabled attribute if disabled', () => {
    const { getByTestId } = renderWithTheme(<Button disabled>Test</Button>);
    const button = getByTestId('Button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should display the tooltip if disabled and tooltipText is true', async () => {
    const { getByTestId } = renderWithTheme(
      <Button disabled tooltipText="Test">
        Test
      </Button>
    );

    const button = getByTestId('Button');
    expect(button).toHaveAttribute('aria-describedby', 'button-tooltip');

    fireEvent.mouseOver(button);
    await expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
