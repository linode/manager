import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DatabaseEngineSelect } from './DatabaseEngineSelect';

import type { Engine } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useDatabaseEnginesQuery: vi.fn().mockReturnValue({
    data: [
      {
        engine: 'mysql' as Engine,
        id: 'mysql/8',
        version: '8',
      },
      {
        engine: 'mysql' as Engine,
        id: 'mysql/8',
        version: '8.4',
      },
      {
        engine: 'postgresql' as Engine,
        id: 'postgresql/14',
        version: '14',
      },
      {
        engine: 'postgresql' as Engine,
        id: 'postgresql/15',
        version: '15',
      },
      {
        engine: 'valkey',
        id: 'valkey/8.1',
        version: '8.1',
      },
      {
        engine: 'valkey',
        id: 'valkey/9.0',
        version: '9.0',
      },
    ],
  }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDatabaseEnginesQuery: queryMocks.useDatabaseEnginesQuery,
  };
});

describe('DatabaseEngineSelect', () => {
  it('should sort engines by ascending engine, then by descending version within each engine group', async () => {
    renderWithThemeAndHookFormContext({
      component: <DatabaseEngineSelect />,
    });

    await userEvent.click(screen.getByLabelText('Database Engine'));
    // Check that engines are sorted by ascending order
    expect(screen.getByText('MySQL')).toBeVisible();
    expect(screen.getByText('PostgreSQL')).toBeVisible();
    expect(screen.getByText('Valkey')).toBeVisible();

    // Check that versions in each engine group are sorted by descending order
    const options = screen.getAllByRole('option');
    expect(options[0].textContent).toContain('MySQL v8.4');
    expect(options[1].textContent).toContain('MySQL v8');
    expect(options[2].textContent).toContain('PostgreSQL v15');
    expect(options[3].textContent).toContain('PostgreSQL v14');
    expect(options[4].textContent).toContain('Valkey v9.0');
    expect(options[5].textContent).toContain('Valkey v8.1');
  });
});
