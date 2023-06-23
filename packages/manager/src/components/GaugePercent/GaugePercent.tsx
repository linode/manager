import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, withTheme, WithTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Chart } from 'chart.js';

interface Options {
  width: number | string;
  height: number;
  fontSize?: number;
}

const useStyles = (options: Options) =>
  makeStyles((theme: Theme) => ({
    gaugeWrapper: {
      position: 'relative',
      width: `50%`,
    },
    innerText: {
      color: theme.palette.text.primary,
      fontSize: '1rem',
      position: 'absolute',
      textAlign: 'center',
      top: `calc(${options.height + 30}px / 2)`,
      width: options.width,
    },
    subTitle: {
      color: theme.color.headline,
      fontSize: options.fontSize || theme.spacing(2.5),
      position: 'absolute',
      textAlign: 'center',
      top: `calc(${options.height}px + ${theme.spacing(1.25)})`,
      width: options.width,
    },
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

const GaugePercent: React.FC<CombinedProps> = (props) => {
  const width = props.width || 300;
  const height = props.height || 300;
  const classes = useStyles({
    fontSize: props.innerTextFontSize,
    height,
    width,
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
      backgroundColor: [
        props.filledInColor || props.theme.palette.primary.main,
        props.nonFilledInColor || props.theme.color.grey2,
      ],
      borderWidth: 0,
      /** so basically, index 0 is the filled in, index 1 is the full graph percentage */
      data: [props.value, finalMax],
      hoverBackgroundColor: [
        props.filledInColor || props.theme.palette.primary.main,
        props.nonFilledInColor || props.theme.color.grey2,
      ],
    },
  ];
  const graphOptions = {
    animation: {
      animateRotate: false,
      animateScale: false,
    },
    circumference: 1.5 * Math.PI,
    cutoutPercentage: 70,
    /** get rid of all hover events with events: [] */
    events: [],
    legend: {
      display: false,
    },
    maintainAspectRatio: false,
    responsive: true,
    rotation: -1.25 * Math.PI,
  };

  const graphRef: React.RefObject<any> = React.useRef(null);

  React.useEffect(() => {
    // Here we need to wait for the Canvas element to exist to attach a chart to it
    // we use a reference to access it.
    // https://dev.to/vcanales/using-chart-js-in-a-function-component-with-react-hooks-246l
    if (graphRef.current) {
      new Chart(graphRef.current.getContext('2d'), {
        data: {
          datasets: graphDatasets,
        },
        options: graphOptions,
        type: 'doughnut',
      });
    }
  });
  return (
    <div
      className={classes.gaugeWrapper}
      style={{
        height: `calc(${height}px + ${props.theme.spacing(3.75)})`,
        width,
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
