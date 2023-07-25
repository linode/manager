import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chart } from 'chart.js';
import {
  StyledSubTitleDiv,
  StyledInnerTextDiv,
  StyledGaugeWrapperDiv,
} from './GaugePercent.styles';

export interface GaugePercentProps {
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
      borderWidth: 0,
      hoverBackgroundColor: [
        props.filledInColor || theme.palette.primary.main,
        props.nonFilledInColor || theme.color.grey2,
      ],
      /** so basically, index 0 is the filled in, index 1 is the full graph percentage */
      data: [props.value, finalMax],
      backgroundColor: [
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
    <StyledGaugeWrapperDiv width={width} height={height}>
      <canvas height={height} ref={graphRef} />
      {props.innerText && (
        <StyledInnerTextDiv
          data-testid="gauge-innertext"
          width={width}
          height={height}
        >
          {props.innerText}
        </StyledInnerTextDiv>
      )}
      {props.subTitle && (
        <StyledSubTitleDiv
          data-testid="gauge-subtext"
          width={width}
          height={height}
          innerTextFontSize={props.innerTextFontSize}
        >
          {props.subTitle}
        </StyledSubTitleDiv>
      )}
    </StyledGaugeWrapperDiv>
  );
});
