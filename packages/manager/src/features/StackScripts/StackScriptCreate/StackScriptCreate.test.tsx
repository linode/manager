import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StackScriptCreate } from './StackScriptCreate';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

describe('StackScriptCreate', () => {
  it('should render header, inputs, and buttons', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <StackScriptCreate />
    );

    expect(getByLabelText('StackScript Label (required)')).toBeVisible();
    expect(getByLabelText('Description')).toBeVisible();
    expect(getByLabelText('Target Images (required)')).toBeVisible();
    expect(getByLabelText('Script (required)')).toBeVisible();
    expect(getByLabelText('Revision Note')).toBeVisible();

    const createButton = getByText('Create StackScript').closest('button');
    expect(createButton).toBeVisible();
    expect(createButton).toBeEnabled();
  });
});
