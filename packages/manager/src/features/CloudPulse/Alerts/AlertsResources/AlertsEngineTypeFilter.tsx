import { Autocomplete } from '@linode/ui';
import React from 'react';

import type { AlertFilterKeys } from './constants';

export interface AlertsEngineOptionProps {
  handleSelection: (
    engineType: string | undefined,
    type: AlertFilterKeys
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

export const AlertsEngineOptionFilter = React.memo(
  (props: AlertsEngineOptionProps) => {
    const { handleSelection } = props;

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
        disableClearable={false}
        label="Engine Type"
        options={engineOptions}
        placeholder="Select a Database Engine"
      />
    );
  }
);
