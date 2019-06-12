import * as React from 'react';
import { compose } from 'recompose';

import Button from 'src/components/Button';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import { ExtendedPoolNode } from '../../types';
import EditablePoolsDisplay from './EditablePoolsDisplay';
import StaticPoolsDisplay from './StaticPoolsDisplay';

type ClassNames = 'root' | 'button' | 'pricing';
const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  pricing: {
    marginTop: theme.spacing.unit
  }
});

interface Props {
  editing: boolean;
  toggleEditing: () => void;
  pools: ExtendedPoolNode[];
  types: ExtendedType[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolsDisplay: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes, editing, pools, toggleEditing, types } = props;
  return (
    <Paper className={classes.root}>
      <Grid container direction="column">
        <Grid container item direction="row" justify="space-between">
          <Grid item>
            <Typography variant="h2">Node Pools</Typography>
          </Grid>
          <Grid item>
            <Button type="secondary" onClick={toggleEditing}>
              {editing ? 'Cancel' : 'Resize'}
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          {editing ? (
            <EditablePoolsDisplay pools={pools} types={types} />
          ) : (
            <StaticPoolsDisplay pools={pools} types={types} />
          )}
        </Grid>
        <Grid item>
          <Typography className={classes.pricing}>
            *Updated Monthly Estimate: $1820
          </Typography>
          <Grid item container>
            <Button
              className={classes.button}
              type="primary"
              disabled={!editing}
            >
              Save
            </Button>
            <Button
              className={classes.button}
              type="secondary"
              disabled={!editing}
            >
              Clear Changes
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  React.memo,
  styled
);

export default enhanced(NodePoolsDisplay);
