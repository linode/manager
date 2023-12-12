import * as React from 'react';

import PendingIcon from 'src/assets/icons/pending.svg';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ErrorState } from './ErrorState';

const errorText = 'Some error text here';
const props = {
  CustomIcon: PendingIcon,
  errorText,
};

describe('Removable Selections List', () => {
  it('renders the ErrorState with specified text properly', () => {
    const screen = renderWithTheme(<ErrorState errorText={props.errorText} />);
    expect(screen.getByText(errorText)).toBeVisible();
  });

  it('renders the ErrorState with a custom icon image', () => {
    const screen = renderWithTheme(<ErrorState {...props} />);
    expect(screen.getByText(errorText)).toBeVisible();

    const icon = screen.container.querySelector('[data-qa-error-icon="true"]');
    expect(icon).toBeVisible();
    expect(icon?.getAttribute('style')).toBe(null);
  });

  it('renders the ErrorState with a custom icon and custom icon styling', () => {
    const screen = renderWithTheme(
      <ErrorState {...props} CustomIconStyles={{ height: 72, width: 72 }} />
    );

    const icon = screen.container.querySelector('[data-qa-error-icon="true"]');
    expect(icon).toBeVisible();
    expect(icon?.getAttribute('style')).toBe('height: 72px; width: 72px;');
  });
});
