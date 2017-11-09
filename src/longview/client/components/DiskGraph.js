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
  xAxis: {
    type: 'datetime',
  },
  yAxis: {
    labels: {
      format: '{value} ops/s',
    },
  },
  legend: true,
  tickPositioner: 'standard',
  title: 'Disk I/O',
  series: [
    {
      key: 'reads',
      name: 'Read',
      color: '#FFC469',
      data: [],
    },
    {
      key: 'writes',
      name: 'Write',
      color: '#FFA824',
      data: [],
    },
    {
      key: 'swap',
      name: 'Swap',
      color: '#EE2C2C',
      data: [],
      virtual: true,
    },
  ],
};

export default class DiskGraph extends PureComponent {
  render() {
    const props = this.props;
    let loadedConfig = { ...config };

    const Disk = props.disks;
    const scaleTime = (result, [key, value]) => ([
      ...result,
      { ...value, x: value.x * 1000 },
    ]);

    if (Disk) {
      console.log('DISK IS', Disk);
      console.log('this is new');
      Object.entries(Disk).forEach(([key, disk]) => {
        let [readsIndex, writesIndex] = [0, 1];

        console.log(disk);
        if (disk.isswap) {
          readsIndex = writesIndex = 2;
        }
        loadedConfig.series[readsIndex].data = loadedConfig.series[readsIndex].data.concat(Object.entries(disk.reads).reduce(scaleTime, {}));
        loadedConfig.series[writesIndex].data = loadedConfig.series[writesIndex].data.concat(Object.entries(disk.writes).reduce(scaleTime, {}));
      });
      console.log('DISK CHART LOADEDCONFIG', loadedConfig);
    }
    return (<AbstractChart config={loadedConfig} />);
  }
}

DiskGraph.propTypes = {
  disks: PropTypes.object,
};
