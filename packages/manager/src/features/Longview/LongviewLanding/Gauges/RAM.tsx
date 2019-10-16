import * as React from 'react';

import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

const RAMGauge: React.FC = () => {
  return (
    <GaugePercent
      {...baseGaugeProps}
      max={100}
      value={50}
      filledInColor="#D38ADB"
      innerText="2 GB"
      subTitle={
        <>
          <Typography>
            <strong>RAM</strong>
          </Typography>
          <Typography>4 GB</Typography>
        </>
      }
    />
  );
};

export default RAMGauge;
