import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  SubnetFieldState,
} from 'src/utilities/subnets';

import { SubnetNode } from './SubnetNode';

interface Props {
  disabled?: boolean;
  onChange: (subnets: SubnetFieldState[]) => void;
  subnets: SubnetFieldState[];
}

export const MultipleSubnetInput = (props: Props) => {
  const theme = useTheme();
  const { disabled, onChange, subnets } = props;

  const addSubnet = () => {
    onChange([
      ...subnets,
      {
        ip: { availIPv4s: 256, ipv4: DEFAULT_SUBNET_IPV4_VALUE, ipv4Error: '' },
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
        <Grid key={`subnet-${subnetIdx}`}>
          <SubnetNode
            onChange={(subnet, subnetIdx, removable) =>
              handleSubnetChange(subnet, subnetIdx ?? 0, !!removable)
            }
            disabled={disabled}
            idx={subnetIdx}
            isRemovable={true}
            subnet={subnet}
          />
          <Divider sx={{ marginTop: theme.spacing(3) }} />
        </Grid>
      ))}
      <Button
        buttonType="outlined"
        disabled={disabled}
        onClick={addSubnet}
        sx={{ marginTop: theme.spacing(2) }}
      >
        Add {subnets.length > 0 ? 'another' : 'a'} Subnet
      </Button>
    </Grid>
  );
};
