import * as React from 'react';

import Typography from 'src/components/core/Typography';
import GaugePercent from 'src/components/GaugePercent';
import { baseGaugeProps } from './common';

const StorageGauge: React.FC = () => {
  return (
    <GaugePercent
      {...baseGaugeProps}
      max={100}
      value={80}
      filledInColor="#F4AC3D"
      innerText="36.41 GB"
      subTitle={
        <>
          <Typography>
            <strong>Storage</strong>
          </Typography>
          <Typography>38.33 GB</Typography>
        </>
      }
    />
  );
};

export default StorageGauge;
