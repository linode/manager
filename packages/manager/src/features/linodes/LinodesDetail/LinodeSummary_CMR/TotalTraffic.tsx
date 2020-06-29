import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'text' | 'heading';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      marginTop: theme.spacing(3),
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
    },
    text: {
      whiteSpace: 'nowrap',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3)
      }
    },
    heading: {
      fontSize: '0.9rem',
      whiteSpace: 'nowrap'
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
        <strong>In:</strong> {inTraffic}
      </Typography>
      <Typography variant="body2" className={classes.text}>
        <strong>Out:</strong> {outTraffic}
      </Typography>
      <Typography variant="body2" className={classes.text}>
        <strong>Combined:</strong> {combinedTraffic}
      </Typography>
    </div>
  );
};

const styled = withStyles(styles);

export default styled(TotalTraffic);
