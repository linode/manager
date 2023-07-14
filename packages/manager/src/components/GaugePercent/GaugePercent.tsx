import { Theme } from '@mui/material/styles';
import { WithTheme, makeStyles, withTheme } from '@mui/styles';
import { Chart } from 'chart.js';
import * as React from 'react';
import { compose } from 'recompose';

interface Options {
  fontSize?: number;
  height: number;
  width: number | string;
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
  filledInColor?: string;
  height?: number;
  innerText?: string;
  innerTextFontSize?: number;
  max: number;
  nonFilledInColor?: string;
  subTitle?: JSX.Element | null | string;
  value: number;
  width?: number | string;
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
      style={{
        height: `calc(${height}px + ${props.theme.spacing(3.75)})`,
        width,
      }}
      className={classes.gaugeWrapper}
    >
      <canvas height={height} ref={graphRef} />
      {props.innerText && (
        <div className={classes.innerText} data-testid="gauge-innertext">
          {props.innerText}
        </div>
      )}
      {props.subTitle && (
        <div className={classes.subTitle} data-testid="gauge-subtext">
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
