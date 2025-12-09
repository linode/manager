import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerLandingEmptyState } from './NodeBalancersLandingEmptyState';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
  userPermissions: vi.fn(() => ({
    data: {
      create_nodebalancer: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

// Note: An integration test confirming the helper text and enabled Create NodeBalancer button already exists, so we're just checking for a disabled create button here
describe('NodeBalancersLandingEmptyState', () => {
  it('should disable the "Create NodeBalancer" button if the user does not have permission', async () => {
    const { getByRole } = renderWithTheme(<NodeBalancerLandingEmptyState />);

    await waitFor(() => {
      const createNodeBalancerBtn = getByRole('button', {
        name: 'Create NodeBalancer',
      });

      expect(createNodeBalancerBtn).toBeInTheDocument();
      expect(createNodeBalancerBtn).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('should enable the "Create NodeBalancer" button if the user has permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_nodebalancer: true,
      },
    });

    const { getByRole } = renderWithTheme(<NodeBalancerLandingEmptyState />);

    await waitFor(() => {
      const createNodeBalancerBtn = getByRole('button', {
        name: 'Create NodeBalancer',
      });

      expect(createNodeBalancerBtn).toBeInTheDocument();
      expect(createNodeBalancerBtn).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });
});
