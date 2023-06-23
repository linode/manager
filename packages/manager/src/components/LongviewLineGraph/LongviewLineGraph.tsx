import * as React from 'react';
import { compose } from 'recompose';
import Divider from 'src/components/core/Divider';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  DataSet,
  LineGraph,
  LineGraphProps,
} from 'src/components/LineGraph/LineGraph';

const useStyles = makeStyles((theme: Theme) => ({
  message: {
    left: '50%',
    position: 'absolute',
    top: '45%',
    transform: 'translate(-50%, -50%)',
  },
  title: {
    '& > span': {
      color: theme.palette.text.primary,
    },
    color: theme.color.headline,
    fontSize: '1rem',
    fontWeight: 'bold',
  },
}));

export interface Props extends LineGraphProps {
  title: string;
  subtitle?: string;
  error?: string;
  loading?: boolean;
  ariaLabel?: string;
}

type CombinedProps = Props;

const LongviewLineGraph: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { ariaLabel, error, loading, subtitle, title, ...rest } = props;

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
      <Divider spacingTop={16} spacingBottom={16} />
      <div style={{ position: 'relative' }}>
        {error ? (
          <div style={{ height: props.chartHeight || '300px' }}>
            <ErrorState errorText={error} />
          </div>
        ) : (
          <LineGraph {...rest} ariaLabel={ariaLabel} />
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
