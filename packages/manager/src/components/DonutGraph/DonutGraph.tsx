import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme, withTheme, WithTheme } from 'src/components/core/styles'

import { Doughnut } from 'react-chartjs-2'

const useStyles = makeStyles((theme: Theme) => ({
  root: {}
}))

interface Props {
  width?: number;
  height?: number;
  filledInColor?: string;
  nonFilledInColor?: string;
  filledInPercent: OneToHundred;
}

type CombinedProps = Props & WithTheme;

const DonutGraph: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  return (
    <div>
      <Doughnut
        data={{
          datasets: [{
            /** so basically, index 0 is the filled in, index 1 is the full graph percentage */
            data: [props.filledInPercent, 100 - props.filledInPercent],
            // fill: false,
            backgroundColor: [
              props.filledInColor || props.theme.color.blue,
              props.nonFilledInColor || props.theme.color.grey2
            ],
          }],
        }}
        height={props.height || 30}
        width={props.width || 30}
        options={{
          maintainAspectRatio: false,
          // cutoutPercentage: 100,
          rotation: -1.25 * Math.PI,
          circumference: 1.5 * Math.PI,
        }}
      />
    </div>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withTheme
)(DonutGraph);

export type OneToHundred = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100
