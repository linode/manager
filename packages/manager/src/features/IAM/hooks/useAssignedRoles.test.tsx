import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import {
  userDefaultRolesFactory,
  userRolesFactory,
} from 'src/factories/userRoles';

import { useAssignedRoles } from './useAssignedRoles';

const {
  mockUseGetDefaultDelegationAccessQuery,
  mockUseUserRoles,
  mockUsePermissions,
  mockUseLocation,
} = vi.hoisted(() => ({
  mockUseGetDefaultDelegationAccessQuery: vi.fn(),
  mockUseUserRoles: vi.fn(),
  mockUsePermissions: vi.fn(),
  mockUseLocation: vi.fn(),
}));

vi.mock('@linode/queries', () => ({
  useGetDefaultDelegationAccessQuery: mockUseGetDefaultDelegationAccessQuery,
  useUserRoles: mockUseUserRoles,
}));

vi.mock('@tanstack/react-router', () => ({
  useLocation: mockUseLocation,
}));

vi.mock('./usePermissions', () => ({
  usePermissions: mockUsePermissions,
}));

describe('useAssignedRoles', () => {
  const mockDefaultRolesData = userDefaultRolesFactory.build();
  const mockUserRolesData = userRolesFactory.build();

  const mockPermissions = {
    is_account_admin: true,
  };

  const USER_ROLES_PATH = '/iam/users/testuser/roles';
  const DEFAULT_ROLES_PATH = '/iam/roles/defaults/roles';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUsePermissions.mockReturnValue({
      data: mockPermissions,
    });

    mockUseGetDefaultDelegationAccessQuery.mockReturnValue({
      data: mockDefaultRolesData,
      isLoading: false,
      error: null,
    });

    mockUseUserRoles.mockReturnValue({
      data: mockUserRolesData,
      isLoading: false,
      error: null,
    });
  });

  describe('when on default roles view', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        pathname: DEFAULT_ROLES_PATH,
      });
    });

    it('should return default roles data when on default roles view without username', () => {
      const { result } = renderHook(() => useAssignedRoles());

      expect(result.current).toEqual({
        assignedRoles: mockDefaultRolesData,
        assignedRolesLoading: false,
        assignedRolesError: null,
        isDefaultRolesView: true,
      });
    });
  });

  describe('when on user roles view', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        pathname: USER_ROLES_PATH,
      });
    });

    it('should return user roles data when on user roles view', () => {
      const { result } = renderHook(() => useAssignedRoles('testuser'));

      expect(result.current).toEqual({
        assignedRoles: mockUserRolesData,
        assignedRolesLoading: false,
        assignedRolesError: null,
        isDefaultRolesView: false,
      });
    });
  });
});
