import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'text';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  text: {
    color: theme.color.black,
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
      <Typography variant="body2" className={classes.text}>
        Total Traffic
      </Typography>
      <Typography variant="body2" className={classes.text}>In: {inTraffic}</Typography>
      <Typography variant="body2" className={classes.text}>Out: {outTraffic}</Typography>
      <Typography variant="body2" className={classes.text}>Combined: {combinedTraffic}</Typography>
    </div>
  );
}

const styled = withStyles(styles);

export default styled(TotalTraffic);
