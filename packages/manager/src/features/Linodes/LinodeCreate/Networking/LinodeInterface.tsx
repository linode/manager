import { Button, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { InterfaceFirewall } from './InterfaceFirewall';
import { InterfaceType } from './InterfaceType';
import { VLAN } from './VLAN';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
  onRemove: () => void;
}

export const LinodeInterface = ({ index, onRemove }: Props) => {
  const interfaceGeneration = useWatch<
    LinodeCreateFormValues,
    'interface_generation'
  >({ name: 'interface_generation' });

  const interfaceType = useWatch<
    LinodeCreateFormValues,
    `linodeInterfaces.${number}.purpose`
  >({ name: `linodeInterfaces.${index}.purpose` });

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
      <InterfaceType index={index} />
      {interfaceType === 'vlan' && <VLAN index={index} />}
      {interfaceGeneration === 'linode' && <InterfaceFirewall index={index} />}
    </Stack>
  );
};
