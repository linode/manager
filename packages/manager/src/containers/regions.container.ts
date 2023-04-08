import * as React from 'react';
import { APIError } from '@linode/api-v4/lib/types';
import { useRegionsQuery } from 'src/queries/regions';
import { Region } from '@linode/api-v4/lib/regions';

export interface RegionsProps {
  regionsData: Region[];
  regionsError?: APIError[];
  regionsLoading: boolean;
}

/**
 * Simple wrapper around our Regions query. Originally this was a Redux connect
 * function; it is being retained in this way because there are still a few places
 * where regions data is needed in class components, some of which are difficult
 * or problematic to refactor.
 *
 * This file can be deleted once the existing class components have been removed or converted
 * to FCs (current list is: SelectPlanPanel/SelectPlanQuantityPanel; NodeBalancerCreate; LinodeSelect;
 * LinodeCreate/LinodeCreateContainer). Please do NOT use this wrapper for any future components; if a class
 * component is needed, best practice is to include an FC container above it (the routing level often works well)
 * and pass regions through there.
 */
export const withRegions = <Props>(
  Component: React.ComponentType<Props & RegionsProps>
) => (props: Props) => {
  const { data, isLoading, error } = useRegionsQuery();
  return React.createElement(Component, {
    regionsData: data ?? [],
    regionsLoading: isLoading,
    regionsError: error ?? undefined,
    ...props,
  });
};
