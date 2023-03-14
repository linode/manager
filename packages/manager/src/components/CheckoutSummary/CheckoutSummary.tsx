import * as React from 'react';
import Paper from '../core/Paper';
import { makeStyles, Theme, useMediaQuery, useTheme } from '../core/styles';
import Typography from '../core/Typography';
import Grid from '../Grid';
import { SummaryItem } from './SummaryItem';

interface Props {
  heading: string;
  children?: JSX.Element | null;
  agreement?: JSX.Element;
  displaySections: SummaryItem[];
}

export interface SummaryItem {
  title?: string;
  details?: string | number;
  monthly?: number;
  hourly?: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  heading: {
    marginBottom: theme.spacing(3),
  },
  summary: {
    [theme.breakpoints.up('md')]: {
      '& > div': {
        borderRight: 'solid 1px #9DA4A6',
        '&:last-child': {
          borderRight: 'none',
        },
      },
    },
  },
}));

export const CheckoutSummary = (props: Props) => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { heading, agreement, displaySections, children } = props;

  return (
    <Paper data-qa-summary className={classes.paper}>
      <Typography
        variant="h2"
        data-qa-order-summary
        className={classes.heading}
      >
        {heading}
      </Typography>
      {displaySections.length === 0 ? (
        <Typography variant="body1" className={classes.heading}>
          Please configure your Linode.
        </Typography>
      ) : null}
      <Grid
        container
        spacing={3}
        direction={matchesSmDown ? 'column' : 'row'}
        className={classes.summary}
      >
        {displaySections.map((item) => (
          <SummaryItem key={`${item.title}-${item.details}`} {...item} />
        ))}
      </Grid>
      {children}
      {agreement ? agreement : null}
    </Paper>
  );
};
