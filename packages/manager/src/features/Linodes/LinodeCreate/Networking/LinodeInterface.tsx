import { Button, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { InterfaceFirewall } from './InterfaceFirewall';
import { InterfaceType } from './InterfaceType';
import { VLAN } from './VLAN';
import { VPC } from './VPC';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
  onRemove: () => void;
}

export const LinodeInterface = ({ index, onRemove }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<LinodeCreateFormValues>();

  const interfaceGeneration = useWatch<LinodeCreateFormValues>({
    control,
    name: 'interface_generation',
  });

  const interfaceType = useWatch<LinodeCreateFormValues>({
    control,
    name: `linodeInterfaces.${index}.purpose`,
  });

  return (
    <Stack spacing={2}>
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Typography variant="h3">Interface eth{index}</Typography>
        {index !== 0 && <Button onClick={onRemove}>Remove Interface</Button>}
      </Stack>
      {errors.linodeInterfaces?.[index]?.message && (
        <Notice
          text={errors.linodeInterfaces?.[index]?.message}
          variant="error"
        />
      )}
      {errors.linodeInterfaces?.[index]?.purpose?.message && (
        <Notice
          text={errors.linodeInterfaces?.[index]?.purpose?.message}
          variant="error"
        />
      )}
      <InterfaceType index={index} />
      {interfaceType === 'vlan' && <VLAN index={index} />}
      {interfaceType === 'vpc' && <VPC index={index} />}
      {interfaceGeneration === 'linode' && <InterfaceFirewall index={index} />}
    </Stack>
  );
};
