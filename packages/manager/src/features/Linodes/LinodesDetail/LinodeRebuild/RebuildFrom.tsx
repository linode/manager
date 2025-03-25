import { Autocomplete } from '@linode/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { REBUILD_OPTIONS } from './utils';

import type { LinodeRebuildType, RebuildLinodeFormValues } from './utils';

interface Props {
  disabled: boolean;
  setType: (type: LinodeRebuildType) => void;
  type: LinodeRebuildType;
}

export const RebuildFromSelect = (props: Props) => {
  const { disabled, setType, type } = props;
  const { reset } = useFormContext<RebuildLinodeFormValues>();

  return (
    <Autocomplete
      onChange={(e, value) => {
        reset((values) => ({
          ...values,
          image: '',
          stackscript_data: undefined,
          stackscript_id: undefined,
        }));
        setType(value.label);
      }}
      disableClearable
      disabled={disabled}
      label="Rebuild From"
      noMarginTop
      options={REBUILD_OPTIONS}
      value={REBUILD_OPTIONS.find((o) => o.label === type)}
    />
  );
};
