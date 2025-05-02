import { usePreferences } from '@linode/queries';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';

import type { RebuildLinodeFormValues } from './utils';

interface Props {
  disabled: boolean;
  linodeLabel: string;
}

export const Confirmation = (props: Props) => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  const { data: isTypeToConfirmEnabled } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true
  );

  return (
    <Controller
      render={({ field, fieldState }) => (
        <TypeToConfirm
          confirmationText={
            <span>
              To confirm these changes, type the label of the Linode (
              <strong>{props.linodeLabel}</strong>) in the field below:
            </span>
          }
          disabled={props.disabled}
          errorText={fieldState.error?.message}
          hideLabel
          label="Linode Label"
          onChange={field.onChange}
          title="Confirm"
          titleVariant="h3"
          value={field.value ?? ''}
          visible={isTypeToConfirmEnabled}
        />
      )}
      control={control}
      name="confirmationText"
    />
  );
};
