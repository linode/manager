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

function getChartClass(chartType) {
  switch (chartType) {
    case 'AreaChart':
      return AreaChart;
    case 'BarChart':
      return BarChart;
    case 'CandleStickChart':
      return CandleStickChart;
    case 'LineChart':
      return LineChart;
    case 'PieChart':
      return PieChart;
    case 'ScatterChart':
      return ScatterChart;
    case 'Treemap':
      return Treemap;
    default:
      console.error('Invalid Chart Type name.'); // eslint-disable-line no-console
      break;
  }
  return <span />;
}


const createClass = (chartType) => {
  // NOTE: The class name as identified by enzyme will always be Chart
  // for each generated class. It may be better to use es5 class creation
  // here so the class's real name can be specified.
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

    fitToParentSize() {
      // eslint-disable-next-line react/no-string-refs
      const w = this.refs.wrapper.offsetWidth - 20;
      // eslint-disable-next-line react/no-string-refs
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
      const Component = getChartClass(chartType);
      let width = this.props.width;
      let height = this.props.height;
      width = this.state.size.w || 100;
      height = this.state.size.h || 100;
      /* eslint-disable react/no-string-refs */
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
      /* eslint-enable react/no-string-refs */
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
