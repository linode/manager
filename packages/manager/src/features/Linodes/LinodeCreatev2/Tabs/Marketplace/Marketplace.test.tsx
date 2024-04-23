import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Marketplace } from './Marketplace';
import { categories } from './utilities';

describe('Marketplace', () => {
  it('should render a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Marketplace />,
    });

    const heading = getByText('Select an App');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render a search field', () => {
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <Marketplace />,
    });

    const input = getByPlaceholderText('Search for app name');

    expect(input).toBeVisible();
    expect(input).toBeEnabled();
  });

  it('should render a category select', () => {
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <Marketplace />,
    });

    const input = getByPlaceholderText('Select category');

    expect(input).toBeVisible();
    expect(input).toBeEnabled();
  });

  it('should allow the user to select a category', async () => {
    const {
      getByLabelText,
      getByPlaceholderText,
      getByText,
    } = renderWithThemeAndHookFormContext({
      component: <Marketplace />,
    });

    const select = getByPlaceholderText('Select category');

    await userEvent.click(select);

    // Verify all categories are rendered in the dropdown list
    for (const category of categories) {
      expect(getByText(category)).toBeVisible();
    }

    // Select a category
    await userEvent.click(getByText('Databases'));

    // Verify value updates
    expect(select).toHaveDisplayValue('Databases');

    // Verify the category can be cleared
    const clearButton = getByLabelText('Clear');

    await userEvent.click(clearButton);

    expect(select).toHaveDisplayValue('');
  });
});
