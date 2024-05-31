import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { FormControl } from 'src/components/FormControl';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';

interface Props {
  disabled?: boolean;
  error?: string;
  linodeId: null | number;
  name: string;
  onBlur: (e: any) => void;
  onChange: (value: number) => void;
  value: null | number;
  width?: number;
}

export const ConfigSelect = React.memo((props: Props) => {
  const {
    error,
    linodeId,
    name,
    onBlur,
    onChange,
    value,
    width,
    ...rest
  } = props;

  const { data: configs, error: configsError } = useAllLinodeConfigsQuery(
    linodeId ?? -1,
    linodeId !== null
  );

  const configList = configs?.map((config) => {
    return { label: config.label, value: config.id };
  });

  if (configList?.length === 1) {
    const newValue = configList[0].value;
    if (value !== newValue) {
      onChange(newValue);
    }
  }

  return (
    <FormControl
      fullWidth={width ? false : true}
      style={{ marginTop: 20, width }}
    >
      <Autocomplete
        errorText={
          error ?? configsError
            ? 'An error occurred while retrieving configs for this Linode.'
            : undefined
        }
        noOptionsText={
          !configs || configs.length == 0
            ? 'No configs are available for this Linode.'
            : 'No options.'
        }
        onChange={(_, selected) => {
          onChange(+selected.value);
        }}
        value={
          value && value !== -1
            ? configList?.find((thisConfig) => thisConfig.value === value)
            : { label: '', value: -1 }
        }
        disableClearable
        id={name}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        label="Config"
        noMarginTop
        onBlur={onBlur}
        options={configList ?? []}
        placeholder="Select a Config"
        {...rest}
      />
    </FormControl>
  );
});
