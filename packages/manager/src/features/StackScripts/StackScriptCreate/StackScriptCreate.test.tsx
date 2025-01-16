import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScriptCreate } from './StackScriptCreate';

describe('StackScriptCreate', () => {
  it('should render header, inputs, and buttons', () => {
    const { getByLabelText, getByText } = renderWithThemeAndHookFormContext({
      component: <StackScriptCreate />,
    });

    expect(getByText('Create')).toBeVisible();

    expect(getByLabelText('StackScript Label (required)')).toBeVisible();
    expect(getByLabelText('Description')).toBeVisible();
    expect(getByLabelText('Target Images (required)')).toBeVisible();
    expect(getByLabelText('Script (required)')).toBeVisible();
    expect(getByLabelText('Revision Note')).toBeVisible();

    const createButton = getByText('Create StackScript').closest('button');
    expect(createButton).toBeVisible();
    expect(createButton).toBeEnabled();

    const resetButton = getByText('Reset').closest('button');
    expect(resetButton).toBeVisible();
    expect(resetButton).toBeDisabled();
  });
});
