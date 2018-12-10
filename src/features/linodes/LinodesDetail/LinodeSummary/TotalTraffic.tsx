import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = () => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
});

export interface TotalTrafficProps {
  inTraffic: string;
  outTraffic: string;
  combinedTraffic: string;
}

type CombinedProps = TotalTrafficProps & WithStyles<ClassNames>

export const TotalTraffic = (props: CombinedProps) => {
  const { classes, inTraffic, outTraffic, combinedTraffic } = props;
  return (
    <div className={classes.root}>
      <Typography variant="subtitle2">
        Total Traffic
      </Typography>
      <Typography>In: {inTraffic}</Typography>
      <Typography>Out: {outTraffic}</Typography>
      <Typography>Combined: {combinedTraffic}</Typography>
    </div>
  );
}

const styled = withStyles(styles);

export default styled(TotalTraffic);
