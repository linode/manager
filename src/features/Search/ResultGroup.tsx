import { isEmpty } from 'ramda';
import * as React from 'react';

import List from 'src/components/core/List';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import capitalize from 'src/utilities/capitalize';

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
  redirect: (path: string) => void;
  results: Item[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ResultGroup: React.StatelessComponent<CombinedProps> = (props) => {
  const { entity, classes, redirect, results } = props;

  if (isEmpty(results)) { return null; }

  return (
    <Grid item container direction="column" className={classes.root}>
      <Grid item>
        <Typography variant="subheading" data-qa-entity-header>{capitalize(entity)}</Typography>
      </Grid>
      <List>
        {results.map((result, idx: number) =>
          <ResultRow key={idx} result={result} redirect={redirect} data-qa-result-row />)}
      </List>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(ResultGroup);
