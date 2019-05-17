import { isEmpty, splitAt } from 'ramda';
import * as React from 'react';

import { compose, withStateHandlers } from 'recompose';

import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import capitalize from 'src/utilities/capitalize';

import ResultRow from './ResultRow';

type ClassNames =
  | 'root'
  | 'entityHeadingWrapper'
  | 'entityHeading'
  | 'button'
  | 'emptyCell'
  | 'headerCell';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginBottom: theme.spacing.unit * 2 + theme.spacing.unit / 2
  },
  entityHeadingWrapper: {},
  entityHeading: {
    marginBottom: theme.spacing.unit + 2
  },
  button: {
    marginTop: theme.spacing.unit,
    width: '10%'
  },
  emptyCell: {
    padding: 0
  },
  headerCell: {
    padding: `${theme.spacing.unit + 2}px ${theme.spacing.unit / 2}px`
  }
});

interface Props {
  entity: string;
  results: Item[];
  groupSize: number;
}
interface HandlerProps {
  showMore: boolean;
  toggle: () => void;
}

type CombinedProps = Props & HandlerProps & WithStyles<ClassNames>;

export const ResultGroup: React.StatelessComponent<CombinedProps> = props => {
  const { entity, classes, groupSize, results, toggle, showMore } = props;

  if (isEmpty(results)) {
    return null;
  }

  const [initial, hidden] =
    results.length > groupSize ? splitAt(groupSize, results) : [results, []];

  return (
    <Grid item className={classes.root}>
      <div className={classes.entityHeadingWrapper}>
        <Typography
          variant="h2"
          data-qa-entity-header={entity}
          className={classes.entityHeading}
        >
          {capitalize(entity)}
        </Typography>
      </div>
      <Paper>
        <Table aria-label="Search Results">
          <TableHead>
            <TableRow>
              <TableCell className={classes.emptyCell} />
              <Hidden smDown>
                <TableCell className={classes.emptyCell} />
              </Hidden>
              <TableCell className={classes.headerCell}>Label</TableCell>
              <TableCell className={classes.headerCell}>Region</TableCell>
              <TableCell className={classes.headerCell}>Created</TableCell>
              <TableCell className={classes.headerCell}>Tags</TableCell>
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
          type="primary"
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

const styled = withStyles(styles);
const handlers = withStateHandlers(
  { showMore: false },
  {
    toggle: ({ showMore }) => () => ({ showMore: !showMore })
  }
);

const enhanced = compose<CombinedProps, Props>(
  styled,
  handlers
)(ResultGroup);

export default enhanced;
