import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useLoadBalancerRoutesInfiniteQuery } from 'src/queries/aglb/routes';
import { pluralize } from 'src/utilities/pluralize';

import type { Filter, Route } from '@linode/api-v4';

interface Props {
  /**
   * Error text to display as helper text under the TextField. Useful for validation errors.
   */
  errorText?: string;
  /**
   * The TextField label
   * @default Route
   */
  label?: string;
  /**
   * The id of the Load Balancer you want to show certificates for
   */
  loadbalancerId: number;
  /**
   * Called when the value of the Select changes
   */
  onChange: (certificate: Route | null) => void;
  /**
   * The id of the selected Route
   */
  value: number;
}

export const RouteSelect = (props: Props) => {
  const { errorText, label, loadbalancerId, onChange, value } = props;

  const [inputValue, setInputValue] = React.useState<string>('');

  const filter: Filter = {};

  if (inputValue) {
    filter['label'] = { '+contains': inputValue };
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useLoadBalancerRoutesInfiniteQuery(loadbalancerId, filter);

  const routes = data?.pages.flatMap((page) => page.data);

  const selectedRoute = routes?.find((route) => route.id === value) ?? null;

  const onScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
        listboxNode.scrollHeight &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  };

  return (
    <Autocomplete
      ListboxProps={{
        onScroll,
      }}
      getOptionLabel={({ label, protocol, rules }) =>
        `${label} (${protocol.toUpperCase()} - ${pluralize(
          'rule',
          'rules',
          rules.length
        )})`
      }
      onInputChange={(_, value, reason) => {
        if (reason === 'input') {
          setInputValue(value);
        }
      }}
      errorText={error?.[0].reason ?? errorText}
      inputValue={selectedRoute ? selectedRoute.label : inputValue}
      label={label ?? 'Route'}
      loading={isLoading}
      noMarginTop
      onChange={(e, value) => onChange(value)}
      options={routes ?? []}
      placeholder="Select a Route"
      value={selectedRoute}
    />
  );
};
