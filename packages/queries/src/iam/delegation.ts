import {
  generateChildAccountToken,
  getChildAccountProfile,
  getDefaultDelegationAccess,
  listChildAccountDelegates,
  listChildAccounts,
  listDelegatedChildAccountsForUser,
  listMyDelegatedChildAccountProfiles,
  updateChildAccountDelegates,
  updateDefaultDelegationAccess,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  APIError,
  IamUserRoles,
  Params,
  ResourcePage,
  Token,
} from '@linode/api-v4';

export const delegationQueries = createQueryKeys('delegation', {
  lists: {
    contextQueries: {
      childAccounts: ({ params }: { params: Params }) => ({
        queryFn: () => listChildAccounts({ params }),
        queryKey: [params],
      }),
      delegatedChildAccountsForUser: ({
        username,
        params,
      }: {
        params: Params;
        username: string;
      }) => ({
        queryFn: () => listDelegatedChildAccountsForUser({ username, params }),
        queryKey: [username, params],
      }),
      childAccountDelegates: ({
        euuid,
        params,
      }: {
        euuid: string;
        params: Params;
      }) => ({
        queryFn: () => listChildAccountDelegates({ euuid, params }),
        queryKey: [euuid, params],
      }),
      myDelegatedChildAccountProfiles: ({ params }: { params: Params }) => ({
        queryFn: () => listMyDelegatedChildAccountProfiles({ params }),
        queryKey: [params],
      }),
      childAccountProfile: ({ euuid }: { euuid: string }) => ({
        queryFn: () => getChildAccountProfile({ euuid }),
        queryKey: [euuid],
      }),
      defaultAccess: () => ({
        queryFn: () => getDefaultDelegationAccess(),
        queryKey: ['defaultAccess'],
      }),
    },
    queryKey: null,
  },
});

/**
 * List all child accounts
 * - Purpose: Inventory child accounts under the caller’s parent account.
 * - Scope: All child accounts for the parent; not filtered by any user’s delegation.
 * - Audience: Parent account administrators managing delegation.
 * - Data: Page<ChildAccount>; optionally Page<ChildAccountWithUsers> when `users=true` (use `params.includeDelegates` to set).
 */
export const useListChildAccountsQuery = ({
  params,
}: {
  params: Params;
  withUsers: boolean;
}) => {
  return useQuery({
    ...delegationQueries.lists._ctx.childAccounts({
      params,
    }),
  });
};

/**
 * List delegated child accounts for a user
 * - Purpose: Which child accounts the specified parent user is delegated to manage.
 * - Scope: Subset filtered by `username`; only where that user has an active delegate and required view permission.
 * - Audience: Parent account administrators auditing a user’s delegated access.
 * - Data: Page<ChildAccount> for `GET /iam/delegation/users/:username/child-accounts`.
 */
export const useListDelegatedChildAccountsForUserQuery = ({
  username,
  params,
}: {
  params: Params;
  username: string;
}) => {
  return useQuery({
    ...delegationQueries.lists._ctx.delegatedChildAccountsForUser({
      username,
      params,
    }),
  });
};

/**
 * List delegates for a child account
 * - Purpose: Which parent users are currently delegated to manage this child account.
 * - Scope: Delegates tied to `euuid`; only active delegate users and active parent user records included.
 * - Audience: Parent account administrators managing delegates for a specific child account.
 * - Data: Page<string[]> (usernames) for `GET /iam/delegation/child-accounts/:euuid/users`.
 */
export const useListChildAccountDelegatesQuery = ({
  euuid,
  params,
}: {
  euuid: string;
  params: Params;
}) => {
  return useQuery({
    ...delegationQueries.lists._ctx.childAccountDelegates({
      euuid,
      params,
    }),
  });
};

