import {
  generateChildAccountToken,
  getChildAccountDelegates,
  getChildAccountsIam,
  getDefaultDelegationAccess,
  getDelegatedChildAccount,
  getDelegatedChildAccountsForUser,
  getMyDelegatedChildAccounts,
  updateChildAccountDelegates,
  updateDefaultDelegationAccess,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  Account,
  APIError,
  ChildAccount,
  ChildAccountWithDelegates,
  GetChildAccountDelegatesParams,
  GetChildAccountsIamParams,
  GetDelegatedChildAccountsForUserParams,
  GetMyDelegatedChildAccountsParams,
  IamUserRoles,
  ResourcePage,
  Token,
  UpdateChildAccountDelegatesParams,
} from '@linode/api-v4';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export const delegationQueries = createQueryKeys('delegation', {
  childAccounts: ({
    params,
    users,
    enabled = true,
    filter = {},
  }: GetChildAccountsIamParams) => ({
    queryFn: () => getChildAccountsIam({ params, users, enabled, filter }),
    queryKey: [params, users, enabled, filter],
  }),
  delegatedChildAccountsForUser: ({
    username,
    params,
    enabled = true,
    filter = {},
  }: GetDelegatedChildAccountsForUserParams) => ({
    queryFn: () =>
      getDelegatedChildAccountsForUser({ username, params, enabled, filter }),
    queryKey: [username, params, enabled, filter],
  }),
  childAccountDelegates: ({
    euuid,
    params,
  }: GetChildAccountDelegatesParams) => ({
    queryFn: () => getChildAccountDelegates({ euuid, params }),
    queryKey: [euuid, params],
  }),
  myDelegatedChildAccounts: ({
    params,
    filter = {},
  }: GetMyDelegatedChildAccountsParams) => ({
    queryFn: () =>
      getMyDelegatedChildAccounts({
        params,
        filter,
      }),
    queryKey: [params, filter],
  }),
  delegatedChildAccount: (euuid: string) => ({
    queryFn: () => getDelegatedChildAccount({ euuid }),
    queryKey: [euuid],
  }),
  defaultAccess: {
    queryFn: getDefaultDelegationAccess,
    queryKey: null,
  },
});

/**
 * List child accounts (paginated) - gets child accounts with server-side pagination
 * - Purpose: Get child accounts under a parent account with pagination
 * - Scope: Paginated child accounts for the parent
 * - Audience: Parent account administrators managing delegation with pagination.
 * - CRUD: GET /iam/delegation/child-accounts?users=true (optional)
 */
export const useGetChildAccountsQuery = ({
  params,
  users,
  filter,
  enabled = true,
}: GetChildAccountsIamParams & { enabled?: boolean }): UseQueryResult<
  ResourcePage<ChildAccount | ChildAccountWithDelegates>,
  APIError[]
> => {
  return useQuery({
    ...delegationQueries.childAccounts({ params, users, filter }),
    placeholderData: keepPreviousData,
    enabled,
  });
};

/**
 * List delegated child accounts for a user
 * - Purpose: Get child accounts that a SPECIFIC user is delegated to manage (which child accounts a specific user can access)
 * - Scope: Filtered by username - only child accounts where that user has active delegation
 * - Audience: Parent account administrators auditing a user’s delegated access.
 * - CRUD: GET /iam/delegation/users/:username/child-accounts
 */
export const useGetDelegatedChildAccountsForUserQuery = ({
  username,
  params,
  filter,
  enabled = true,
}: GetDelegatedChildAccountsForUserParams & {
  enabled?: boolean;
}): UseQueryResult<ResourcePage<ChildAccount>, APIError[]> => {
  return useQuery({
    ...delegationQueries.delegatedChildAccountsForUser({
      username,
      params,
      filter,
    }),
    placeholderData: keepPreviousData,
    enabled,
  });
};

/**
 * List delegates for a child account
 * - Purpose: Get all delegate users for a SPECIFIC child account
 * - Scope: Filtered by child account euuid - only users delegated to that account
 * - Audience: Parent account administrators managing delegates for a SPECIFIC child account.
 * - CRUD: GET /iam/delegation/child-accounts/:euuid/users
 */
export const useGetChildAccountDelegatesQuery = ({
  euuid,
  params,
}: GetChildAccountDelegatesParams): UseQueryResult<
  ResourcePage<string>,
  APIError[]
> => {
  return useQuery({
    ...delegationQueries.childAccountDelegates({
      euuid,
      params,
    }),
  });
};

/**
 * Update delegates for a child account
 * - Purpose: Replace the full set of parent users delegated to a child account.
 * - Scope: Requires parent-account context, valid parent→child relationship, and authorization; payload must be non-empty.
 * - Audience: Parent account administrators assigning/removing delegates for a SPECIFIC child account.
 * - CRUD: PUT /iam/delegation/child-accounts/:euuid/users
 */
