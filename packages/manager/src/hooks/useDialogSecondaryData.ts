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

interface Props<TEntity> {
  /**
   * The secondary paramter key in the URL that will be used to fetch the entity
   * ex: subnetId for `/vpcs/$vpcId/subnets/$subnetId`
   */
  childParamKey: ParamsTypeKeys;
  /**
   *
   * The query hook to fetch the entity.
   */
  childQueryHook: (
    id: number | string | undefined,
    childId: number | string | undefined,
    enabled?: boolean
  ) => UseQueryResult<TEntity, APIError[]>;
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
   * The route to redirect to if the entity is not found.
   */
  redirectToOnNotFound: LinkProps['to'];
}

/**
 * This hook is very similar to useDialogData, but requires a secondary param key to fetch
 * dialog data (ex: fetching a single subnet requires a VPC id and a Subnet id).
 *
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
export const useDialogSecondaryData = <TEntity>({
  childParamKey,
  childQueryHook,
  enabled = true,
  paramKey,
  redirectToOnNotFound,
}: Props<TEntity>) => {
  const params = useParams({ strict: false });
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const query = childQueryHook(
    params[paramKey as keyof typeof params],
    params[childParamKey as keyof typeof params],
    enabled
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
