import { isEmpty, splitAt } from 'ramda';
import * as React from 'react';

import { compose, withStateHandlers } from 'recompose';

import Button from 'src/components/Button'
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import TableRowLoading from 'src/components/TableRowLoading';
import capitalize from 'src/utilities/capitalize';

import ResultRow from './ResultRow';

type ClassNames = 'root'
| 'entityHeadingWrapper'
| 'entityHeading'
| 'button';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: 0,
    marginBottom: 20,
  },
  entityHeadingWrapper: {
    height: 'auto',
    padding: 10,
    backgroundColor: theme.bg.tableHeader,
  },
  entityHeading: {
    color: theme.color.tableHeaderText,
    fontSize: '0.9rem',
    fontWeight: 500,
    lineHeight: '0.9rem',
  },
  button: {
    marginTop: theme.spacing.unit,
    width: '10%'
  },
});

interface Props {
  entity: string;
  loading: boolean;
  results: Item[];
  groupSize: number;
}
interface HandlerProps {
  showMore: boolean;
  toggle: () => void;
}

type CombinedProps = Props & HandlerProps & WithStyles<ClassNames>;

export const ResultGroup: React.StatelessComponent<CombinedProps> = (props) => {
  const { entity, classes, groupSize, loading, results, toggle, showMore } = props;

  if (isEmpty(results)) { return null; }

  const [initial, hidden] = (results.length > groupSize)
    ? splitAt(groupSize, results) : [results, []];

  return (
    <Grid item container direction="column" className={classes.root}>
      <div className={classes.entityHeadingWrapper}>
        <Typography variant="title" data-qa-entity-header className={classes.entityHeading}>{capitalize(entity)}</Typography>
      </div>
      <Paper>
        <Table>
          <TableBody>
            {loading && <TableRowLoading  colSpan={12} />}
            {initial.map((result, idx: number) =>
              <ResultRow key={idx} result={result} data-qa-result-row />)
            }
            {showMore &&
            hidden.map((result, idx: number) =>
              <ResultRow key={idx} result={result} data-qa-result-row />
            )
            }
          </TableBody>
        </Table>
      </Paper>
      {!isEmpty(hidden) &&
        <Button
          type="primary"
          onClick={toggle}
          className={classes.button}
          data-qa-show-more-toggle
        >
          {showMore ? "Show Less" : "Show All"}
        </Button>
      }
    </Grid>
  );
};

const styled = withStyles(styles);
const handlers = withStateHandlers(
  { showMore: false },
  {
    toggle: ({ showMore }) => () => ({ showMore: !showMore })
  }
)

const enhanced = compose<CombinedProps, Props>(
  styled,
  handlers
)(ResultGroup);

export default enhanced;
