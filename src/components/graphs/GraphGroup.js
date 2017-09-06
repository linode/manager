import _ from 'lodash';
import React, { Component } from 'react';

import { Select } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';

import LineGraph from './LineGraph';


const CONNECTION_UNITS = [' connections', 'K connections', 'M connections'];
const IO_UNITS = [' blocks', 'K blocks', 'M blocks'];
const NETWORK_UNITS = [' bits', 'K bits', 'M bits'];

export function convertUnits(value, currentUnit, unitType, fixedNumber = 0) {
  return `${value.toFixed(fixedNumber) / Math.pow(1000, currentUnit)}${unitType[currentUnit]}/s`;
}

function formatData(colors, datasets, legends) {
  const x = datasets[0].map(([x]) => x);
  const ys = datasets.map(dataset => dataset.map(([, y]) => y));
  return LineGraph.formatData(x, ys, colors, legends);
}

export function makeCPUGraphMetadata(graphData) {
  return {
    title: 'CPU',
    yAxis: {
      label: currentUnit => 'Percentage of CPU(s) used',
      format: p => `${p.toFixed(1)}%`,
    },
    data: formatData(['0033CC'], [graphData]),
    tooltipFormat: v => `${v}%`,
  };
}

export function makeIOGraphMetadata(graphData) {
  const UNITS = IO_UNITS;

  return {
    title: 'IO',
    yAxis: {
      label: currentUnit => `${UNITS[currentUnit]} per second`,
      format: (v, currentUnit) => convertUnits(v, currentUnit, UNITS, 1),
    },
    data: formatData(['FFD04B', 'FA373E'],
                     [graphData.io, graphData.swap],
                     ['Disk', 'Swap']),
    tooltipFormat: (v, currentUnit) => convertUnits(v, currentUnit, UNITS, 1),
    units: UNITS,
  };
}

export function makeNetv4GraphMetadata(graphData) {
  const UNITS = NETWORK_UNITS;

  return {
    title: 'IPv4 Network',
    yAxis: {
      label: currentUnit => `${UNITS[currentUnit]} per second`,
      format: (v, currentUnit) => convertUnits(v, currentUnit, UNITS),
    },
    data: formatData(['0033CC', 'CC0099', '32CD32', 'FFFF99'],
                     [graphData.in, graphData.private_in,
                      graphData.out, graphData.private_out],
                     ['Public IPv4 Inbound', 'Private IPv4 Inbound',
                      'Public IPv4 Outbound', 'Private IPv4 Outbound']),
    tooltipFormat: (v, currentUnit) => convertUnits(v, currentUnit, UNITS),
    units: UNITS,
  };
}

export function makeNetv6GraphMetadata(graphData) {
  const UNITS = NETWORK_UNITS;

  return {
    title: 'IPv6 Network',
    yAxis: {
      label: currentUnit => `${UNITS[currentUnit]} per second`,
      format: (v, currentUnit) => convertUnits(v, currentUnit, UNITS),
    },
    data: formatData(['0033CC', 'CC0099', '32CD32', 'FFFF99'],
                     [graphData.in, graphData.private_in,
                      graphData.out, graphData.private_out],
                     ['Public IPv6 Inbound', 'Private IPv6 Inbound',
                      'Public IPv6 Outbound', 'Private IPv6 Outbound']),
    tooltipFormat: (v, currentUnit) => convertUnits(v, currentUnit, UNITS),
    units: UNITS,
  };
}

export function makeConnectionsGraphMetadata(graphData) {
  const UNITS = CONNECTION_UNITS;

  return {
    title: 'Connections',
    yAxis: {
      label: currentUnit => `${UNITS[currentUnit]} per second`,
      format: (v, currentUnit) => convertUnits(v, currentUnit, UNITS, 1),
    },
    data: formatData(['990066'], [graphData]),
    tooltipFormat: (v, currentUnit) => convertUnits(v, currentUnit, UNITS, 1),
    units: UNITS,
  };
}
  
export function makeTrafficGraphMetadata(graphData) {
  const UNITS = NETWORK_UNITS;

  return {
    title: 'Traffic',
    yAxis: {
      label: currentUnit => `${UNITS[currentUnit]} per second`,
      format: (v, currentUnit) => convertUnits(v, currentUnit, UNITS, 1),
    },
    data: formatData(['0033CC', '32CD32'],
                     [graphData.in, graphData.out],
                     ['In', 'Out']),
    tooltipFormat: (v, currentUnit) => convertUnits(v, currentUnit, UNITS, 1),
    units: UNITS,
  };
}

export class GraphGroup extends Component {
  constructor(props) {
    super(props);

    this.state = { displayMode: 'small' };

    this.onChange = onChange.bind(this);
  }

  renderUnitSelect(units, currentUnit, name) {
    return (
      <div>
        <label className="Menu-itemLabel">Units:</label>
        <Select
          value={currentUnit}
          name={name}
          onChange={this.onChange}
          options={units.map((label, value) => ({ label, value }))}
        />
      </div>
    );
  }

  render() {
    const { timezone, allGraphData } = this.props;
    const { displayMode } = this.state;

    const graphs = allGraphData.map((data) => {
      const currentUnit = this.state[data.title] || 0;

      const className = displayMode === 'big' ? 'col-sm-12' : 'col-sm-6';

      return (
        <div key={data.title} className={`GraphGroup-graph ${className}`}>
          <div className="Menu">
            <div className="Menu-item"><h4>{data.title}</h4></div>
            {!data.units ? null : (
              <div className="Menu-item--right">
                {this.renderUnitSelect(data.units, currentUnit, data.title)}
              </div>
            )}
          </div>
          <LineGraph timezone={timezone} currentUnit={currentUnit} {...data} />
        </div>
      );
    });

    return (
      <div className="GraphGroup">
        <div className="Menu">
          <div className="Menu-item Menu-item--right">Last 24 Hours</div>
          <div className="Menu-item Menu-item--right">
            <label className="Menu-itemLabel">Display:</label>
            <Select
              value={displayMode}
              name="displayMode"
              onChange={this.onChange}
              options={[{ label: '2 x 2', value: 'small' }, { label: '1 x 4', value: 'big' }]}
            />
          </div>
        </div>
        <div className="row">{graphs}</div>
      </div>
    );
  }
}
