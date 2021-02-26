import { isEmpty, splitAt } from 'ramda';
import * as React from 'react';
import { compose, withStateHandlers } from 'recompose';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import capitalize from 'src/utilities/capitalize';
import ResultRow from './ResultRow';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
  },
  entityHeading: {
    marginBottom: theme.spacing(),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(),
    },
  },
  button: {
    marginTop: theme.spacing(),
    width: '10%',
  },
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

  const { entity, groupSize, results, toggle, showMore } = props;

  if (isEmpty(results)) {
    return null;
  }

  const [initial, hidden] =
    results.length > groupSize ? splitAt(groupSize, results) : [results, []];

  return (
    <Grid item className={classes.root}>
      <Typography
        variant="h2"
        data-qa-entity-header={entity}
        className={classes.entityHeading}
      >
        {capitalize(entity)}
      </Typography>
      <Paper>
        <Table aria-label="Search Results">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Region</TableCell>
              <Hidden smDown>
                <TableCell>Created</TableCell>
                <TableCell>Tags</TableCell>
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
    toggle: ({ showMore }) => () => ({ showMore: !showMore }),
  }
);

const enhanced = compose<CombinedProps, Props>(handlers)(ResultGroup);

export default enhanced;
