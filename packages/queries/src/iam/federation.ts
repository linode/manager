import {
  createIdpCertificate,
  createIdpConfig,
  deleteIdpCertificate,
  deleteIdpConfig,
  getIdpCertificates,
  getIdpConfig,
  getIdpConfigs,
  getIdpConfigUsersExcluded,
  getIdpConfigUsersIncluded,
  updateIdpConfig,
  updateIdpConfigUsersExcluded,
  updateIdpConfigUsersIncluded,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  APIError,
  CreateIdpCertificatePayload,
  CreateIdpConfigPayload,
  Filter,
  GetIdpCertificatesParams,
  GetIdpConfigUsersParams,
  IdpCertificate,
  IdpConfig,
  IdpUser,
  Params,
  ResourcePage,
  UpdateIdpConfigPayload,
  UpdateIdpUsersPayload,
} from '@linode/api-v4';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export const federationQueries = createQueryKeys('idp-configs', {
  idpConfig: (euuid: string) => ({
    contextQueries: {
      certificates: {
        contextQueries: {
          paginated: (params: Params = {}) => ({
            queryFn: () => getIdpCertificates({ euuid, params }),
            queryKey: [params],
          }),
        },
        queryKey: null,
      },
      usersExcluded: {
        contextQueries: {
          paginated: (params: Params = {}, filter: Filter = {}) => ({
            queryFn: () => getIdpConfigUsersExcluded({ euuid, params, filter }),
            queryKey: [params, filter],
          }),
        },
        queryKey: null,
      },
      usersIncluded: {
        contextQueries: {
          paginated: (params: Params = {}, filter: Filter = {}) => ({
            queryFn: () => getIdpConfigUsersIncluded({ euuid, params, filter }),
            queryKey: [params, filter],
          }),
        },
        queryKey: null,
      },
    },
    queryFn: () => getIdpConfig(euuid),
    queryKey: [euuid],
  }),
  idpConfigs: {
    contextQueries: {
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getIdpConfigs({ params, filter }),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

/**
 * List IdP configurations (paginated)
 * - Purpose: Get all External Identity Provider configurations for the account.
 * - Scope: Account-level; for the initial release always returns at most one item.
 * - Audience: Account administrators managing SSO / external IdP settings.
 * - CRUD: GET /iam/idp-configs
 */
export const useGetIdpConfigsQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
): UseQueryResult<ResourcePage<IdpConfig>, APIError[]> =>
  useQuery({
    ...federationQueries.idpConfigs._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * Get a single IdP configuration
 * - Purpose: Retrieve the full External Identity Provider configuration for a specific euuid.
 * - Scope: Account-level; returns 404 when the configuration does not exist.
 * - Audience: Account administrators inspecting or editing an IdP configuration.
 * - CRUD: GET /iam/idp-configs/{euuid}
 */
export const useGetIdpConfigQuery = (
  euuid: string,
  enabled = true,
): UseQueryResult<IdpConfig, APIError[]> =>
  useQuery({
    ...federationQueries.idpConfig(euuid),
    enabled,
  });

/**
 * Create an IdP configuration
 * - Purpose: Creates the initial External Identity Provider configuration for the account.
 * - Scope: Only one configuration per account is supported at launch (409 if one already exists).
 * - Audience: Account administrators enabling SAML-based SSO for the first time.
 * - CRUD: POST /iam/idp-configs
 */
export const useCreateIdpConfigMutation = (): UseMutationResult<
  IdpConfig,
  APIError[],
  CreateIdpConfigPayload
> => {
  const queryClient = useQueryClient();
  return useMutation<IdpConfig, APIError[], CreateIdpConfigPayload>({
    mutationFn: createIdpConfig,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfigs.queryKey,
      });
    },
  });
};

/**
 * Update an IdP configuration
 * - Purpose: Updates top-level properties of an IdP configuration; saml must be sent in full when included.
 * - Scope: Account-level; returns 404 when the configuration does not exist.
 * - Audience: Account administrators modifying an existing IdP configuration.
 * - CRUD: PUT /iam/idp-configs/{euuid}
 */
export const useUpdateIdpConfigMutation = (
  euuid: string,
): UseMutationResult<IdpConfig, APIError[], UpdateIdpConfigPayload> => {
  const queryClient = useQueryClient();
  return useMutation<IdpConfig, APIError[], UpdateIdpConfigPayload>({
    mutationFn: (data) => updateIdpConfig(euuid, data),
    onSuccess(data) {
      queryClient.setQueryData(
        federationQueries.idpConfig(euuid).queryKey,
        data,
      );
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfigs.queryKey,
      });
    },
  });
};

/**
 * Delete an IdP configuration
 * - Purpose: Soft-deletes the IdP configuration; certificates and user lists are permanently removed.
 * - Scope: Account-level; returns 404 when the configuration does not exist.
 * - Audience: Account administrators decommissioning an IdP configuration.
 * - CRUD: DELETE /iam/idp-configs/{euuid}
 */
export const useDeleteIdpConfigMutation = (): UseMutationResult<
  object,
  APIError[],
  { euuid: string }
> => {
  const queryClient = useQueryClient();
  return useMutation<object, APIError[], { euuid: string }>({
    mutationFn: ({ euuid }) => deleteIdpConfig(euuid),
    onSuccess(_data, { euuid }) {
      queryClient.removeQueries({
        queryKey: federationQueries.idpConfig(euuid).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfigs.queryKey,
      });
    },
  });
};

/**
 * List excluded users for an IdP configuration (paginated)
 * - Purpose: Retrieve users excluded from SSO enforcement for a given IdP configuration.
 * - Scope: Returns 404 when the configuration does not exist; empty list when no users are excluded.
 * - Audience: Account administrators managing break-glass or contractor user exclusions.
 * - CRUD: GET /iam/idp-configs/{euuid}/users-excluded
 */
