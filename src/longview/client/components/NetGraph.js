import React from 'react';
import PropTypes from 'prop-types';
import { AbstractChart } from 'react-highcharts-wrapper';

const config = {
  /* HighchartsConfig */
  chart: {
    type: 'area',
  },
  boost: {
    useGPUTranslations: true,
  },
  tooltip: {
    valueDecimals: 2,
  },
  xAxis: {
    type: 'datetime',
  },
  legend: true,
  tickPositioner: 'standard',
  series: [],
};


export default function NetGraph(props, state) {
  let loadedConfig = { ...config };

  const values = props.lvclient._getValues || {};
  const Net = values.Network;
  const scaleTime = (result, [key, value]) => ([
    ...result,
    { ...value, x: value.x * 1000 },
  ]);

  if (Net) {
    console.log('Net is ', Net);
    const iface = Net.Interface;
    Object.entries(iface).forEach(([key, value]) => {
      const inbound = {
        key: `${key}.rx_bytes`,
        name: 'Inbound',
        color: '#32CC4D',
        data: Object.entries(value.rx_bytes).reduce(scaleTime, {}),
      };
      const outbound = {
        key: `${key}.tx_bytes`,
        name: 'Outbound',
        color: '#32AE4D',
        data: Object.entries(value.tx_bytes).reduce(scaleTime, {}),
      };
      loadedConfig.series.push(inbound, outbound);
    });
  }
  return (<AbstractChart config={loadedConfig} />);
}

NetGraph.propTypes = {
  summary: PropTypes.object,
  lvclient: PropTypes.object,
  dispatch: PropTypes.func,
};
