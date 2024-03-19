import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Details } from './Details';

describe('Linode Create Details', () => {
  it('renders a header', () => {
    const { getByText } = renderWithTheme(<Details />);

    const header = getByText('Details');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders a "Linode Label" text field', () => {
    const { getByLabelText } = renderWithTheme(<Details />);

    expect(getByLabelText('Linode Label')).toBeVisible();
  });

  it('renders an "Add Tags" field', () => {
    const { getByLabelText, getByPlaceholderText } = renderWithTheme(
      <Details />
    );

    expect(getByLabelText('Add Tags')).toBeVisible();
    expect(
      getByPlaceholderText('Type to choose or create a tag.')
    ).toBeVisible();
  });
});
