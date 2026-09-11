import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { KubernetesEmptyState } from './KubernetesLandingEmptyState';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLkePermissions: vi.fn(() => ({
    data: {
      create_lkecluster: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/useLkePermissions', () => ({
  useLkePermissions: queryMocks.useLkePermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

describe('KubernetesLandingEmptyState', () => {
  it('should disable the "Create Cluster" button if the user does not have permission', async () => {
    const { getByRole } = renderWithTheme(<KubernetesEmptyState />);

    await waitFor(() => {
      const createClusterBtn = getByRole('button', {
        name: 'Create Cluster',
      });

      expect(createClusterBtn).toBeInTheDocument();
      expect(createClusterBtn).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('should enable the "Create Cluster" button if the user has permission', async () => {
    queryMocks.useLkePermissions.mockReturnValue({
      data: {
        create_lkecluster: true,
      },
    });

    const { getByRole } = renderWithTheme(<KubernetesEmptyState />);

    await waitFor(() => {
      const createClusterBtn = getByRole('button', {
        name: 'Create Cluster',
      });

      expect(createClusterBtn).toBeInTheDocument();
      expect(createClusterBtn).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});
