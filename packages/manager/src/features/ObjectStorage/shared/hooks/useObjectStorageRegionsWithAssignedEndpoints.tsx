import { useRegionsQuery } from '@linode/queries';
import * as React from 'react';

import { useObjectStorageEndpointsQuery } from 'src/queries/object-storage/queries';

import { filterRegionsByEndpoints } from '../utils/utilities';

import type { APIError, ObjectStorageEndpoint, Region } from '@linode/api-v4';

export interface UseObjectStorageRegionsWithAssignedEndpointsOptions {
  enabled?: boolean;
}

export type AssignedObjectStorageEndpoint = ObjectStorageEndpoint & {
  s3_endpoint: string;
};

export interface UseObjectStorageRegionsWithAssignedEndpointsResult {
  errors: APIError[] | null;
  isError: boolean;
  isLoading: boolean;
  isPending: boolean;
  objectStorageEndpoints: AssignedObjectStorageEndpoint[] | undefined;
  regionsWithAssignedEndpoints: Region[] | undefined;
}

const isAssignedObjectStorageEndpoint = (
  endpoint: ObjectStorageEndpoint
): endpoint is AssignedObjectStorageEndpoint => endpoint.s3_endpoint !== null;

export function useObjectStorageRegionsWithAssignedEndpoints({
  enabled = true,
}: UseObjectStorageRegionsWithAssignedEndpointsOptions = {}): UseObjectStorageRegionsWithAssignedEndpointsResult {
  const {
    data: allRegions,
    error: regionsErrors,
    isLoading: areRegionsLoading,
    isPending,
  } = useRegionsQuery(enabled);
  const {
    data: allEndpoints,
    error: endpointsErrors,
    isLoading: areEndpointsLoading,
  } = useObjectStorageEndpointsQuery(enabled);

  const objectStorageEndpoints = React.useMemo(
    () => allEndpoints?.filter(isAssignedObjectStorageEndpoint) ?? [],
    [allEndpoints]
  );

  const regionsWithAssignedEndpoints = React.useMemo(
    () => filterRegionsByEndpoints(allRegions, objectStorageEndpoints),
    [allRegions, objectStorageEndpoints]
  );

  const errors =
    regionsErrors === null && endpointsErrors === null
      ? null
      : [...(regionsErrors ?? []), ...(endpointsErrors ?? [])];

  const isLoading = areRegionsLoading || areEndpointsLoading;
  const isError = Boolean(regionsErrors) || Boolean(endpointsErrors);

  return {
    regionsWithAssignedEndpoints,
    objectStorageEndpoints,
    errors,
    isLoading,
    isError,
    isPending,
  };
}
