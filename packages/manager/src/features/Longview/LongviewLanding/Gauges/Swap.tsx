import * as React from 'react';

import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

const SwapGauge: React.FC = () => {
  return (
    <GaugePercent
      {...baseGaugeProps}
      max={100}
      value={25}
      filledInColor="#DC4138"
      innerText="128 MB"
      subTitle={
        <>
          <Typography>
            <strong>Swap</strong>
          </Typography>
          <Typography>512 MB</Typography>
        </>
      }
    />
  );
};

export default SwapGauge;
