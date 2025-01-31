import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { usePreferences } from 'src/queries/profile/preferences';

import type { RebuildLinodeFormValues } from './utils';

interface Props {
  linodeLabel: string;
}

export const Confirmation = (props: Props) => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm
  );

  const isTypeToConfirmEnabled =
    typeToConfirmPreference === undefined || typeToConfirmPreference === true;

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
          errorText={fieldState.error?.message}
          hideLabel
          label="Linode Label"
          onChange={field.onChange}
          title="Confirm"
          value={field.value ?? ''}
          visible={isTypeToConfirmEnabled}
        />
      )}
      control={control}
      name="confirmationText"
    />
  );
};
