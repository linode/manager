import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  SubnetFieldState,
  getRecommendedSubnetIPv4,
} from 'src/utilities/subnets';

import { SubnetNode } from './SubnetNode';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
  onChange: (subnets: SubnetFieldState[]) => void;
  subnets: SubnetFieldState[];
}

export const MultipleSubnetInput = (props: Props) => {
  const { disabled, isDrawer, onChange, subnets } = props;

  const [lastRecommendedIPv4, setLastRecommendedIPv4] = React.useState(
    DEFAULT_SUBNET_IPV4_VALUE
  );

  const addSubnet = () => {
    const recommendedIPv4 = getRecommendedSubnetIPv4(
      lastRecommendedIPv4,
      subnets
    );
    setLastRecommendedIPv4(recommendedIPv4);
    onChange([
      ...subnets,
      {
        ip: { availIPv4s: 256, ipv4: recommendedIPv4, ipv4Error: '' },
        label: '',
        labelError: '',
      },
    ]);
  };

  const handleSubnetChange = (
    subnet: SubnetFieldState,
    subnetIdx: number,
    removable: boolean
  ) => {
    const newSubnets = [...subnets];
    if (removable) {
      newSubnets.splice(subnetIdx, 1);
    } else {
      newSubnets[subnetIdx] = subnet;
    }
    onChange(newSubnets);
  };

  return (
    <Grid>
      {subnets.map((subnet, subnetIdx) => (
        <Grid data-qa-subnet-node={subnetIdx} key={`subnet-${subnetIdx}`}>
          {subnetIdx !== 0 && (
            <Divider sx={(theme) => ({ marginTop: theme.spacing(2.5) })} />
          )}
          <SubnetNode
            onChange={(subnet, subnetIdx, removable) =>
              handleSubnetChange(subnet, subnetIdx ?? 0, !!removable)
            }
            disabled={disabled}
            idx={subnetIdx}
            isCreateVPCDrawer={isDrawer}
            isRemovable={true}
            subnet={subnet}
          />
        </Grid>
      ))}
      <Button
        buttonType="outlined"
        disabled={disabled}
        onClick={addSubnet}
        sx={(theme) => ({ marginTop: theme.spacing(3) })}
      >
        Add {subnets.length > 0 ? 'another' : 'a'} Subnet
      </Button>
    </Grid>
  );
};