/**
 * Update delegates for a child account
 * - Purpose: Replace the full set of parent users delegated to a child account.
 * - Scope: Requires parent-account context, valid parent→child relationship, and authorization; payload must be non-empty.
 * - Audience: Parent account administrators assigning/removing delegates for a child account.
 * - Data: Request usernames (**full replacement**); Response Page<string[]> of resulting delegate usernames for `PUT /.../:euuid/users`.
 */
export const useUpdateChildAccountDelegatesQuery = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ResourcePage<string[]>,
    APIError[],
    { data: string[]; euuid: string }
  >({
    mutationFn: ({ data, euuid }) =>
      updateChildAccountDelegates({ data, euuid }),
    onSuccess() {
      // Invalidate all child account delegates
      queryClient.invalidateQueries({
        queryKey: delegationQueries.lists._ctx.childAccountDelegates._def,
      });
    },
  });
};

/**
 * List my delegated child accounts (profiles)
 * - Purpose: Which child accounts the current caller can manage via delegation.
 * - Scope: Only child accounts where the caller has an active delegate and required view permission.
 * - Audience: Any caller viewing “my delegated access.”
 * - Data: Page<Account> (limited profile fields) for `GET /iam/delegation/profile/child-accounts`.
 */
export const useListMyDelegatedChildAccountProfilesQuery = ({
  params,
}: {
  params: Params;
}) => {
  return useQuery({
    ...delegationQueries.lists._ctx.myDelegatedChildAccountProfiles({
      params,
    }),
  });
};

/**
 * Get child account profile
 * - Purpose: Retrieve profile information for a specific child account by EUUID.
 * - Scope: Single child account identified by `euuid`; subject to required grants.
 * - Audience: Callers needing basic child account info in the delegation context.
 * - Data: Account (limited profile fields) for `GET /iam/delegation/profile/child-accounts/:euuid`.
 */
export const useGetChildAccountProfileQuery = ({
  euuid,
}: {
  euuid: string;
}) => {
  return useQuery({
    ...delegationQueries.lists._ctx.childAccountProfile({ euuid }),
  });
};

/**
 * Create child account token
 * - Purpose: Create a short‑lived bearer token to act on a child account as a proxy/delegate.
 * - Scope: For a parent user delegated on the target child account identified by `euuid`.
 * - Audience: Clients that need temporary auth to perform actions in the child account.
 * - Data: Token for `POST /iam/delegation/child-accounts/:euuid/token`.
 */
export const useGenerateChildAccountTokenQuery = () => {
  return useMutation<Token, APIError[], { euuid: string }>({
    mutationFn: ({ euuid }) => generateChildAccountToken({ euuid }),
  });
};

/**
 * Get default delegation access
 * - Purpose: View the default access (roles/permissions) applied to new delegates on this child account.
 * - Scope: Child-account context; restricted to authorized, non-delegate callers.
 * - Audience: Child account administrators reviewing default delegate access.
 * - Data: IamUserRoles with `account_access` and `entity_access` for `GET /iam/delegation/default-role-permissions`.
 */
export const useGetDefaultDelegationAccessQuery = () => {
  return useQuery<IamUserRoles, APIError[]>({
    ...delegationQueries.lists._ctx.defaultAccess(),
  });
};

/**
 * Update default delegation access
 * - Purpose: Update the default access (roles/permissions) applied to new delegates on this child account.
 * - Scope: Child-account context; restricted to authorized, non-delegate callers; validates entity IDs.
 * - Audience: Child account administrators configuring default delegate access.
 * - Data: Request/Response IamUserRoles for `PUT /iam/delegation/default-role-permissions`.
 */
export const useUpdateDefaultDelegationAccessQuery = () => {
  const queryClient = useQueryClient();
  return useMutation<IamUserRoles, APIError[], IamUserRoles>({
    mutationFn: updateDefaultDelegationAccess,
    onSuccess(data) {
      queryClient.setQueryData(
        delegationQueries.lists._ctx.defaultAccess().queryKey,
        data,
      );
    },
  });
};
