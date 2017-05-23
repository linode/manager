import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Chart from 'chart.js';
import _ from 'lodash';
import moment from 'moment-timezone';


export function formatGraphTime(time, timezone) {
  return moment.utc(time).tz(timezone).format('HH:mm');
}

// Source: http://stackoverflow.com/a/5624139/1507139
function rgbaFromHex(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default class LineGraph extends Component {
  // Source: http://www.mulinblog.com/a-color-palette-optimized-for-data-visualization/
  static COLORS = [
    'FAA43A',
    '60BD68',
    '5DA5DA',
    'B276B2',
    'B2912F',
  ]

  static formatData(x, ys, legends = []) {
    return {
      labels: x,
      datasets: ys.map((y, i) => ({
        label: legends[i],
        data: y,
        pointRadius: 0,
        fill: false,
        borderColor: rgbaFromHex(LineGraph.COLORS[i], 1),
        backgroundColor: rgbaFromHex(LineGraph.COLORS[i], 0.3),
      })),
    };
  }

  componentDidMount() {
    this.renderChart(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.renderChart(nextProps);
  }

  componentWillUnmount() {
    this._chart.destroy();
  }

  formatTicks(timezone, d, i) {
    // This is probably a temporary function until someone needs to pass in their own format.
    if (i % 10 === 0) {
      return formatGraphTime(d, timezone);
    }

    return undefined;
  }

  renderChart({ timezone, data, title, yAxis, unit }) {
    const thisDOMNode = ReactDOM.findDOMNode(this);
    const ctx = thisDOMNode.getContext('2d');
    const config = {
      // The data will be mutated! We need to preserve the original data.
      data: _.cloneDeep(data),
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
                title = formatGraphTime(title, timezone);
              }

              return title;
            },
            label: function (tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += tooltipItem.yLabel + unit;
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
              callback: (d, i) => this.formatTicks(timezone, d, i),
            },
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: yAxis.label,
            },
            ticks: { display: true, callback: yAxis.format },
          }],
        },
      },
    };

    if (this._chart) {
      this._chart.data.labels = data.labels;
      this._chart.data.datasets = data.datasets;
      _.merge(this._chart.config.options, config.options);
      this._chart.update();
      this._chart.render();
    } else {
      this._chart = new Chart(ctx, config);
    }
  }

  render() {
    return (
      <canvas className="LineGraph" />
    );
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
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    Format: PropTypes.func,
  }),
};
