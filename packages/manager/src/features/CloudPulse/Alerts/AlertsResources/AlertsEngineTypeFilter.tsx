import { Autocomplete } from '@linode/ui';
import React from 'react';

import type { AlertAdditionalFilterKey } from './constants';

export interface AlertsEngineOptionProps {
  /**
   * Callback to publish the selected engine type
   */
  handleFilterChange: (
    engineType: string | undefined,
    type: AlertAdditionalFilterKey
  ) => void;
}

interface EngineType {
  id: string;
  label: string;
}

const engineOptions: EngineType[] = [
  {
    id: 'mysql',
    label: 'MySQL',
  },
  {
    id: 'postgresql',
    label: 'PostgreSQL',
  },
];

export const AlertsEngineTypeFilter = React.memo(
  (props: AlertsEngineOptionProps) => {
    const { handleFilterChange: handleSelection } = props;

    return (
      <Autocomplete
        onChange={(e, engineOption) =>
          handleSelection(engineOption?.id, 'engineType')
        }
        textFieldProps={{
          hideLabel: true,
        }}
        autoHighlight
        clearOnBlur
        label="Engine Type"
        options={engineOptions}
        placeholder="Select a Database Engine"
      />
    );
  }
);
