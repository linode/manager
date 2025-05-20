import { useAllLinodeConfigsQuery } from '@linode/queries';
import { Autocomplete, FormControl } from '@linode/ui';
import * as React from 'react';

interface Props {
  disabled?: boolean;
  error?: string;
  linodeId: null | number;
  name: string;
  onBlur: (e: any) => void;
  onChange: (value: number | undefined) => void;
  value: null | number;
  width?: number;
}

export const ConfigSelect = React.memo((props: Props) => {
  const { error, linodeId, name, onBlur, onChange, value, width, ...rest } =
    props;

  const { data: configs, error: configsError } = useAllLinodeConfigsQuery(
    linodeId ?? -1,
    linodeId !== null
  );

  const configList = configs?.map((config) => {
    return { label: config.label, value: config.id };
  });

  // This used to be in a useEffect. We are reverting that because it caused a
  // page crash - see [PDI-3054] for more information. Note that [M3-8578] will
  // need to be looked into again as a result.
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
        clearIcon={null}
        errorText={
          (error ?? configsError)
            ? 'An error occurred while retrieving configs for this Linode.'
            : undefined
        }
        id={name}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        label="Config"
        noMarginTop
        noOptionsText={
          !configs || configs.length == 0
            ? 'No configs are available for this Linode.'
            : 'No options.'
        }
        onBlur={onBlur}
        onChange={(_, selected) => {
          onChange(selected !== null ? +selected?.value : undefined);
        }}
        options={configList ?? []}
        placeholder="Select a Config"
        value={
          configList?.find((thisConfig) => thisConfig.value === value) ?? null
        }
        {...rest}
      />
    </FormControl>
  );
});
