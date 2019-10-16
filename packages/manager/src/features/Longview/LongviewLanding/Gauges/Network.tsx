import * as React from 'react';

import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

const NetworkGauge: React.FC = () => {
  return (
    <GaugePercent
      {...baseGaugeProps}
      max={100}
      value={35}
      filledInColor="#4FAD62"
      innerText="250 Mb/s"
      subTitle={
        <>
          <Typography>
            <strong>Network</strong>
          </Typography>
          <Typography>1 GB/s</Typography>
        </>
      }
    />
  );
};

export default NetworkGauge;
