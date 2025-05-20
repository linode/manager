import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { PendingIcon } from '../../assets';
import { renderWithTheme } from '../../utilities/testHelpers';
import { ErrorState } from './ErrorState';

const errorText = 'Some error text here';
const props = {
  CustomIcon: PendingIcon,
  errorText,
};

describe('Error State', () => {
  it('renders the ErrorState with specified text properly', () => {
    const screen = renderWithTheme(<ErrorState errorText={props.errorText} />);
    expect(screen.getByText(errorText)).toBeVisible();
    expect(screen.getByTestId('ErrorOutlineIcon')).toBeVisible();
  });

  it('renders the ErrorState with a custom icon image', () => {
    const screen = renderWithTheme(<ErrorState {...props} />);
    expect(screen.getByText(errorText)).toBeVisible();
    expect(screen.queryByTestId('ErrorOutlineIcon')).not.toBeInTheDocument();

    const icon = screen.container.querySelector('[data-qa-error-icon="true"]');
    expect(icon).toBeVisible();
    expect(icon?.getAttribute('style')).toBe(null);
  });

  it('renders the ErrorState with a custom icon and custom icon styling', () => {
    const screen = renderWithTheme(
      <ErrorState {...props} CustomIconStyles={{ height: 72, width: 72 }} />,
    );

    const icon = screen.container.querySelector('[data-qa-error-icon="true"]');
    expect(icon).toBeVisible();
    expect(icon?.getAttribute('style')).toBe('height: 72px; width: 72px;');
  });
});
