import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import styled, { StyleProps } from './MetricDisplay.styles';

interface SwatchProps {
  legendColor: 'yellow' | 'red' | 'blue' | 'green' | 'purple';
  legendTitle: string;
}

interface Props {
  rows: SwatchProps[];
}

type CombinedProps = Props & StyleProps;

const SimpleLegend: React.FC<CombinedProps> = props => {
  const { classes, rows } = props;
  return (
    <Grid container className={`${classes.root} ${classes.simpleLegendRoot}`}>
      {rows.map((row, i) => {
        const { legendTitle, legendColor } = row;
        return (
          <Grid item key={i}>
            <div className={`${classes.legend} ${classes.simpleLegend}`}>
              <div className={classes[legendColor]} data-qa-legend-title>
                <Typography component="span">{legendTitle}</Typography>
              </div>
            </div>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default styled(SimpleLegend);
