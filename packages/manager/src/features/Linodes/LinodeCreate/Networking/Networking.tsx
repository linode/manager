import { useFirewallSettingsQuery } from '@linode/queries';
import {
  Button,
  Divider,
  Notice,
  Paper,
  PlusSignIcon,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Firewall } from './Firewall';
import { InterfaceGeneration } from './InterfaceGeneration';
import { LinodeInterface } from './LinodeInterface';
import { getDefaultInterfacePayload } from './utilities';

import type { LinodeCreateFormValues } from '../utilities';

export const Networking = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<LinodeCreateFormValues>();

  const { data: firewallSettings } = useFirewallSettingsQuery();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'linodeInterfaces',
  });

  const interfaceGeneration = useWatch({
    control,
    name: 'interface_generation',
  });

  return (
    <Paper>
      <Stack divider={<Divider />} spacing={2}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
        >
          <Typography variant="h2">Networking</Typography>
          <Button
            onClick={() => {
              append(getDefaultInterfacePayload('public', firewallSettings));
            }}
            buttonType="outlined"
            endIcon={<PlusSignIcon height="12px" width="12px" />}
          >
            Add Another Interface
          </Button>
        </Stack>
        {errors.linodeInterfaces?.message && (
          <Notice text={errors.linodeInterfaces.message} variant="error" />
        )}
        <InterfaceGeneration />
        {fields.map((field, index) => (
          <LinodeInterface
            index={index}
            key={field.id}
            onRemove={() => remove(index)}
          />
        ))}
        {interfaceGeneration !== 'linode' && <Firewall />}
      </Stack>
    </Paper>
  );
};
