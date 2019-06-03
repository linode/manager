import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'text' | 'heading';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'space-between'
    }
  },
  text: {
    color: theme.color.black,
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3)
    }
  },
  heading: {
    fontSize: '0.9rem',
    color: theme.palette.text.primary
  }
});

export interface TotalTrafficProps {
  inTraffic: string;
  outTraffic: string;
  combinedTraffic: string;
}

type CombinedProps = TotalTrafficProps & WithStyles<ClassNames>;

export const TotalTraffic = (props: CombinedProps) => {
  const { classes, inTraffic, outTraffic, combinedTraffic } = props;
  return (
    <div className={classes.root}>
      <Typography variant="body2" className={classes.heading}>
        Total Traffic
      </Typography>
      <Typography variant="body2" className={classes.text}>
        In: {inTraffic}
      </Typography>
      <Typography variant="body2" className={classes.text}>
        Out: {outTraffic}
      </Typography>
      <Typography variant="body2" className={classes.text}>
        Combined: {combinedTraffic}
      </Typography>
    </div>
  );
};

const styled = withStyles(styles);

export default styled(TotalTraffic);