export const useUpdateChildAccountDelegatesQuery = (): UseMutationResult<
  ResourcePage<string>,
  APIError[],
  UpdateChildAccountDelegatesParams
> => {
  const queryClient = useQueryClient();
  return useMutation<
    ResourcePage<string>,
    APIError[],
    UpdateChildAccountDelegatesParams
  >({
    mutationFn: (data) => updateChildAccountDelegates(data),
    onSuccess(_data, { euuid }) {
      // Invalidate all child accounts
      queryClient.invalidateQueries({
        queryKey: delegationQueries.childAccounts({ params: {}, users: true })
          .queryKey,
      });
      // Invalidate all child account delegates
      queryClient.invalidateQueries({
        queryKey: delegationQueries.childAccountDelegates({ euuid }).queryKey,
      });
      // Invalidate all delegated child accounts for a given user
      queryClient.invalidateQueries({
        queryKey: delegationQueries.delegatedChildAccountsForUser._def,
      });
      // Invalidate all my delegated child accounts since delegation may have changed
      queryClient.invalidateQueries({
        queryKey: delegationQueries.myDelegatedChildAccounts._def,
      });
    },
  });
};

/**
 * List my delegated child accounts (gets child accounts where user has view_child_account permission).
 * - Purpose: Get child accounts that the current authenticated user can manage via delegation with pagination.
 * - Scope: Only child accounts where the caller has an active delegate and required view permission.
 * - Audience: Needing to return accounts the caller can actually access with pagination.
 * - CRUD: GET /iam/delegation/profile/child-accounts
 */
export const useMyDelegatedChildAccountsQuery = ({
  params = {},
  filter = {},
  enabled = true,
}: GetMyDelegatedChildAccountsParams & {
  enabled?: boolean;
}): UseQueryResult<ResourcePage<Account>, APIError[]> => {
  return useQuery({
    enabled,
    ...delegationQueries.myDelegatedChildAccounts({ params, filter }),
  });
};

/**
 * Get child account
 * - Purpose: Get SPECIFIC child account that the current authenticated user can manage via delegation.
 * - Scope: Only child accounts where the caller has active delegation and required view permission.
 * - Audience: The current user needing to see which accounts they can actually access.
 * - CRUD: GET /iam/delegation/profile/child-accounts/:euuid
 */
export const useGetChildAccountQuery = (
  euuid: string,
): UseQueryResult<Account, APIError[]> => {
  return useQuery({
    ...delegationQueries.delegatedChildAccount(euuid),
  });
};

/**
 * Create child account token
 * - Purpose: Create a short‑lived bearer token to act on a child account as a proxy/delegate.
 * - Scope: For a parent user delegated on the target child account identified by `euuid`.
 * - Audience: Clients that need temporary auth to perform actions in the child account.
 * - Data: Token for `POST /iam/delegation/child-accounts/:euuid/token`.
 */
export const useGenerateChildAccountTokenQuery = (): UseMutationResult<
  Token,
  APIError[],
  { euuid: string }
> => {
  return useMutation<Token, APIError[], { euuid: string }>({
    mutationFn: generateChildAccountToken,
  });
};

/**
 * Get default delegation access
 * - Purpose: View the default access (roles/permissions) applied to new delegates on this child account.
 * - Scope: Child-account context; restricted to authorized, non-delegate callers.
 * - Audience: Child account administrators reviewing default delegate access.
 * - Data: IamUserRoles with `account_access` and `entity_access` for `GET /iam/delegation/default-role-permissions`.
 */
export const useGetDefaultDelegationAccessQuery = ({
  enabled = true,
}): UseQueryResult<IamUserRoles, APIError[]> => {
  return useQuery<IamUserRoles, APIError[]>({
    enabled,
    ...delegationQueries.defaultAccess,
  });
};

/**
 * Update default delegation access
 * - Purpose: Update the default access (roles/permissions) applied to new delegates on this child account.
 * - Scope: Child-account context; restricted to authorized, non-delegate callers; validates entity IDs.
 * - Audience: Child account administrators configuring default delegate access.
 * - Data: Request/Response IamUserRoles for `PUT /iam/delegation/default-role-permissions`.
 */
export const useUpdateDefaultDelegationAccessQuery = (): UseMutationResult<
  IamUserRoles,
  APIError[],
  IamUserRoles
> => {
  const queryClient = useQueryClient();
  return useMutation<IamUserRoles, APIError[], IamUserRoles>({
    mutationFn: updateDefaultDelegationAccess,
    onSuccess(data) {
      queryClient.setQueryData(delegationQueries.defaultAccess.queryKey, data);
    },
  });
};
