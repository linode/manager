import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';

import { ArcElement, Chart, DoughnutController } from 'chart.js';

Chart.register(ArcElement, DoughnutController);
interface Options {
  width: number | string;
  height: number;
  fontSize?: number;
}

const useStyles = (options: Options) =>
  makeStyles((theme: Theme) => ({
    gaugeWrapper: {
      position: 'relative',
      width: `50%`
    },
    innerText: {
      position: 'absolute',
      top: `calc((${options.height + theme.spacing(2)}px / 2))`,
      width: options.width,
      textAlign: 'center',
      fontSize: '1rem',
      color: theme.palette.text.primary
    },
    subTitle: {
      position: 'absolute',
      width: options.width,
      textAlign: 'center',
      top: `calc(${options.height + theme.spacing(3.5)}px)`,
      fontSize: options.fontSize || `${theme.spacing(2.5)}px `,
      color: theme.color.headline
    }
  }));

interface Props {
  width?: number | string;
  height?: number;
  filledInColor?: string;
  nonFilledInColor?: string;
  value: number;
  max: number;
  innerText?: string;
  innerTextFontSize?: number;
  subTitle?: string | JSX.Element | null;
}

type CombinedProps = Props & WithTheme;

const GaugePercent: React.FC<CombinedProps> = props => {
  const width = props.width || 300;
  const height = props.height || 300;
  const classes = useStyles({
    width,
    height,
    fontSize: props.innerTextFontSize
  })();

  /**
   * if the value exceeds the maximum (e.g Longview Load), just make the max 0
   * so the value takes up 100% of the gauge
   */
  const finalMax =
    props.max === 0 && props.value === 0
      ? 1 // if they're both actually 0, make sure we have a full grey gauge
      : props.max - props.value < 0
      ? 0
      : props.max - props.value;

  const graphDatasets = [
    {
      borderWidth: 0,
      hoverBackgroundColor: [
        props.filledInColor || props.theme.color.blue,
        props.nonFilledInColor || props.theme.color.grey2
      ],
      /** so basically, index 0 is the filled in, index 1 is the full graph percentage */
      data: [props.value, finalMax],
      backgroundColor: [
        props.filledInColor || props.theme.color.blue,
        props.nonFilledInColor || props.theme.color.grey2
      ]
    }
  ];
  const graphOptions = {
    animation: {
      animateRotate: false,
      animateScale: false
    },
    maintainAspectRatio: false,
    cutoutPercentage: 70,
    responsive: true,
    /** get rid of all hover events with events: [] */
    events: [],
    legend: {
      display: false
    }
  };

  const graphRef: React.MutableRefObject<any> = React.useRef(null);
  const chartInstance: React.MutableRefObject<any> = React.useRef(null);
  React.useEffect(() => {
    // Here we need to wait for the Canvas element to exist to attach a chart to it
    // we use a reference to access it.
    // https://dev.to/vcanales/using-chart-js-in-a-function-component-with-react-hooks-246l
    if (graphRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new Chart(graphRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          datasets: graphDatasets
        },
        options: graphOptions
      });
    }
  });
  return (
    <div
      className={classes.gaugeWrapper}
      style={{
        width,
        height: height + props.theme.spacing(3.75)
      }}
    >
      <canvas height={height} ref={graphRef} />
      {props.innerText && (
        <div data-testid="gauge-innertext" className={classes.innerText}>
          {props.innerText}
        </div>
      )}
      {props.subTitle && (
        <div data-testid="gauge-subtext" className={classes.subTitle}>
          {props.subTitle}
        </div>
      )}
    </div>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withTheme
)(GaugePercent);
