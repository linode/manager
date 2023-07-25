import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { isEmpty, splitAt } from 'ramda';
import * as React from 'react';
import { compose, withStateHandlers } from 'recompose';

import { Button } from 'src/components/Button/Button';
import { Item } from 'src/components/EnhancedSelect/Select';
import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { capitalize } from 'src/utilities/capitalize';

import ResultRow from './ResultRow';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginTop: theme.spacing(),
    width: '10%',
  },
  entityHeading: {
    marginBottom: theme.spacing(),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
}));

interface Props {
  entity: string;
  groupSize: number;
  results: Item[];
}
interface HandlerProps {
  showMore: boolean;
  toggle: () => void;
}

type CombinedProps = Props & HandlerProps;

export const ResultGroup: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { entity, groupSize, results, showMore, toggle } = props;

  if (isEmpty(results)) {
    return null;
  }

  const [initial, hidden] =
    results.length > groupSize ? splitAt(groupSize, results) : [results, []];

  return (
    <Grid>
      <Typography
        className={classes.entityHeading}
        data-qa-entity-header={entity}
        variant="h2"
      >
        {capitalize(entity)}
      </Typography>
      <Table aria-label="Search Results">
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Region</TableCell>
            <Hidden mdDown>
              <TableCell>Created</TableCell>
              <TableCell>Tags</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {initial.map((result, idx: number) => (
            <ResultRow data-qa-result-row-component key={idx} result={result} />
          ))}
          {showMore &&
            hidden.map((result, idx: number) => (
              <ResultRow
                data-qa-result-row-component
                key={idx}
                result={result}
              />
            ))}
        </TableBody>
      </Table>
      {!isEmpty(hidden) && (
        <Button
          buttonType="primary"
          className={classes.button}
          data-qa-show-more-toggle
          onClick={toggle}
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
