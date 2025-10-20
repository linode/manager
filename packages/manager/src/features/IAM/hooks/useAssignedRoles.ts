import {
  useGetDefaultDelegationAccessQuery,
  useUserRoles,
} from '@linode/queries';
import { useLocation } from '@tanstack/react-router';

import { usePermissions } from './usePermissions';

/**
 * Custom hook for fetching assigned roles data based on the current view context.
 *
 * This hook automatically determines whether to fetch default delegation access data
 * or user-specific roles data based on the current pathname. It supports both:
 * - Default roles view: Fetches default delegation access for all users
 * - User roles view: Fetches roles assigned to a specific user
 *
 * @param username - Optional username for fetching user-specific roles.
 *                   Not required for default roles view.
 * @returns Object containing:
 *   - assignedRoles: The fetched roles data
 *   - assignedRolesLoading: Loading state
 *   - assignedRolesError: Error state if fetch fails
 *   - isDefaultRolesView: Boolean indicating current view context
 */
export const useAssignedRoles = (username?: string) => {
  const { data: permissions } = usePermissions('account', ['is_account_admin']);
  const location = useLocation();
  // Check if we're on the default roles view based on the current path
  const isDefaultRolesView = location.pathname.includes(
    '/iam/roles/defaults/roles'
  );
  // TODO: use useIsDefaultDelegationRolesForChildAccount when available
  const shouldFetchDefaultRoles = isDefaultRolesView && !username;
  const shouldFetchUserRoles =
    !isDefaultRolesView && permissions?.is_account_admin;

  const {
    data: defaultRolesData,
    isLoading: defaultRolesLoading,
    error: defaultRolesError,
  } = useGetDefaultDelegationAccessQuery(shouldFetchDefaultRoles);

  const {
    data: userRolesData,
    isLoading: userRolesLoading,
    error: userRolesError,
  } = useUserRoles(username ?? '', shouldFetchUserRoles);

  // Return the appropriate data based on the view
  if (isDefaultRolesView) {
    return {
      assignedRoles: defaultRolesData,
      assignedRolesLoading: defaultRolesLoading,
      assignedRolesError: defaultRolesError,
      isDefaultRolesView: true,
    };
  }

  return {
    assignedRoles: userRolesData,
    assignedRolesLoading: userRolesLoading,
    assignedRolesError: userRolesError,
    isDefaultRolesView: false,
  };
};
