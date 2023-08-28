import { APIError } from '@linode/api-v4/lib/types';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Grid } from 'src/components/Grid';

import CPUGauge from '../../LongviewLanding/Gauges/CPU';
import LoadGauge from '../../LongviewLanding/Gauges/Load';
import NetworkGauge from '../../LongviewLanding/Gauges/Network';
import RAMGauge from '../../LongviewLanding/Gauges/RAM';
import StorageGauge from '../../LongviewLanding/Gauges/Storage';
import SwapGauge from '../../LongviewLanding/Gauges/Swap';

interface Props {
  clientID: number;
  lastUpdatedError?: APIError[];
}

export const GaugesSection = React.memo((props: Props) => {
  return (
    <StyledOuterGrid container item md={5} xs={12}>
      <StyledGaugeContainerGrid item xs={4}>
        <CPUGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid item xs={4}>
        <RAMGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid item xs={4}>
        <SwapGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid item xs={4}>
        <LoadGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid item xs={4}>
        <NetworkGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </StyledGaugeContainerGrid>
      <StyledGaugeContainerGrid item xs={4}>
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
