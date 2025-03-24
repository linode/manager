import { useNavigate, useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import type { APIError } from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  LinkProps,
  ValidateUseParamsResult,
} from '@tanstack/react-router';
import type { MigrationRouteTree } from 'src/routes';

type ExtractKeys<T> = T extends object ? keyof T : never;
type ParamsTypeKeys = ExtractKeys<ValidateUseParamsResult<MigrationRouteTree>>;
type SingleIdQueryHook<TEntity> = (
  id: number | string,
  enabled?: boolean
) => UseQueryResult<TEntity, APIError[]>;

type DualIdQueryHook<TEntity> = (
  primaryId: number | string,
  secondaryId: number | string,
  enabled?: boolean
) => UseQueryResult<TEntity, APIError[]>;

type QueryHook<TEntity> = DualIdQueryHook<TEntity> | SingleIdQueryHook<TEntity>;

interface Props<TEntity> {
  enabled?: boolean;
  paramKey: ParamsTypeKeys;
  queryHook: QueryHook<TEntity>;
  redirectToOnNotFound: LinkProps['to'];
  secondaryParamKey?: ParamsTypeKeys;
}

interface Props<TEntity> {
  /**
   * If false, the query will not be run.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * The key of the parameter in the URL that will be used to fetch the entity.
   * ex: 'volumeId' for `/volumes/$volumeId`
   */
  paramKey: ParamsTypeKeys;
  /**
   * The query hook to fetch the entity.
   */
  queryHook: QueryHook<TEntity>;
  /**
   * The route to redirect to if the entity is not found.
   */
  redirectToOnNotFound: LinkProps['to'];
  /**
   * The key of the secondary parameter in the URL that will be used to fetch the entity.
   * ex: 'subnetId' for `/vpcs/$vpcId/subnets/$subnetId`
   */
  secondaryParamKey?: ParamsTypeKeys;
}

/**
 * This hook is used to fetch data for a dialog routed via Tanstack Router (Drawer, Modal, etc.)
 *
 * It can't be used outside of a feature that hasn't been migrated to Tanstack Router.
 * It will return the data for the entity that the dialog is going to target, including its loading state.
 * It is usually used on a feature landing page, where the dialog is triggered by a route change.
 *
 * It should be instantiated as follow:
 *
 * const {
 *  data: {entity},
 *  isFetching: isFetchingEntity,
 * } = useDialogRouteGuard({
 *   enabled: !!params.entityId,
 *   paramKey: 'entityId',
 *   queryHook: useEntityQuery, // ex: useVolumeQuery
 *   redirectToOnNotFound: '/entities', // ex: '/volumes'
 * });
 */
export const useDialogData = <TEntity>({
  enabled = true,
  paramKey,
  queryHook,
  redirectToOnNotFound,
  secondaryParamKey,
}: Props<TEntity>) => {
  const params = useParams({ strict: false });
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const primaryId = params[paramKey as keyof typeof params];
  const secondaryId = secondaryParamKey
    ? params[secondaryParamKey as keyof typeof params]
    : undefined;

  // Ensure IDs are actually valid values, not just truthy
  const isValidPrimaryId =
    typeof primaryId === 'string' || typeof primaryId === 'number';
  const isValidSecondaryId =
    typeof secondaryId === 'string' || typeof secondaryId === 'number';
  const shouldRunQuery =
    enabled && isValidPrimaryId && (!secondaryParamKey || isValidSecondaryId);

  const query = secondaryParamKey
    ? (queryHook as DualIdQueryHook<TEntity>)(
        primaryId as number | string,
        secondaryId as number | string,
        shouldRunQuery
      )
    : (queryHook as SingleIdQueryHook<TEntity>)(
        primaryId as number | string,
        shouldRunQuery
      );

  React.useEffect(() => {
    if (enabled && !query.isLoading && !query.data) {
      enqueueSnackbar('Not found!', { variant: 'error' });
      navigate({
        params: undefined,
        to: redirectToOnNotFound,
      });
    }
  }, [
    enabled,
    query.isLoading,
    query.data,
    enqueueSnackbar,
    navigate,
    redirectToOnNotFound,
  ]);

  return {
    data: query.data,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
  };
};
