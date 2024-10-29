import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Actions } from './Actions';

describe('Actions', () => {
  it('should render a create button', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('Create Linode').closest('button');

    expect(button).toBeVisible();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeEnabled();
  });
  it("should render a ' View Code Snippets' button", () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('View Code Snippets').closest('button');

    expect(button).toBeVisible();
    expect(button).toBeEnabled();
  });
});
