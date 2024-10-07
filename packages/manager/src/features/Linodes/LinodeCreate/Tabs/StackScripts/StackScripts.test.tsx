import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScripts } from './StackScripts';

describe('StackScripts', () => {
  it('should render a StackScript section', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <StackScripts />,
    });

    expect(getByText('Account StackScripts')).toBeVisible();
    expect(getByText('Community StackScripts')).toBeVisible();
  });

  it('should render an Image section', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <StackScripts />,
    });

    expect(getByText('Select an Image')).toBeVisible();
  });
});
