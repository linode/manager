import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';

import { Divider } from 'src/components/Divider';
import { Button } from 'src/components/Button/Button';
import { SubnetFieldState } from 'src/utilities/subnets';
import { SubnetNode } from './SubnetNode';

interface Props {
  subnets: SubnetFieldState[];
  onChange: (subnets: SubnetFieldState[]) => void;
  disabled?: boolean;
}

export const MultipleSubnetInput = (props: Props) => {
  const theme = useTheme();
  const { subnets, onChange, disabled } = props;

  const addSubnet = () => {
    onChange([...subnets, { label: '', ip: { address: '', error: '' } }]);
  };

  const removeSubnet = (subnetIdx: number) => {
    const newSubnets = [...subnets];
    newSubnets.splice(subnetIdx, 1);
    onChange(newSubnets);
  };

  const handleSubnetChange = (subnet: SubnetFieldState, subnetIdx: number) => {
    const newSubnets = [...subnets];
    newSubnets[subnetIdx] = subnet;
    onChange(newSubnets);
  };

  return (
    <Grid>
      {subnets.map((subnet, subnetIdx) => (
        <Grid key={`subnet-${subnetIdx}`}>
          {subnetIdx !== 0 && <Divider sx={{ marginTop: theme.spacing(3) }} />}
          <Grid container alignItems={'center'}>
            <SubnetNode
              idx={subnetIdx}
              subnet={subnet}
              disabled={disabled}
              // janky solution to enable SubnetNode to work on its own or be part of MultipleSubnetInput
              onChange={(subnet, subnetIdx) =>
                handleSubnetChange(subnet, subnetIdx ?? 0)
              }
            />
            <StyledButton onClick={() => removeSubnet(subnetIdx)}>
              Remove
            </StyledButton>
          </Grid>
        </Grid>
      ))}
      <Button
        buttonType="outlined"
        disabled={disabled}
        onClick={addSubnet}
        sx={{ marginTop: theme.spacing(3) }}
      >
        Add a Subnet
      </Button>
    </Grid>
  );
};

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1),
    paddingLeft: 0,
  },
}));
