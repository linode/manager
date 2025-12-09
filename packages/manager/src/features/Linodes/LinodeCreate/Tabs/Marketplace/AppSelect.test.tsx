import { waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { AppSelect } from './AppSelect';
import { uniqueCategories } from './utilities';

describe('Marketplace', () => {
  it('should render a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <AppSelect onOpenDetailsDrawer={vi.fn()} />,
    });

    const heading = getByText('Select an App');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render a search field', () => {
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <AppSelect onOpenDetailsDrawer={vi.fn()} />,
    });

    const input = getByPlaceholderText('Search for app name');

    expect(input).toBeVisible();
    expect(input).toBeDisabled();
  });

  it('should render a category select', () => {
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <AppSelect onOpenDetailsDrawer={vi.fn()} />,
    });

    const input = getByPlaceholderText('Select category');

    expect(input).toBeVisible();
    expect(input).toBeDisabled();
  });

  it('should allow the user to select a category', async () => {
    server.use(
      http.get('*/v4/linode/stackscripts', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByLabelText, getByPlaceholderText, getByText } =
      renderWithThemeAndHookFormContext({
        component: <AppSelect onOpenDetailsDrawer={vi.fn()} />,
      });

    await waitFor(
      () => {
        expect(getByPlaceholderText('Select category')).not.toBeDisabled();
      },
      { timeout: 5_000 }
    );

    const select = getByPlaceholderText('Select category');

    await userEvent.click(select);

    // Verify all categories are rendered in the dropdown list
    for (const category of uniqueCategories) {
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
