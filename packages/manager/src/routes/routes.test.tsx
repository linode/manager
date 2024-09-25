import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

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

// Function to generate a mock value for a dynamic segment
const mockDynamicSegment = (segment: string): string => {
  if (segment.includes('id')) {
    return '1';
  } else if (segment === 'username') {
    return 'testuser';
  } else {
    return 'mock-value';
  }
};

// Recursive function to get all route paths, including dynamic routes
const getAllRoutePaths = (route: any, parentPath = ''): string[] => {
  const currentPath = parentPath + (route.path || '');

  // console.log(currentPath)

  let paths =
    currentPath && currentPath !== '/' && currentPath !== '//'
      ? [currentPath]
      : [];

  if (route.children) {
    route.children.forEach((childRoute: any) => {
      paths = [...paths, ...getAllRoutePaths(childRoute, currentPath)];
    });
  }

  // Replace dynamic segments with mock values
  return paths.map((path) =>
    path.replace(/:\w+/g, (match) => mockDynamicSegment(match.slice(1)))
  );
};

const allPaths = getAllRoutePaths(routeTree);

describe('Route Tests', () => {
  test.each(allPaths)('renders %s route correctly', async (path) => {
    const router = createTestRouter(path);

    const { findByRole, getByRole } = renderWithTheme(
      <RouterProvider router={router} />
    );

    // Wait for any async operations to complete
    await findByRole('main', {}, { timeout: 2000 });

    // Check if the page has rendered without throwing an error
    expect(getByRole('main')).toBeInTheDocument();
  });
});
