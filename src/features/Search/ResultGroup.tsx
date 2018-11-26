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

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: 0,
    margin: 0,
  },
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
      <Grid item>
        <Typography variant="subheading" data-qa-entity-header>{capitalize(entity)}</Typography>
      </Grid>
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
