import { Button, Divider } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import {
  DEFAULT_SUBNET_IPV4_VALUE,
  getRecommendedSubnetIPv4,
} from 'src/utilities/subnets';

import { SubnetNode } from './SubnetNode';

import type { CreateVPCPayload } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
}

export const MultipleSubnetInput = (props: Props) => {
  const { disabled, isDrawer } = props;

  const { control } = useFormContext<CreateVPCPayload>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'subnets',
  });

  const [lastRecommendedIPv4, setLastRecommendedIPv4] = React.useState(
    DEFAULT_SUBNET_IPV4_VALUE
  );

  const handleAddSubnet = () => {
    const recommendedIPv4 = getRecommendedSubnetIPv4(
      lastRecommendedIPv4,
      fields.map((subnet) => subnet.ipv4 ?? '')
    );
    setLastRecommendedIPv4(recommendedIPv4);
    append({
      ipv4: recommendedIPv4,
      label: '',
    });
  };

  return (
    <Grid>
      {fields.map((subnet, subnetIdx) => {
        return (
          <Grid data-qa-subnet-node={subnetIdx} key={subnet.id}>
            {subnetIdx !== 0 && (
              <Divider sx={(theme) => ({ marginTop: theme.spacing(2.5) })} />
            )}
            <SubnetNode
              disabled={disabled}
              idx={subnetIdx}
              isCreateVPCDrawer={isDrawer}
              remove={remove}
            />
          </Grid>
        );
      })}
      <Button
        buttonType="outlined"
        disabled={disabled}
        onClick={handleAddSubnet}
        sx={(theme) => ({ marginTop: theme.spacing(3) })}
      >
        Add {fields.length > 0 ? 'another' : 'a'} Subnet
      </Button>
    </Grid>
  );
};
