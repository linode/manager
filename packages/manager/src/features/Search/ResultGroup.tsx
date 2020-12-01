import { isEmpty, splitAt } from 'ramda';
import * as React from 'react';
import { compose, withStateHandlers } from 'recompose';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell_PreCMR from 'src/components/TableCell';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableHead from 'src/components/core/TableHead';
import TableRow_PreCMR from 'src/components/TableRow';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Table_PreCMR from 'src/components/Table';
import Table_CMR from 'src/components/Table/Table_CMR';
import useFlags from 'src/hooks/useFlags';
import capitalize from 'src/utilities/capitalize';

import ResultRow from './ResultRow';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2) + theme.spacing(1) / 2
  },
  entityHeadingWrapper: {},
  entityHeading: {
    marginBottom: theme.spacing(1) + 2
  },
  button: {
    marginTop: theme.spacing(1),
    width: '10%'
  },
  emptyCell: {
    padding: 0
  },
  headerCell: {
    padding: `${theme.spacing(1) + 2}px ${theme.spacing(1) / 2}px`
  },
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing()
    }
  }
}));

interface Props {
  entity: string;
  results: Item[];
  groupSize: number;
}
interface HandlerProps {
  showMore: boolean;
  toggle: () => void;
}

type CombinedProps = Props & HandlerProps;

export const ResultGroup: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();

  const { entity, groupSize, results, toggle, showMore } = props;

  if (isEmpty(results)) {
    return null;
  }

  const [initial, hidden] =
    results.length > groupSize ? splitAt(groupSize, results) : [results, []];

  const Table = flags.cmr ? Table_CMR : Table_PreCMR;
  const TableRow = flags.cmr ? TableRow_CMR : TableRow_PreCMR;
  const TableCell = flags.cmr ? TableCell_CMR : TableCell_PreCMR;

  return (
    <Grid item className={classes.root}>
      <div className={classes.entityHeadingWrapper}>
        <Typography
          variant="h2"
          data-qa-entity-header={entity}
          className={`${classes.entityHeading} ${flags.cmr &&
            classes.cmrSpacing}`}
        >
          {capitalize(entity)}
        </Typography>
      </div>
      <Paper>
        <Table aria-label="Search Results">
          <TableHead>
            <TableRow>
              {!flags.cmr && (
                <Hidden smDown>
                  <TableCell className={classes.emptyCell} />
                </Hidden>
              )}
              <TableCell className={classes.headerCell}>Label</TableCell>
              <TableCell className={classes.headerCell}>Region</TableCell>
              <Hidden smDown>
                <TableCell className={classes.headerCell}>Created</TableCell>
                <TableCell className={classes.headerCell}>Tags</TableCell>
              </Hidden>
            </TableRow>
          </TableHead>
          <TableBody>
            {initial.map((result, idx: number) => (
              <ResultRow
                key={idx}
                result={result}
                data-qa-result-row-component
              />
            ))}
            {showMore &&
              hidden.map((result, idx: number) => (
                <ResultRow
                  key={idx}
                  result={result}
                  data-qa-result-row-component
                />
              ))}
          </TableBody>
        </Table>
      </Paper>
      {!isEmpty(hidden) && (
        <Button
          buttonType="primary"
          onClick={toggle}
          className={classes.button}
          data-qa-show-more-toggle
        >
          {showMore ? 'Show Less' : 'Show All'}
        </Button>
      )}
    </Grid>
  );
};

const handlers = withStateHandlers(
  { showMore: false },
  {
    toggle: ({ showMore }) => () => ({ showMore: !showMore })
  }
);

const enhanced = compose<CombinedProps, Props>(handlers)(ResultGroup);

export default enhanced;
