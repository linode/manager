import * as React from 'react';
import { APIError } from '@linode/api-v4/lib/types';
import { ExtendedRegion, useRegionsQuery } from 'src/queries/regions';

export interface DefaultProps {
  regionsData: ExtendedRegion[];
  regionsError?: APIError[];
  regionsLoading: boolean;
  regionsLastUpdated: number;
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
type Wrapper = (
  Component: React.ComponentType<DefaultProps>
) => React.FC<unknown>;
const regionsContainer: Wrapper = (
  Component: React.ComponentType<DefaultProps>
) => (props) => {
  const { data, error, isLoading, dataUpdatedAt } = useRegionsQuery();
  return (
    <Component
      regionsData={data ?? []}
      regionsLastUpdated={dataUpdatedAt}
      regionsError={error ?? undefined}
      regionsLoading={isLoading}
      {...props}
    />
  );
};

export default regionsContainer;
