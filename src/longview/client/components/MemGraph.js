import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { AbstractChart } from 'react-highcharts-wrapper';

// @todo copied from the old manager.. clean it
const bytesFormatter = num => {
  const n = parseFloat(num);

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const scale = units.findIndex((v, i) => n < 1024 ** (i + 1));
  return `${(n / 1024 ** scale).toFixed(parseInt(scale / 3))} ${units[scale]}`;
};

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
  yAxis: {
    labels: {
      // format: '{value} GB',
      formatter: bytesFormatter,
    },
  },
  legend: true,
  tickPositioner: 'standard',
  series: [{
    key: 'real.used',
    name: 'Used',
    color: '#ECC8EC',
  }, {
    key: 'real.cache',
    name: 'Cache',
    color: '#CD96CD',
  }, {
    key: 'real.buffers',
    name: 'Buffers',
    color: '#8E388E',
  }, {
    key: 'swap.used',
    name: 'Swap',
    color: '#EE2C2C',
  }],
};

export default class MemGraph extends PureComponent {
  render() {
    const props = this.props;
    let loadedConfig = { ...config };

    const Mem = props.mem_usage;
    const scaleTime = (result, [, value]) => ([
      ...result,
      { ...value, x: value.x * 1000 },
    ]);

    if (Mem) {
      loadedConfig.series[0].data = Object.entries(Mem.real.used).reduce(scaleTime, {});
      loadedConfig.series[1].data = Object.entries(Mem.real.cache).reduce(scaleTime, {});
      loadedConfig.series[2].data = Object.entries(Mem.real.buffers).reduce(scaleTime, {});
      loadedConfig.series[3].data = Object.entries(Mem.swap.used).reduce(scaleTime, {});
    }
    return (<AbstractChart config={loadedConfig} />);
  }
}

MemGraph.propTypes = {
  mem_usage: PropTypes.object,
};
