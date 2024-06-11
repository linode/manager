import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { CPUGauge } from '../../LongviewLanding/Gauges/CPU';
import { LoadGauge } from '../../LongviewLanding/Gauges/Load';
import { NetworkGauge } from '../../LongviewLanding/Gauges/Network';
import { RAMGauge } from '../../LongviewLanding/Gauges/RAM';
import { StorageGauge } from '../../LongviewLanding/Gauges/Storage';
import { SwapGauge } from '../../LongviewLanding/Gauges/Swap';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

interface Props {
  clientID: number;
  lastUpdatedError?: FormattedAPIError[];
}

export const GaugesSection = React.memo((props: Props) => {
  return (
    <StyledOuterGrid container md={5} spacing={2} xs={12}>
      <StyledGaugeContainerGrid xs={4}>
        <CPUGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid xs={4}>
        <RAMGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid xs={4}>
        <SwapGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid xs={4}>
        <LoadGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid xs={4}>
        <NetworkGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid xs={4}>
        <StorageGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
    </StyledOuterGrid>
  );
});

const StyledGaugeContainerGrid = styled(Grid, {
  label: 'StyledGaugeContainerGrid',
})(({ theme }) => ({
  boxSizing: 'border-box',
  marginBottom: theme.spacing(6),
}));

const StyledOuterGrid = styled(Grid, { label: 'StyledOuterGrid' })(
  ({ theme }) => ({
    [theme.breakpoints.down('lg')]: {
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: 450,
    },
  })
);
