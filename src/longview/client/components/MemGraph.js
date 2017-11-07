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
  series: [
    {
      key: 'wait',
      name: 'Wait',
      color: '#91C7ED',
    },
    {
      key: 'user',
      name: 'User',
      color: '#51A6F5',
    },
    {
      key: 'system',
      name: 'System',
      color: '#0276FD',
    },
    {
      name: 'CPU',
      colorByPoint: true,
      data: [],
    }],
};

export default function CPUGraph(props, state) {
  let loadedConfig = { ...config };

  const values = props.lvclient._getValues || {};
  const CPU = values.CPU;
  const scaleTime = (result, [key, value]) => ([
    ...result,
    { ...value, x: value.x * 1000 },
  ]);

  if (CPU) {
    loadedConfig.series[0].data = Object.entries(CPU.cpu0.wait).reduce(scaleTime, {});
    loadedConfig.series[1].data = Object.entries(CPU.cpu0.user).reduce(scaleTime, {});
    loadedConfig.series[2].data = Object.entries(CPU.cpu0.system).reduce(scaleTime, {});
  }
  return (<AbstractChart config={loadedConfig} />);
}

CPUGraph.propTypes = {
  summary: PropTypes.object,
  lvclient: PropTypes.object,
  dispatch: PropTypes.func,
};
