import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Chart from 'chart.js';
import merge from 'lodash/merge';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment-timezone';


export function formatGraphTime(time, timezone, format) {
  return moment.utc(time).tz(timezone).format(format);
}

export default class LineGraph extends Component {
  componentDidMount() {
    this.renderChart(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.renderChart(nextProps);
  }

  shouldComponentUpdate(newProps, newState) {
    // Prevents graph animation from happening multiple times for unchanged data.
    return !isEqual(this.props, newProps) || !isEqual(this.state, newState);
  }

  componentWillUnmount() {
    this._chart.destroy();
  }

  formatTicks(timezone, d, i, format) {
    // This is probably a temporary function until someone needs to pass in their own format.
    if (i % 10 === 0) {
      return formatGraphTime(d, timezone, format);
    }

    return undefined;
  }

  renderChart({ timezone, data, title, yAxis, tooltipFormat, currentUnit }) {
    const isLast24 = data.labels[data.labels.length - 1] - data.labels[0] <= 86400000;
    const format = isLast24 ? 'HH:mm' : 'MMM D, HH:mm';
    const thisDOMNode = ReactDOM.findDOMNode(this);
    const ctx = thisDOMNode.getContext('2d');
    const config = {
      // The data will be mutated! We need to preserve the original data.
      data: cloneDeep(data),
      type: 'line',
      options: {
        // Allows the graph to grow / shrink with the window.
        responsive: true,
        // Prevents the graph from changing in height.
        maintainAspectRatio: false,
        title: { display: false, text: title },
        legend: { display: data.datasets.length > 1 },
        tooltips: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: function (tooltipItems, data) {
              // Pick first xLabel for now
              let title = '';
              const labels = data.labels;
              const labelCount = labels ? labels.length : 0;

              if (tooltipItems.length > 0) {
                const item = tooltipItems[0];

                if (item.xLabel) {
                  title = item.xLabel;
                } else if (labelCount > 0 && item.index < labelCount) {
                  title = labels[item.index];
                }
              }

              // prevents trying to convert title if already in HH:mm format
              if (Number(title)) {
                title = formatGraphTime(title, timezone, format);
              }

              return title;
            },
            label: function (tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += tooltipFormat(tooltipItem.yLabel, currentUnit);
              return label;
            },
          },
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
        scaleShowVerticalLines: false,
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time',
            },
            ticks: {
              display: true,
              callback: (d, i) => this.formatTicks(timezone, d, i, format),
              maxRotation: 90,
              minRotation: 90,
            },
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: yAxis.label(currentUnit),
            },
            ticks: {
              display: true,
              callback: (v) => yAxis.format(v, currentUnit),
              beginAtZero: true,
            },
          }],
        },
      },
    };

    if (this._chart) {
      this._chart.data.labels = data.labels;
      this._chart.data.datasets = data.datasets;
      merge(this._chart.config.options, config.options);
      this._chart.update();
      this._chart.render();
    } else {
      this._chart = new Chart(ctx, config);
    }
  }

  render() {
    return <canvas className="LineGraph" />;
  }
}

LineGraph.propTypes = {
  timezone: PropTypes.string,
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.number),
        fill: PropTypes.bool,
      })
    ),
  }),
  title: PropTypes.string,
  yAxis: PropTypes.shape({
    label: PropTypes.func,
    Format: PropTypes.func,
  }),
  currentUnit: PropTypes.number,
};
