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
    donutWrapper: {
      position: 'relative',
      width: `50%`
    },
    innerText: {
      position: 'absolute',
      top: `calc((${options.height}px / 2))`,
      width: options.width,
      textAlign: 'center',
      fontSize: options.fontSize || `${theme.spacing(2.5)}px `
    },
    subTitle: {
      position: 'absolute',
      width: options.width,
      textAlign: 'center',
      top: `calc(${options.height}px - 10%)`,
      fontSize: options.fontSize || `${theme.spacing(2.5)}px `
    }
  }));

interface Props {
  width?: number;
  height?: number;
  filledInColor?: string;
  nonFilledInColor?: string;
  filledInNumber: number;
  maxNumber: number;
  innerText?: string;
  innerTextFontSize?: number;
  subTitle?: string | JSX.Element;
}

type CombinedProps = Props & WithTheme;

const DonutGraph: React.FC<CombinedProps> = props => {
  const width = props.width || 30;
  const height = props.height || 30;
  const classes = useStyles({
    width,
    height,
    fontSize: props.innerTextFontSize
  })();

  return (
    <React.Fragment>
      <div
        className={classes.donutWrapper}
        style={{
          width
        }}
      >
        <Doughnut
          data={{
            datasets: [
              {
                hoverBackgroundColor: [
                  props.filledInColor || props.theme.color.blue,
                  props.nonFilledInColor || props.theme.color.grey2
                ],
                hoverBorderWidth: [0, 0],
                /** so basically, index 0 is the filled in, index 1 is the full graph percentage */
                data: [
                  props.filledInNumber,
                  props.maxNumber - props.filledInNumber
                ],
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
            responsive: true,
            /** get rid of all hover events with events: [] */
            events: [],
            legend: {
              display: false
            }
          }}
        />
        {props.innerText && (
          <div className={classes.innerText}>{props.innerText}</div>
        )}
        {props.subTitle && (
          <div className={classes.subTitle}>{props.subTitle}</div>
        )}
      </div>
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withTheme
)(DonutGraph);
