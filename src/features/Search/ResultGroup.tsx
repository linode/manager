import { isEmpty, splitAt } from 'ramda';
import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import List from 'src/components/core/List';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import capitalize from 'src/utilities/capitalize';

import HiddenResults from './HiddenResults';
import ResultRow from './ResultRow';

type ClassNames = 'root'
| 'entityHeadingWrapper'
| 'entityHeading';

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
  }
});

interface Props {
  entity: string;
  loading: boolean;
  redirect: (path: string) => void;
  results: Item[];
  groupSize: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ResultGroup: React.StatelessComponent<CombinedProps> = (props) => {
  const { entity, classes, groupSize, loading, redirect, results } = props;

  if (isEmpty(results)) { return null; }

  const [initial, hidden] = (results.length > groupSize)
    ? splitAt(groupSize, results) : [results, []];

  return (
    <Grid item container direction="column" className={classes.root}>
      <div className={classes.entityHeadingWrapper}>
        <Typography variant="title" data-qa-entity-header className={classes.entityHeading}>{capitalize(entity)}</Typography>
      </div>
      <List>
        {loading && <CircleProgress mini />}
        {initial.map((result, idx: number) =>
          <ResultRow key={idx} result={result} redirect={redirect} data-qa-result-row />)
        }
        { !isEmpty(hidden) && <HiddenResults results={hidden} redirect={redirect} /> }
      </List>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(ResultGroup);
