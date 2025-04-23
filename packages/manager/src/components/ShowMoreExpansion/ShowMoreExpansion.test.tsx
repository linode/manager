import { Typography } from '@linode/ui';
import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ShowMoreExpansion } from './ShowMoreExpansion';

const CONTENT = 'Content to be shown';

describe('ShowMoreExpansion', () => {
  it('renders component with default state', () => {
    const { getByRole, queryByText } = renderWithTheme(
      <ShowMoreExpansion name="Test">
        <Typography>{CONTENT}</Typography>
      </ShowMoreExpansion>
    );

    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(queryByText(CONTENT)).toBeNull();
  });

  it('expands and collapses content on button click', async () => {
    const { getByRole, getByText, queryByText } = renderWithTheme(
      <ShowMoreExpansion name="Test">
        <Typography>{CONTENT}</Typography>
      </ShowMoreExpansion>
    );

    fireEvent.click(getByRole('button'));

    expect(getByText(CONTENT)).toBeInTheDocument();
    expect(getByRole('button').getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(getByRole('button'));

    expect(queryByText(CONTENT)).toBeNull();
    expect(getByRole('button').getAttribute('aria-expanded')).toBe('false');
  });

  it('renders component with defaultExpanded set to true', () => {
    const { getByRole, getByText } = renderWithTheme(
      <ShowMoreExpansion defaultExpanded={true} name="Test">
        <Typography>{CONTENT}</Typography>
      </ShowMoreExpansion>
    );

    expect(getByText(CONTENT)).toBeInTheDocument();
    expect(getByRole('button').getAttribute('aria-expanded')).toBe('true');
  });
});
