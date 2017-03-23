import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Chart from 'chart.js';
import moment from 'moment';
import _ from 'lodash';

export default class LineGraph extends Component {
  componentDidMount() {
    this.renderChart(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.renderChart(nextProps);
  }

  componentWillUnmount() {
    this._chart.destroy();
  }

  renderChart({ data, title, yAxis }) {
    const thisDOMNode = ReactDOM.findDOMNode(this);
    const ctx = thisDOMNode.getContext('2d');
    const config = {
      data,
      type: 'line',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: title,
        },
        legend: { display: false },
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
            ticks: { display: true, callback: d => moment(d).format() },
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
      this._chart.render();
      this._chart.update();
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
