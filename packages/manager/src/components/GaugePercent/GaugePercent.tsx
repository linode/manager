import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';

import { Doughnut } from 'react-chartjs-2';

interface Options {
  width: number;
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
      top: `calc((${options.height}px / 2))`,
      width: options.width,
      textAlign: 'center',
      fontSize: options.fontSize || `${theme.spacing(2)}px `,
      color: theme.palette.text.primary
    },
    subTitle: {
      position: 'absolute',
      width: options.width,
      textAlign: 'center',
      top: `calc(${options.height}px - 10%)`,
      fontSize: options.fontSize || `${theme.spacing(2.5)}px `,
      color: theme.color.headline
    }
  }));

interface Props {
  width?: number;
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

  return (
    <React.Fragment>
      <div
        className={classes.gaugeWrapper}
        style={{
          width
        }}
      >
        <Doughnut
          data={{
            datasets: [
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
            ]
          }}
          height={height}
          options={{
            animation: {
              animateRotate: false,
              animateScale: false
            },
            maintainAspectRatio: false,
            rotation: -1.25 * Math.PI,
            circumference: 1.5 * Math.PI,
            cutoutPercentage: 70,
            responsive: true,
            /** get rid of all hover events with events: [] */
            events: [],
            legend: {
              display: false
            }
          }}
        />
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
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withTheme
)(GaugePercent);
