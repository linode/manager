import * as React from 'react';

import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

const LongviewGauge: React.FC = () => {
  return (
    <GaugePercent
      {...baseGaugeProps}
      max={100}
      value={25}
      innerText="300%"
      subTitle={
        <>
          <Typography>
            <strong>CPU</strong>
          </Typography>
          <Typography>4 Cores</Typography>
        </>
      }
    />
  );
};

export default LongviewGauge;
