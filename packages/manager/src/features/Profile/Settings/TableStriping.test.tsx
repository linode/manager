import { waitFor } from '@testing-library/react';
import React from 'react';

import { preferencesFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TableStriping } from './TableStriping';

describe('EnableTableStriping', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithTheme(<TableStriping />);

    expect(getByText('Table Striping')).toBeVisible();
  });

  it('is enabled if isTableStripingEnabled in user preferences is true', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(
          preferencesFactory.build({ isTableStripingEnabled: true })
        )
      )
    );

    const { getByRole, getByText } = renderWithTheme(<TableStriping />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).toBeChecked();
    expect(getByText('Table striping is enabled')).toBeVisible();
  });

  it('is disabled if isTableStripingEnabled in user preferences is false', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(
          preferencesFactory.build({ isTableStripingEnabled: false })
        )
      )
    );

    const { getByRole, getByText } = renderWithTheme(<TableStriping />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText('Table striping is disabled')).toBeVisible();
  });

  it('is enabled if isTableStripingEnabled in user preferences is undefined/does not exist', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () => HttpResponse.json({}))
    );

    const { getByRole, getByText } = renderWithTheme(<TableStriping />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).toBeChecked();
    expect(getByText('Table striping is enabled')).toBeVisible();
  });
});
