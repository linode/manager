import React from 'react';
import rd3 from 'rd3';

const {
  AreaChart,
  BarChart,
  CandleStickChart,
  LineChart,
  PieChart,
  ScatterChart,
  Treemap,
} = rd3;

const createClass = (chartType) => {
  class Chart extends React.Component {
    constructor(props) {
      super(props);
      this.state = { size: { w: 0, h: 0 } };
    }

    componentDidMount() {
      window.addEventListener('resize', ::this.fitToParentSize);
      this.fitToParentSize();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', ::this.fitToParentSize);
    }

    getChartClass() {
      let Component;
      switch (chartType) {
        case 'AreaChart':
          Component = AreaChart;
          break;
        case 'BarChart':
          Component = BarChart;
          break;
        case 'CandleStickChart':
          Component = CandleStickChart;
          break;
        case 'LineChart':
          Component = LineChart;
          break;
        case 'PieChart':
          Component = PieChart;
          break;
        case 'ScatterChart':
          Component = ScatterChart;
          break;
        case 'Treemap':
          Component = Treemap;
          break;
        default:
          console.error('Invalid Chart Type name.'); // eslint-disable-line no-console
          break;
      }
      return Component;
    }

    fitToParentSize() {
      const w = this.refs.wrapper.offsetWidth - 20;
      const h = this.refs.wrapper.offsetHeight - 20;
      const currentSize = this.state.size;
      if (w !== currentSize.w || h !== currentSize.h) {
        this.setState({
          size: { w, h },
        });
      }
    }

    render() {
      const { margin, ...others } = this.props;
      let Component = this.getChartClass();
      let width = this.props.width;
      let height = this.props.height;
      width = this.state.size.w || 100;
      height = this.state.size.h || 100;
      return (
        <div className="chart-wrapper" ref="wrapper">
          <Component
            width={width}
            height={height}
            margin={margin}
            {...others}
          />
        </div>
      );
    }
  }
  Chart.defaultProps = {
    margin: {
    },
  };
  Chart.propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
  };
  return Chart;
};

const ResponsiveAreaChart = createClass('AreaChart');
const ResponsiveBarChart = createClass('BarChart');
const ResponsiveCandleStickChart = createClass('CandleStickChart');
const ResponsiveLineChart = createClass('LineChart');
const ResponsivePieChart = createClass('PieChart');
const ResponsiveScatterChart = createClass('ScatterChart');
const ResponsiveTreemap = createClass('Treemap');

export {
  ResponsiveAreaChart,
  ResponsiveBarChart,
  ResponsiveCandleStickChart,
  ResponsiveLineChart,
  ResponsivePieChart,
  ResponsiveScatterChart,
  ResponsiveTreemap,
};

export default {
  ResponsiveAreaChart,
  ResponsiveBarChart,
  ResponsiveCandleStickChart,
  ResponsiveLineChart,
  ResponsivePieChart,
  ResponsiveScatterChart,
  ResponsiveTreemap,
};
