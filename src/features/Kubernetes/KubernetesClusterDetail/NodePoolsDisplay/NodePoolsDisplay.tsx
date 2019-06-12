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

import NodePoolDisplayTable from '../../CreateCluster/NodePoolDisplayTable';
import { getTotalClusterPrice } from '../../kubeUtils';
import { ExtendedPoolNode } from '../../types';

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
    marginTop: theme.spacing.unit * 2,
    fontSize: '1.em',
    fontWeight: 'bold'
  }
});

interface Props {
  editing: boolean;
  pools: ExtendedPoolNode[];
  poolsForEdit: ExtendedPoolNode[];
  types: ExtendedType[];
  toggleEditing: () => void;
  updatePool: (poolIdx: number, updatedPool: ExtendedPoolNode) => void;
  deletePool: (poolID: number) => void;
  resetForm: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolsDisplay: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes, deletePool, editing, pools, poolsForEdit, resetForm, toggleEditing, types, updatePool } = props;

  return (
    <Paper className={classes.root}>
      <Grid container direction="column">
        <Grid container item direction="row" justify="space-between">
          <Grid item>
            <Typography variant="h2">Node Pools</Typography>
          </Grid>
          <Grid item>
            <Button type="secondary" onClick={toggleEditing}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          {editing ? (
            <NodePoolDisplayTable
              editable
              pools={poolsForEdit}
              types={types}
              handleDelete={deletePool}
              updatePool={updatePool}
            />
          ) : (
            <NodePoolDisplayTable
              pools={pools}
              types={types}
              handleDelete={() => null}
              updatePool={() => null}
            />
          )}
        </Grid>
        <Grid item>
          {editing && 
            <Typography className={classes.pricing}>
              *Updated Monthly Estimate: {`$${getTotalClusterPrice(poolsForEdit)}/month`}
            </Typography>
          }
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
              onClick={resetForm}
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
