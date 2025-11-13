import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { DatabaseVPC } from '../../DatabaseCreate/DatabaseVPC';

import type { ManageNetworkingFormValues } from './DatabaseManageNetworkingDrawer';

interface DatabaseDetailVPCProps {
  region: string;
}

export const DatabaseDetailVPC = (props: DatabaseDetailVPCProps) => {
  const { region } = props;

  const { control, setValue, trigger } =
    useFormContext<ManageNetworkingFormValues>();

  const [vpcId, subnetId] = useWatch({
    control,
    name: ['private_network.vpc_id', 'private_network.subnet_id'],
  });

  return (
    <DatabaseVPC
      control={control}
      mode="networking"
      region={region}
      setValue={setValue}
      subnetId={subnetId}
      trigger={trigger}
      vpcId={vpcId}
    />
  );
};
