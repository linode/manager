import _ from 'lodash';
import React, { Component } from 'react';

import { Select } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';

import LineGraph from './LineGraph';


const UNITS = [' ', 'K', 'M'];

export function convertUnits(value, units, unitType, fixedNumber = 0) {
  return `${value.toFixed(fixedNumber) / Math.pow(1000, units)}${unitType[units]}/s`;
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
      label: 'Percentage of CPU(s) used',
      format: p => `${p.toFixed(1)}%`,
    },
    data: formatData(['0033CC'], [graphData]),
    tooltipFormat: v => `${v}%`,
  };
}

export function makeIOGraphMetadata(graphData) {
  return (units) => ({
    title: 'IO',
    yAxis: {
      label: `${UNITS[units]} per second`,
      format: v => convertUnits(v, units, UNITS, 1),
    },
    data: formatData(['FFD04B', 'FA373E'],
                     [graphData.io, graphData.swap],
                     ['Disk', 'Swap']),
    tooltipFormat: v => convertUnits(v, units, UNITS, 1),
  });
}

export function makeNetv4GraphMetadata(graphData) {
  return (units) => ({
    title: 'IPv4 Network',
    yAxis: {
      label: `${UNITS[units]} per second`,
      format: v => convertUnits(v, units, UNITS),
    },
    data: formatData(['0033CC', 'CC0099', '32CD32', 'FFFF99'],
                     [graphData.in, graphData.private_in,
                      graphData.out, graphData.private_out],
                     ['Public IPv4 Inbound', 'Private IPv4 Inbound',
                      'Public IPv4 Outbound', 'Private IPv4 Outbound']),
    tooltipFormat: v => convertUnits(v, units, UNITS),
  });
}

export function makeNetv6GraphMetadata(graphData) {
  return (units) => ({
    title: 'IPv6 Network',
    yAxis: {
      label: `${UNITS[units]} per second`,
      format: v => convertUnits(v, units, UNITS),
    },
    data: formatData(['0033CC', 'CC0099', '32CD32', 'FFFF99'],
                     [graphData.in, graphData.private_in,
                      graphData.out, graphData.private_out],
                     ['Public IPv6 Inbound', 'Private IPv6 Inbound',
                      'Public IPv6 Outbound', 'Private IPv6 Outbound']),
    tooltipFormat: v => convertUnits(v, units, UNITS),
  });
}

export function makeConnectionsGraphMetadata(graphData) {
  return (units) => ({
    title: 'Connections',
    yAxis: {
      label: `${UNITS[units]} per second`,
      format: v => convertUnits(v, units, UNITS, 1),
    },
    data: formatData(['990066'], [graphData]),
    tooltipFormat: v => convertUnits(v, units, UNITS, 1),
  });
}
  
export function makeTrafficGraphMetadata(graphData) {
  return (units) => ({
    title: 'Traffic',
    yAxis: {
      label: `${UNITS[units]} per second`,
      format: v => convertUnits(v, units, UNITS, 1),
    },
    data: formatData(['0033CC', '32CD32'],
                     [graphData.in, graphData.out],
                     ['In', 'Out']),
    tooltipFormat: v => convertUnits(v, units, UNITS, 1),
  });
}

export class GraphGroup extends Component {
  constructor(props) {
    super(props);

    this.state = { units: 0, displayMode: 'small' };

    this.onChange = onChange.bind(this);
  }

  shouldComponentUpdate(newProps, newState) {
    // Prevents graph animation from happening multiple times for unchanged data.
    return !_.isEqual(this.props, newProps) || !_.isEqual(this.state, newState);
  }

  renderUnitSelect() {
    const { units } = this.state;

    return (
      <div className="Menu-item clearfix">
        <label className="col-form-label float-sm-left">Units:</label>
        <Select
          className="float-sm-left"
          value={units}
          name="units"
          onChange={this.onChange}
          options={UNITS.map((label, value) => ({ label, value }))}
        />
      </div>
    );
  }

  render() {
    const { timezone, allGraphData } = this.props;
    const { units, displayMode } = this.state;

    const graphs = allGraphData.map(function(data) {
      if (_.isFunction(data)) {
        data = data(units);
      }

      const className = displayMode === 'big' ? 'col-sm-12' : 'col-sm-6';

      return (
        <div key={data.title} className={className}>
          <LineGraph timezone={timezone} label={data.title} {...data} />
        </div>
      );
    });

    return (
      <div>
        <div className="Menu">
          <div className="Menu-item--right">Last 24 Hours</div>
          <div className="Menu-item--right">
            <label className="Menu-itemLabel">Display:</label>
            <Select
              value={displayMode}
              name="displayMode"
              onChange={this.onChange}
              options={[{ label: '1 x 4', value: 'big' }, { label: '2 x 2', value: 'small' }]}
            />
          </div>
        </div>
        <div className="row">{graphs}</div>
      </div>
    );
  }
}
