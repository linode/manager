import * as React from 'react';
import { addOrdinalSuffix } from 'src/utilities/stringUtils';
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
  numberOfNodesForUDFSummary?: number;
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
  summaryClusterBlurb: {
    marginTop: '1rem',
  },
}));

export const CheckoutSummary: React.FC<Props> = (props) => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const {
    heading,
    agreement,
    displaySections,
    numberOfNodesForUDFSummary,
  } = props;

  const planInformation = displaySections.find((section) => section.hourly);

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
      {props.children}
      {numberOfNodesForUDFSummary !== undefined &&
      numberOfNodesForUDFSummary > 0 ? (
        <Typography
          className={classes.summaryClusterBlurb}
          data-testid="summary-blurb-clusters"
        >
          To provision a cluster, a{' '}
          {addOrdinalSuffix(numberOfNodesForUDFSummary + 1)} node is created and
          then deleted, usually within an hour. You will see this charge on your
          next Linode invoice. Estimated charge ${planInformation?.hourly ?? 0}
        </Typography>
      ) : null}
      {agreement ? agreement : null}
    </Paper>
  );
};
