import * as React from 'react';

import Select, { Item } from 'src/components/EnhancedSelect/Select';
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

  React.useEffect(() => {
    if (configList?.length === 1) {
      const newValue = configList[0].value;
      if (value !== newValue) {
        onChange(configList[0].value);
      }
    }
  }, [configList, onChange, value]);

  if (linodeId === null) {
    return null;
  }

  return (
    <FormControl
      fullWidth={width ? false : true}
      style={{ marginTop: 20, width }}
    >
      <Select
        errorText={
          error ?? configsError
            ? 'An error occurred while retrieving configs for this Linode.'
            : undefined
        }
        noOptionsMessage={
          () =>
            !configs || configs.length == 0
              ? 'No configs are available for this Linode.'
              : 'No options.' // No matches for search
        }
        onChange={(e: Item<number>) => {
          onChange(+e.value);
        }}
        id={name}
        isClearable={false}
        label="Config"
        name={name}
        noMarginTop
        onBlur={onBlur}
        options={configList}
        placeholder="Select a Config"
        value={configList?.find((thisConfig) => thisConfig.value === value)}
        {...rest}
      />
    </FormControl>
  );
});
