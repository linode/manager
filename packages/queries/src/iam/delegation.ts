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
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  Account,
  APIError,
  ChildAccount,
  ChildAccountWithDelegates,
  GetChildAccountDelegatesParams,
  GetChildAccountsIamParams,
  GetDelegatedChildAccountsForUserParams,
  IamUserRoles,
  Params,
  ResourcePage,
  Token,
} from '@linode/api-v4';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export const delegationQueries = createQueryKeys('delegation', {
  childAccounts: ({ params, users }: GetChildAccountsIamParams) => ({
    queryFn: () => getChildAccountsIam({ params, users }),
    queryKey: [params],
  }),
  delegatedChildAccountsForUser: ({
    username,
    params,
  }: GetDelegatedChildAccountsForUserParams) => ({
    queryFn: () => getDelegatedChildAccountsForUser({ username, params }),
    queryKey: [username, params],
  }),
  childAccountDelegates: ({
    euuid,
    params,
  }: GetChildAccountDelegatesParams) => ({
    queryFn: () => getChildAccountDelegates({ euuid, params }),
    queryKey: [euuid, params],
  }),
  myDelegatedChildAccounts: {
    contextQueries: {
      all: (params: Params) => ({
        queryFn: () => getAllMyDelegatedChildAccounts(params),
        queryKey: [params],
      }),
      paginated: (params: Params) => ({
        queryFn: () => getMyDelegatedChildAccounts({ params }),
        queryKey: [params],
      }),
    },
    queryKey: null,
  },
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
 * List all child accounts (gets all child accounts from customerParentChild table for the parent account)
 * - Purpose: Get ALL child accounts under a parent account, optionally with their delegate users
 * - Scope: All child accounts for the parent (inventory view)
 * - Audience: Parent account administrators managing delegation.
 * - CRUD: GET /iam/delegation/child-accounts?users=true (optional)
 */
export const useGetChildAccountsQuery = ({
  params,
  users,
}: GetChildAccountsIamParams): UseQueryResult<
  ResourcePage<ChildAccount | ChildAccountWithDelegates>,
  APIError[]
> => {
  return useQuery({
    ...delegationQueries.childAccounts({ params, users }),
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
}: GetDelegatedChildAccountsForUserParams): UseQueryResult<
  ResourcePage<ChildAccount>,
  APIError[]
> => {
  return useQuery({
    ...delegationQueries.delegatedChildAccountsForUser({ username, params }),
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
  ResourcePage<string[]>,
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
  { data: string[]; euuid: string }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    ResourcePage<string>,
    APIError[],
    { data: string[]; euuid: string }
  >({
    mutationFn: updateChildAccountDelegates,
    onSuccess(_data, { euuid }) {
      // Invalidate all child account delegates
      queryClient.invalidateQueries({
        queryKey: delegationQueries.childAccountDelegates({ euuid }).queryKey,
      });
    },
  });
};

/**
 * List my delegated child accounts (gets child accounts where user has view_child_account permission).
 * - Purpose: Get child accounts that the current authenticated user can manage via delegation.
 * - Scope: Only child accounts where the caller has an active delegate and required view permission.
 * - Audience: Needing to return accounts the caller can actually access.
 * - CRUD: GET /iam/delegation/profile/child-accounts
 */
export const useGetMyDelegatedChildAccountsQuery = (
  params: Params,
): UseQueryResult<ResourcePage<Account>, APIError[]> => {
  return useQuery({
    ...delegationQueries.myDelegatedChildAccounts._ctx.paginated(params),
  });
};

/**
 * List all my delegated child accounts (fetches all pages of child accounts where user has view_child_account permission)
 * - Purpose: Retrieve the full list of child accounts the current caller can manage via delegation, across all pages.
 * - Scope: Only child accounts where the caller has an active delegate and required view permission; returns all results, not paginated.
 * - Audience: Callers needing the complete set of accessible accounts for the current user.
 * - Data: Account[] (limited profile fields) for `GET /iam/delegation/profile/child-accounts` (all pages).
 * - Usage: Pass `enabled` to control query activation (e.g., only if IAM Delegation is enabled).
 */
export const useAllListMyDelegatedChildAccountsQuery = ({
  params = {},
  enabled = true,
}) => {
  return useQuery({
    enabled,
    ...delegationQueries.myDelegatedChildAccounts._ctx.all(params),
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
export const useGetDefaultDelegationAccessQuery = (): UseQueryResult<
  IamUserRoles,
  APIError[]
> => {
  return useQuery<IamUserRoles, APIError[]>({
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

/**
 * Fetches all my delegated child accounts for the current user (all pages).
 */
const getAllMyDelegatedChildAccounts = (_params: Params = {}) =>
  getAll<Account>((params) =>
    getMyDelegatedChildAccounts({ params: { ...params, ..._params } }),
  )().then((data) => data.data);
