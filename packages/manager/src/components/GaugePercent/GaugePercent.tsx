import { useTheme } from '@mui/material/styles';
import { Chart } from 'chart.js';
import * as React from 'react';

import {
  StyledGaugeWrapperDiv,
  StyledInnerTextDiv,
  StyledSubTitleDiv,
} from './GaugePercent.styles';

export interface GaugePercentProps {
  /**
   * The color for the filled in portion of the gauge.
   */
  filledInColor?: string;
  /**
   * The height of the gauge.
   */
  height?: number;
  /**
   * Text that shows up inside (in the middle) of the gauge.
   */
  innerText?: string;
  /**
   * The font size in `px` of the inner text.
   */
  innerTextFontSize?: number;
  /**
   * The max value of the gauge.
   */
  max: number;
  /**
   * The color for the non-filled in portion of the gauge.
   */
  nonFilledInColor?: string;
  /**
   * A subtitle that appears below the gauge.
   */
  subTitle?: JSX.Element | null | string;
  /**
   * The value that is displayed by the gauge. This value should be <= `max`.
   */
  value: number;
  /**
   * The width of the gauge.
   */
  width?: number | string;
}

/**
 * - **Chart.js** is the charting tool we use for gauges
 * - Best used to show percentages
 */
export const GaugePercent = React.memo((props: GaugePercentProps) => {
  const theme = useTheme();
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
      backgroundColor: [
        props.filledInColor || theme.palette.primary.main,
        props.nonFilledInColor || theme.color.grey2,
      ],
      borderWidth: 0,
      /** so basically, index 0 is the filled in, index 1 is the full graph percentage */
      data: [props.value, finalMax],
      hoverBackgroundColor: [
        props.filledInColor || theme.palette.primary.main,
        props.nonFilledInColor || theme.color.grey2,
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
      // eslint-disable-next-line sonarjs/constructor-for-side-effects
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
    <StyledGaugeWrapperDiv
      data-testid="gauge-wrapper"
      height={height}
      width={width}
    >
      <canvas height={height} ref={graphRef} />
      {props.innerText && (
        <StyledInnerTextDiv
          data-testid="gauge-innertext"
          height={height}
          width={width}
        >
          {props.innerText}
        </StyledInnerTextDiv>
      )}
      {props.subTitle && (
        <StyledSubTitleDiv
          data-testid="gauge-subtext"
          height={height}
          innerTextFontSize={props.innerTextFontSize}
          width={width}
        >
          {props.subTitle}
        </StyledSubTitleDiv>
      )}
    </StyledGaugeWrapperDiv>
  );
});
