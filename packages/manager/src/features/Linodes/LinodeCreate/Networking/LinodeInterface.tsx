import { Notice, Stack } from '@linode/ui';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useGetLinodeCreateType } from '../Tabs/utils/useGetLinodeCreateType';
import { InterfaceFirewall } from './InterfaceFirewall';
import { InterfaceGeneration } from './InterfaceGeneration';
import { InterfaceType } from './InterfaceType';
import { LinodeIPAddressSelection } from './LinodeIPAddressSelection';
import { VLAN } from './VLAN';
import { VPC } from './VPC';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const LinodeInterface = ({ index }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<LinodeCreateFormValues>();

  const interfaceGeneration = useWatch({
    control,
    name: 'interface_generation',
  });

  const interfaceType = useWatch({
    control,
    name: `linodeInterfaces.${index}.purpose`,
  });

  const createType = useGetLinodeCreateType();
  const isCreatingFromBackup = createType === 'Backups';

  const disableInterfaceType =
    isCreatingFromBackup && interfaceGeneration !== 'linode';

  return (
    <Stack spacing={2}>
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
      <InterfaceType disabled={disableInterfaceType} index={index} />
      {interfaceType === 'public' && !disableInterfaceType && (
        <LinodeIPAddressSelection index={index} />
      )}
      {interfaceType === 'vlan' && !disableInterfaceType && (
        <VLAN index={index} />
      )}
      {interfaceType === 'vpc' && !disableInterfaceType && (
        <VPC index={index} />
      )}
      <InterfaceGeneration />
      {interfaceGeneration === 'linode' && interfaceType !== 'vlan' && (
        <InterfaceFirewall index={index} />
      )}
    </Stack>
  );
};
