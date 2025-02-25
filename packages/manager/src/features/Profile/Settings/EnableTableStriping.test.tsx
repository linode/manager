import { waitFor } from '@testing-library/react';
import React from 'react';

import { preferencesFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EnableTableStriping } from './EnableTableStriping';

describe('EnableTableStriping', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithTheme(<EnableTableStriping />);

    expect(getByText('Enable Table Striping')).toBeVisible();
  });

  it('is enabled if isTableStripingEnabled in user preferences is true', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(
          preferencesFactory.build({ isTableStripingEnabled: true })
        )
      )
    );

    const { getByRole, getByText } = renderWithTheme(<EnableTableStriping />);

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

    const { getByRole, getByText } = renderWithTheme(<EnableTableStriping />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText('Table striping is disabled')).toBeVisible();
  });

  it('is disabled if isTableStripingEnabled in user preferences is undefined/does not exist', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () => HttpResponse.json({}))
    );

    const { getByRole, getByText } = renderWithTheme(<EnableTableStriping />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText('Table striping is disabled')).toBeVisible();
  });
});
