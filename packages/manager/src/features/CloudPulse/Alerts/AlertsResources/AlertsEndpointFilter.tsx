import { Autocomplete } from '@linode/ui';
import React from 'react';

import type { AlertFilterKey } from './types';

export interface AlertsEndpointFilterProps {
  /**
   *
   */
  endpointOptions: string[];
  /**
   * Callback to publish the selected engine type
   */
  handleFilterChange: (
    endpoint: string | undefined,
    type: AlertFilterKey
  ) => void;
}

export const AlertsEndpointFilter = React.memo(
  (props: AlertsEndpointFilterProps) => {
    const { handleFilterChange: handleSelection, endpointOptions } = props;
    const endpointBuiltOptions = endpointOptions.map((option) => ({
      label: option,
    }));
    return (
      <Autocomplete
        autoHighlight
        clearOnBlur
        label="Endpoint"
        onChange={(e, endpoint) => handleSelection(endpoint?.label, 'endpoint')}
        options={endpointBuiltOptions}
        placeholder="Select an Endpoint"
        textFieldProps={{
          hideLabel: true,
        }}
      />
    );
  }
);
