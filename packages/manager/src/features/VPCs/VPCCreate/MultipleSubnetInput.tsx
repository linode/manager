import { useAccount } from '@linode/queries';
import { Button, Divider } from '@linode/ui';
import { isFeatureEnabledV2 } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { useFlags } from 'src/hooks/useFlags';
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
  const { data: account } = useAccount();
  const flags = useFlags();

  const { control } = useFormContext<CreateVPCPayload>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'subnets',
  });

  const ipv6 = useWatch({ control, name: 'ipv6' });

  const [lastRecommendedIPv4, setLastRecommendedIPv4] = React.useState(
    DEFAULT_SUBNET_IPV4_VALUE
  );

  const isDualStackSelected = ipv6 && ipv6.length > 0;

  const isDualStackEnabled = isFeatureEnabledV2(
    'VPC Dual Stack',
    Boolean(flags.vpcIpv6),
    account?.capabilities ?? []
  );

  const shouldDisplayIPv6 = isDualStackEnabled && isDualStackSelected;
  const recommendedIPv6 = shouldDisplayIPv6
    ? [
        {
          range: '/56',
        },
      ]
    : undefined;

  const handleAddSubnet = () => {
    const recommendedIPv4 = getRecommendedSubnetIPv4(
      lastRecommendedIPv4,
      fields.map((subnet) => subnet.ipv4 ?? '')
    );
    setLastRecommendedIPv4(recommendedIPv4);
    append({
      ipv4: recommendedIPv4,
      ipv6: recommendedIPv6,
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
              shouldDisplayIPv6={shouldDisplayIPv6}
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
