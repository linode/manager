import { Autocomplete } from '@linode/ui';
import React from 'react';

import type { AlertFilterKey } from './types';

interface EndpointOption {
  label: string;
}
export interface AlertsEndpointFilterProps {
  /**
   * List of object storage endpoints.
   */
  endpointOptions: string[];
  /**
   * Callback to publish the selected engine type
   */
  handleFilterChange: (
    endpoints: string[] | undefined,
    type: AlertFilterKey
  ) => void;
}

export const AlertsEndpointFilter = React.memo(
  (props: AlertsEndpointFilterProps) => {
    const { handleFilterChange: handleSelection, endpointOptions } = props;
    const [selectedEndpoints, setSelectedEndpoints] = React.useState<
      EndpointOption[]
    >([]);
    const endpointBuiltOptions: EndpointOption[] = endpointOptions.map(
      (option) => ({
        label: option,
      })
    );

    const handleFilterSelection = React.useCallback(
      (_: React.SyntheticEvent, endpoints: EndpointOption[]) => {
        setSelectedEndpoints(endpoints);
        handleSelection(
          endpoints.length ? endpoints.map(({ label }) => label) : undefined,
          'endpoint'
        );
      },
      [handleSelection]
    );
    return (
      <Autocomplete
        autoHighlight
        clearOnBlur
        isOptionEqualToValue={(option, value) => option.label === value.label}
        label="Endpoints"
        limitTags={1}
        multiple
        onChange={handleFilterSelection}
        options={endpointBuiltOptions}
        placeholder="Select Endpoints"
        textFieldProps={{
          hideLabel: true,
        }}
        value={selectedEndpoints}
      />
    );
  }
);
