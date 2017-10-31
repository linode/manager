import React from 'react';

import { AbstractChart } from 'react-highcharts-wrapper';

const config = {
  /* HighchartsConfig */
  chart: {
    type: 'pie',
  },
  series: [{
    name: 'Brands',
    colorByPoint: true,
    data: [
      { name: 'Microsoft Internet Explorer', y: 56.33 },
      { name: 'Chrome', y: 24.03, sliced: true, selected: true },
      { name: 'Firefox', y: 10.38 },
      { name: 'Safari', y: 4.77 },
      { name: 'Opera', y: 0.91 },
      { name: 'Proprietary or Undetectable', y: 0.2 },
    ],
  }],
};

export default function MultiMetricSummary(props, state) {
  return (<AbstractChart config={config} />);
}