import { RouterProvider } from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { migrationRouter } from './index';
import { getAllRoutePaths } from './utils/allPaths';

const allMigrationPaths = getAllRoutePaths(migrationRouter);

vi.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    selfServeBetas: true,
  }),
}));

describe('Migration Router', () => {
  const renderWithRouter = (initialEntry: string) => {
    migrationRouter.invalidate();
    migrationRouter.navigate({ replace: true, to: initialEntry });

    return renderWithTheme(
      <React.Suspense>
        <RouterProvider router={migrationRouter} />
      </React.Suspense>
    );
  };

  /**
   * This test is meant to incrementally test all routes being added to the migration router.
   * It will hopefully catch any issues with routes not being added or set up correctly:
   * - Route is not found in the router
   * - Route is found in the router but the component is not rendered
   * - Route is found in the router and the component is rendered but missing a heading (which should be a requirement for all routes)
   */
  test.each(allMigrationPaths)('route: %s', async (path) => {
    renderWithRouter(path);

    await waitFor(
      async () => {
        const migrationRouter = screen.getByTestId('migration-router');
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(migrationRouter).toBeInTheDocument();
        expect(h1).toBeInTheDocument();
        expect(h1).not.toHaveTextContent('Not Found');
      },
      {
        timeout: 5000,
      }
    );
  });

  it('should render the NotFound component for broken routes', async () => {
    renderWithRouter('/broken-route');

    await waitFor(
      async () => {
        const migrationRouter = screen.getByTestId('migration-router');
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(migrationRouter).toBeInTheDocument();
        expect(h1).toBeInTheDocument();
        expect(h1).toHaveTextContent('Not Found');
      },
      {
        timeout: 5000,
      }
    );
  });
});
