import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { allPaths } from './utils/allPaths';
import { routeTree } from './index';

// Mock any context or dependencies your routes might need
const mockContext = {
  accountSettings: {},
  app: {
    features: {},
    flags: {},
    notifications: [],
  },
  isACLPEnabled: false,
  isDatabasesEnabled: false,
  isPlacementGroupsEnabled: false,
  selfServeBetas: false,
};

// Helper function to create a test router
const createTestRouter = (initialPath: string) => {
  return createRouter({
    context: mockContext,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    routeTree,
  });
};

describe.skip('Route Tests', () => {
  test.each(allPaths)('renders %s route correctly', async (path) => {
    const router = createTestRouter(path);

    const { findByRole, getByRole } = renderWithTheme(
      <RouterProvider router={router} />
    );

    await waitFor(
      () => {
        const h1 = getByRole('heading', { level: 1 });
        expect(h1).toBeInTheDocument();
      },
      { timeout: 10_000 }
    );
    // Wait for any async operations to complete
    await findByRole('main', {}, { timeout: 2000 });
    // Check if the page has rendered without throwing an error
    expect(getByRole('main')).toBeInTheDocument();
  });
});
