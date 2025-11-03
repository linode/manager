import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { DatabaseVPC } from './DatabaseVPC';

import type { DatabaseCreateValues } from './DatabaseCreate';
import type { VPC } from '@linode/api-v4';

interface DatabaseCreateVPCProps {
  onChange: (selectedVPC: null | VPC) => void;
}

export const DatabaseCreateVPC = (props: DatabaseCreateVPCProps) => {
  const { onChange } = props;

  const { control } =
    useFormContext<Omit<DatabaseCreateValues, 'private_network'>>();

  const { control: networkControl, setValue } =
    useFormContext<Pick<DatabaseCreateValues, 'private_network'>>();

  const region = useWatch({
    control,
    name: 'region',
  });

  const [vpcId, subnetId] = useWatch({
    control: networkControl,
    name: ['private_network.vpc_id', 'private_network.subnet_id'],
  });

  return (
    <DatabaseVPC
      control={networkControl}
      mode="create"
      onChange={onChange}
      region={region}
      setValue={setValue}
      subnetId={subnetId}
      vpcId={vpcId}
    />
  );
};
