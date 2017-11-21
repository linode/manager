import React, { PureComponent } from 'react';
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
  yAxis: {
    allowDecimals: false,
    min: 0,
  },
  xAxis: {
    type: 'datetime',
  },
  legend: true,
  tickPositioner: 'standard',
  plotOptions: {
    column: {
      stacking: 'normal',
      grouping: true,
    },
  },
  series: [
    {
      id: 'Inbound',
      name: 'Inbound',
      color: '#32CC4D',
    },
    {
      id: 'Outbound',
      name: 'Outbound',
      color: '#32AE4D',
    },
  ],
};

export default class NetGraph extends PureComponent {
  render() {
    let loadedConfig = { ...config };

    const Net = this.props.network;
    const scaleTime = (result, [, value]) => ([
      ...result,
      { ...value, x: value.x * 1000 },
    ]);

    if (Net) {
      const iface = Net.Interface;
      Object.entries(iface).forEach(([key, value]) => {
        const inbound = {
          key: `${key}.rx_bytes`,
          name: `Inbound (${key})`,
          linkedTo: 'Inbound',
          stack: 'Inbound',
          visible: true,
          data: Object.entries(value.rx_bytes).reduce(scaleTime, {}),
        };
        const outbound = {
          key: `${key}.tx_bytes`,
          name: `Outbound (${key})`,
          linkedTo: 'Outbound',
          stack: 'Outbound',
          visible: true,
          data: Object.entries(value.tx_bytes).reduce(scaleTime, {}),
        };
        loadedConfig.series.push(inbound, outbound);
      });
    }
    return (<AbstractChart config={loadedConfig} />);
  }
}

NetGraph.propTypes = {
  network: PropTypes.object,
};