export const useGetIdpConfigUsersExcludedQuery = ({
  euuid,
  params = {},
  filter = {},
  enabled = true,
}: GetIdpConfigUsersParams & {
  enabled?: boolean;
}): UseQueryResult<ResourcePage<IdpUser>, APIError[]> =>
  useQuery({
    ...federationQueries
      .idpConfig(euuid)
      ._ctx.usersExcluded._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * List included users for an IdP configuration (paginated)
 * - Purpose: Retrieve users forced to use SSO for a given IdP configuration when enforce is disabled.
 * - Scope: Returns 404 when the configuration does not exist; empty list when no users are included.
 * - Audience: Account administrators piloting SSO for a subset of users before full enforcement.
 * - CRUD: GET /iam/idp-configs/{euuid}/users-included
 */
export const useGetIdpConfigUsersIncludedQuery = ({
  euuid,
  params = {},
  filter = {},
  enabled = true,
}: GetIdpConfigUsersParams & {
  enabled?: boolean;
}): UseQueryResult<ResourcePage<IdpUser>, APIError[]> =>
  useQuery({
    ...federationQueries
      .idpConfig(euuid)
      ._ctx.usersIncluded._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * Replace the excluded users list for an IdP configuration
 * - Purpose: Full replacement of the excluded users list; an empty array wipes the list.
 * - Scope: Returns 404 when the configuration does not exist; 400 if a username is already included.
 * - Audience: Account administrators managing break-glass or contractor exclusions.
 * - CRUD: PUT /iam/idp-configs/{euuid}/users-excluded
 */
export const useUpdateIdpConfigUsersExcludedMutation = (
  euuid: string,
): UseMutationResult<
  ResourcePage<IdpUser>,
  APIError[],
  UpdateIdpUsersPayload
> => {
  const queryClient = useQueryClient();
  return useMutation<ResourcePage<IdpUser>, APIError[], UpdateIdpUsersPayload>({
    mutationFn: (data) => updateIdpConfigUsersExcluded(euuid, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey:
          federationQueries.idpConfig(euuid)._ctx.usersExcluded.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfigs.queryKey,
      });
    },
  });
};

/**
 * Replace the included users list for an IdP configuration
 * - Purpose: Full replacement of the included users list; an empty array wipes the list.
 * - Scope: Returns 404 when the configuration does not exist; 400 if a username is already excluded.
 * - Audience: Account administrators selectively enforcing SSO before enabling it globally.
 * - CRUD: PUT /iam/idp-configs/{euuid}/users-included
 */
export const useUpdateIdpConfigUsersIncludedMutation = (
  euuid: string,
): UseMutationResult<
  ResourcePage<IdpUser>,
  APIError[],
  UpdateIdpUsersPayload
> => {
  const queryClient = useQueryClient();
  return useMutation<ResourcePage<IdpUser>, APIError[], UpdateIdpUsersPayload>({
    mutationFn: (data) => updateIdpConfigUsersIncluded(euuid, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey:
          federationQueries.idpConfig(euuid)._ctx.usersIncluded.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfigs.queryKey,
      });
    },
  });
};

/**
 * List certificates for an IdP configuration (paginated)
 * - Purpose: Retrieve SAML certificates associated with a given IdP configuration.
 * - Scope: Returns 404 when the configuration does not exist.
 * - Audience: Account administrators reviewing or rotating IdP signing certificates.
 * - CRUD: GET /iam/idp-configs/{euuid}/certificates
 */
export const useGetIdpCertificatesQuery = ({
  euuid,
  params = {},
  enabled = true,
}: GetIdpCertificatesParams & {
  enabled?: boolean;
}): UseQueryResult<ResourcePage<IdpCertificate>, APIError[]> =>
  useQuery({
    ...federationQueries
      .idpConfig(euuid)
      ._ctx.certificates._ctx.paginated(params),
    enabled,
    placeholderData: keepPreviousData,
  });

/**
 * Add a certificate to an IdP configuration
 * - Purpose: Attach a new SAML signing certificate to the IdP configuration.
 * - Scope: Returns 404 when the config does not exist; 400 for invalid/empty cert; 409 for duplicates.
 * - Audience: Account administrators rotating or adding IdP certificates.
 * - CRUD: POST /iam/idp-configs/{euuid}/certificates
 */
export const useCreateIdpCertificateMutation = (
  euuid: string,
): UseMutationResult<
  IdpCertificate,
  APIError[],
  CreateIdpCertificatePayload
> => {
  const queryClient = useQueryClient();
  return useMutation<IdpCertificate, APIError[], CreateIdpCertificatePayload>({
    mutationFn: (data) => createIdpCertificate(euuid, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfig(euuid)._ctx.certificates.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfig(euuid).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfigs.queryKey,
      });
    },
  });
};

/**
 * Delete a certificate from an IdP configuration
 * - Purpose: Remove a specific SAML certificate from the IdP configuration.
 * - Scope: Returns 404 when the config or certificate does not exist; 400 if removing it would leave zero valid certs.
 * - Audience: Account administrators decommissioning expired or rotated certificates.
 * - CRUD: DELETE /iam/idp-configs/{euuid}/certificates/{id}
 */
export const useDeleteIdpCertificateMutation = (
  euuid: string,
): UseMutationResult<object, APIError[], { id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<object, APIError[], { id: string }>({
    mutationFn: ({ id }) => deleteIdpCertificate(euuid, id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfig(euuid)._ctx.certificates.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfig(euuid).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: federationQueries.idpConfigs.queryKey,
      });
    },
  });
};
