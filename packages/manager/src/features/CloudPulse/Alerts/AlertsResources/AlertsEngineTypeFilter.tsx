import { Autocomplete } from '@linode/ui';
import React from 'react';

export interface AlertsEngineOptionProps {
  handleSelection: (engineType: string | undefined) => void;
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
        textFieldProps={{
          hideLabel: true,
        }}
        autoHighlight
        clearOnBlur
        disableClearable={false}
        label="Engine Type"
        onChange={(e, engineOption) => handleSelection(engineOption?.id)}
        options={engineOptions}
        placeholder="Select a Database Engine"
      />
    );
  }
);
