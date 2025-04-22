import { Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';

import { EditLinodeInterfaceFormSchema } from './EditInterfaceForm.utils';

import type { InferType } from 'yup';

interface Props {
  /**
   * In the case this from has a partial failure, we may want to show that the
   * firewall was successfully updated.
   */
  showSuccessNotice: boolean;
}

export const EditInterfaceFirewall = ({ showSuccessNotice }: Props) => {
  const { control } =
    useFormContext<InferType<typeof EditLinodeInterfaceFormSchema>>();

  return (
    <Stack spacing={1}>
      <Typography variant="h3">Firewall</Typography>
      {showSuccessNotice && (
        <Notice text="Firewall successfully updated." variant="success" />
      )}
      <Typography>
        Secure your Linode by assigning a Firewall to your interface.
      </Typography>
      <Controller
        control={control}
        name="firewall_id"
        render={({ field, fieldState }) => (
          <FirewallSelect
            errorText={fieldState.error?.message}
            onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
            value={field.value}
          />
        )}
      />
    </Stack>
  );
};
