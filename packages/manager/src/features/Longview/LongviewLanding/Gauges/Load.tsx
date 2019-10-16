import * as React from 'react';

import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

const LoadGauge: React.FC = () => {
  return (
    <GaugePercent
      {...baseGaugeProps}
      max={100}
      value={70}
      filledInColor="#FADB50"
      innerText="0.75"
      subTitle={
        <>
          <Typography>
            <strong>Load</strong>
          </Typography>
          <Typography>0% Overallocated</Typography>
        </>
      }
    />
  );
};

export default LoadGauge;
