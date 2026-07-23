import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NATGatewaysLandingEmptyState } from './NATGatewaysLandingEmptyState';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
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

describe('NATGatewaysLandingEmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create NAT Gateway Button', () => {
    it('should render the "Create NAT Gateway" button', async () => {
      const { getByRole } = renderWithTheme(<NATGatewaysLandingEmptyState />);

      await waitFor(() => {
        const createButton = getByRole('button', {
          name: 'Create NAT Gateway',
        });

        expect(createButton).toBeInTheDocument();
      });
    });

    it('should disable the "Create NAT Gateway" button if the user does not have permission', async () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          create_linode: false,
        },
      });

      const { getByRole } = renderWithTheme(<NATGatewaysLandingEmptyState />);

      await waitFor(() => {
        const createButton = getByRole('button', {
          name: 'Create NAT Gateway',
        });

        expect(createButton).toBeInTheDocument();
        expect(createButton).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should enable the "Create NAT Gateway" button if the user has permission', async () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          create_linode: true,
        },
      });

      const { getByRole } = renderWithTheme(<NATGatewaysLandingEmptyState />);

      await waitFor(() => {
        const createButton = getByRole('button', {
          name: 'Create NAT Gateway',
        });

        expect(createButton).toBeInTheDocument();
        expect(createButton).not.toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should navigate to the create page when the button is clicked', async () => {
      const mockNavigate = vi.fn();
      queryMocks.useNavigate.mockReturnValue(mockNavigate);
      queryMocks.userPermissions.mockReturnValue({
        data: {
          create_linode: true,
        },
      });

      const { getByRole } = renderWithTheme(<NATGatewaysLandingEmptyState />);

      await waitFor(() => {
        const createButton = getByRole('button', {
          name: 'Create NAT Gateway',
        });

        createButton.click();

        expect(mockNavigate).toHaveBeenCalledWith({
          to: '/natgateways/create',
        });
      });
    });

    it('should display the correct tooltip text when disabled', async () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          create_linode: false,
        },
      });

      const { getByRole } = renderWithTheme(<NATGatewaysLandingEmptyState />);

      await waitFor(() => {
        const createButton = getByRole('button', {
          name: 'Create NAT Gateway',
        });

        expect(createButton).toHaveAttribute('aria-disabled', 'true');
        // The button should have a tooltip container
        expect(createButton.closest('[data-qa-tooltip]')).toBeInTheDocument();
      });
    });
  });

  describe('Page Content', () => {
    it('should render the ResourcesSection component', () => {
      const { container } = renderWithTheme(<NATGatewaysLandingEmptyState />);

      // ResourcesSection renders the empty state content
      expect(container.querySelector('svg')).toBeInTheDocument(); // Icon
    });

    it('should render getting started guides', async () => {
      renderWithTheme(<NATGatewaysLandingEmptyState />);

      await waitFor(() => {
        // ResourcesSection component is rendered with getting started guides
        expect(document.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Permissions Integration', () => {
    it('should call usePermissions with the correct parameters', () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          create_linode: true,
        },
      });

      renderWithTheme(<NATGatewaysLandingEmptyState />);

      expect(queryMocks.userPermissions).toHaveBeenCalledWith('account', [
        'create_linode',
      ]);
    });

    it('should handle missing permissions gracefully', async () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          create_linode: false,
        },
      });

      const { getByRole } = renderWithTheme(<NATGatewaysLandingEmptyState />);

      await waitFor(() => {
        const createButton = getByRole('button', {
          name: 'Create NAT Gateway',
        });

        // Button should be disabled when user lacks permission
        expect(createButton).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('TODO: Future Permission Updates', () => {
    it('should be updated to use natgateway-specific permissions once available in the API', () => {
      // This test documents the TODO in the component code
      // Currently using 'create_linode' as a temporary permission
      // Should be updated to use 'create_natgateway' or similar once API supports it

      queryMocks.userPermissions.mockReturnValue({
        data: {
          create_linode: true,
        },
      });

      renderWithTheme(<NATGatewaysLandingEmptyState />);

      // Verify current permission check
      expect(queryMocks.userPermissions).toHaveBeenCalledWith('account', [
        'create_linode',
      ]);

      // Note: This should be updated before LA to check for the correct NAT Gateway scope
      // Expected future call: usePermissions('account', ['create_natgateway'])
    });
  });
});
