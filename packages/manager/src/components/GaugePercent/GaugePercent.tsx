import * as React from 'react';
import { compose } from 'recompose';
import { withTheme, WithTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Chart } from 'chart.js';
import { Box } from 'src/components/Box';

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

type GaugePercentProps = Props & WithTheme;

export const GaugePercent = (props: GaugePercentProps) => {
  const width = props.width || 300;
  const height = props.height || 300;

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
        props.filledInColor || props.theme.palette.primary.main,
        props.nonFilledInColor || props.theme.color.grey2,
      ],
      /** so basically, index 0 is the filled in, index 1 is the full graph percentage */
      data: [props.value, finalMax],
      backgroundColor: [
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
    maintainAspectRatio: false,
    rotation: -1.25 * Math.PI,
    circumference: 1.5 * Math.PI,
    cutoutPercentage: 70,
    responsive: true,
    /** get rid of all hover events with events: [] */
    events: [],
    legend: {
      display: false,
    },
  };

  const graphRef: React.RefObject<any> = React.useRef(null);

  React.useEffect(() => {
    // Here we need to wait for the Canvas element to exist to attach a chart to it
    // we use a reference to access it.
    // https://dev.to/vcanales/using-chart-js-in-a-function-component-with-react-hooks-246l
    if (graphRef.current) {
      new Chart(graphRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          datasets: graphDatasets,
        },
        options: graphOptions,
      });
    }
  });
  return (
    <Box
      sx={{
        position: 'relative',
        width: width,
        height: `calc(${height}px + ${props.theme.spacing(3.75)})`,
      }}
    >
      <canvas height={height} ref={graphRef} />
      {props.innerText && (
        <Box
          data-testid="gauge-innertext"
          sx={(theme: Theme) => ({
            position: 'absolute',
            top: `calc(${height + 30}px / 2)`,
            width: width,
            textAlign: 'center',
            fontSize: '1rem',
            color: theme.palette.text.primary,
          })}
        >
          {props.innerText}
        </Box>
      )}
      {props.subTitle && (
        <Box
          data-testid="gauge-subtext"
          sx={(theme: Theme) => ({
            position: 'absolute',
            width: width,
            textAlign: 'center',
            top: `calc(${height}px + ${theme.spacing(1.25)})`,
            fontSize: props.innerTextFontSize || theme.spacing(2.5),
            color: theme.color.headline,
          })}
        >
          {props.subTitle}
        </Box>
      )}
    </Box>
  );
};

export default compose<GaugePercentProps, Props>(
  React.memo,
  withTheme
)(GaugePercent);
