import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { Button } from './Button';

describe('Button', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<Button>Test</Button>);
    getByText('Test');
  });

  it('should render the loading state', () => {
    const { getByRole } = renderWithTheme(<Button loading>Test</Button>);

    const loadingIcon = getByRole('progressbar');
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
    const button = getByTestId('button');
    expect(button).toBeDisabled();
  });

  it('should have the aria-disabled attribute, instead of disabled attribute', () => {
    const { getByTestId } = renderWithTheme(<Button disabled>Test</Button>);
    const button = getByTestId('button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should display the tooltip if disabled and tooltipText is true', async () => {
    const { getByTestId } = renderWithTheme(
      <Button disabled tooltipText="Test tooltip">
        Test
      </Button>
    );

    const button = getByTestId('button');
    expect(button).toHaveAttribute('aria-describedby', 'button-tooltip');

    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    expect(screen.getByText('Test tooltip')).toBeVisible();
  });
});
