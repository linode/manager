import { Autocomplete } from '@linode/ui';
import React from 'react';

import { engineOptions } from './constants';

import type { AlertFilterKey } from './types';

export interface AlertsEngineOptionProps {
  /**
   * Callback to publish the selected engine type
   */
  handleFilterChange: (
    engineType: string | undefined,
    type: AlertFilterKey
  ) => void;
}

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
        label="Database Engine"
        options={engineOptions}
        placeholder="Select a Database Engine"
      />
    );
  }
);
