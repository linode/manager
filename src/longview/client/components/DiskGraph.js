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
    let loadedConf = { ...config };

    const Disk = props.disks;
    const scaleTime = (result, [, value]) => ([
      ...result,
      { ...value, x: value.x * 1000 },
    ]);

    if (Disk) {
      Object.entries(Disk).forEach(([, disk]) => {
        // These keys match the series position above
        let [readsKey, writesKey] = [0, 1];

        if (disk.isswap) {
          readsKey = writesKey = 2;
        }
        const readsScaled = Object.entries(disk.reads).reduce(scaleTime, {});
        const writesScaled = Object.entries(disk.writes).reduce(scaleTime, {});
        loadedConf.series[readsKey].data = loadedConf.series[readsKey].data.concat(readsScaled);
        loadedConf.series[writesKey].data = loadedConf.series[writesKey].data.concat(writesScaled);
      });
    }
    return (<AbstractChart config={loadedConf} />);
  }
}

DiskGraph.propTypes = {
  disks: PropTypes.object,
};
