import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Chart from 'chart.js';
import moment from 'moment';
import _ from 'lodash';

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

  formatTicks(d, i) {
    // This is probably a temporary function until someone needs to pass in their own format.
    if (i % 10 === 0) {
      return moment(d).format('HH:mm');
    }

    return undefined;
  }


  renderChart({ data, title, yAxis }) {
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
            ticks: { display: true, callback: this.formatTicks },
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
      <canvas
        style={{ marginTop: '15px', width: '100%', height: '500px', maxHeight: '500px' }}
      />
    );
  }
}

LineGraph.propTypes = {
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
