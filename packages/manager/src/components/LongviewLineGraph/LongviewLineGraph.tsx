import * as React from 'react';
import { compose } from 'recompose';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import LineGraph, {
  DataSet,
  Props as LineGraphProps,
} from 'src/components/LineGraph';

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  title: {
    color: theme.color.headline,
    fontWeight: 'bold',
    fontSize: '1rem',
    '& > span': {
      color: theme.palette.text.primary,
    },
  },
  message: {
    position: 'absolute',
    left: '50%',
    top: '45%',
    transform: 'translate(-50%, -50%)',
  },
}));

export interface Props extends LineGraphProps {
  title: string;
  subtitle?: string;
  error?: string;
  loading?: boolean;
}

type CombinedProps = Props;

const LongviewLineGraph: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { error, loading, title, subtitle, ...rest } = props;

  const message = error // Error state is separate, don't want to put text on top of it
    ? undefined
    : loading // Loading takes precedence over empty data
    ? 'Loading data...'
    : isDataEmpty(props.data)
    ? 'No data to display'
    : undefined;

  return (
    <React.Fragment>
      <Typography className={classes.title} variant="body1">
        {title}
        {subtitle && (
          <React.Fragment>
            &nbsp;<span>({subtitle})</span>
          </React.Fragment>
        )}
      </Typography>
      <Divider className={classes.divider} />
      <div style={{ position: 'relative' }}>
        {error ? (
          <div style={{ height: props.chartHeight || '300px' }}>
            <ErrorState errorText={error} />
          </div>
        ) : (
          <LineGraph {...rest} />
        )}
        {message && <div className={classes.message}>{message}</div>}
      </div>
    </React.Fragment>
  );
};

export const isDataEmpty = (data: DataSet[]) => {
  return data.every(
    (thisSeries) =>
      thisSeries.data.length === 0 ||
      // If we've padded the data, every y value will be null
      thisSeries.data.every((thisPoint) => thisPoint[1] === null)
  );
};

export default compose<CombinedProps, Props>(React.memo)(LongviewLineGraph);
