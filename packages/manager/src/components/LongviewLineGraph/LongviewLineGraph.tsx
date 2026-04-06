import { Divider, ErrorState, Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { LineGraph } from 'src/components/LineGraph/LineGraph';

import type { Theme } from '@mui/material/styles';
import type {
  DataSet,
  LineGraphProps,
} from 'src/components/LineGraph/LineGraph';

const useStyles = makeStyles()((theme: Theme) => ({
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
    font: theme.font.bold,
    fontSize: '1rem',
  },
}));

export interface LongViewLineGraphProps extends LineGraphProps {
  ariaLabel?: string;
  error?: string;
  loading?: boolean;
  subtitle?: string;
  title: string;
}

export const LongviewLineGraph = React.memo((props: LongViewLineGraphProps) => {
  const { classes } = useStyles();

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
      <Divider spacingBottom={16} spacingTop={16} />
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
});

export const isDataEmpty = (data: DataSet[]) => {
  return data.every(
    (thisSeries) =>
      thisSeries.data.length === 0 ||
      // If we've padded the data, every y value will be null
      thisSeries.data.every((thisPoint) => thisPoint[1] === null)
  );
};
