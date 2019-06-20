import * as React from 'react';
import { compose } from 'recompose';

import Button from 'src/components/Button';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';

import NodePoolDisplayTable from '../../CreateCluster/NodePoolDisplayTable';
import { getTotalClusterPrice } from '../../kubeUtils';
import { ExtendedPoolNode } from '../../types';

type ClassNames = 'root' | 'button' | 'pricing' | 'ctaOuter';
const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3)
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    pricing: {
      marginTop: theme.spacing(2),
      fontSize: '1.em',
      fontWeight: 'bold'
    },
    ctaOuter: {
      marginTop: theme.spacing(2) - 1
    }
  });

interface Props {
  editing: boolean;
  submittingForm: boolean;
  submissionSuccess: boolean;
  submissionError?: Linode.ApiFieldError[];
  pools: ExtendedPoolNode[];
  poolsForEdit: ExtendedPoolNode[];
  types: ExtendedType[];
  toggleEditing: () => void;
  updatePool: (poolIdx: number, updatedPool: ExtendedPoolNode) => void;
  deletePool: (poolID: number) => void;
  resetForm: () => void;
  submitForm: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolsDisplay: React.FunctionComponent<
  CombinedProps
> = props => {
  const {
    classes,
    deletePool,
    editing,
    pools,
    poolsForEdit,
    resetForm,
    submitForm,
    submissionError,
    submissionSuccess,
    submittingForm,
    toggleEditing,
    types,
    updatePool
  } = props;

  return (
    <Paper className={classes.root}>
      <Grid container direction="column">
        <Grid
          container
          item
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h2">Node Pools</Typography>
          </Grid>
          <Grid item>
            <Button buttonType="secondary" onClick={toggleEditing}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </Grid>
        </Grid>
        {submissionSuccess && (
          <Grid item>
            <Notice success text="Node pools updated successfully." />
          </Grid>
        )}
        {submissionError && submissionError.length > 0 && (
          <Grid item>
            <Notice error text={submissionError[0].reason} />
          </Grid>
        )}
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
            <NodePoolDisplayTable pools={pools} types={types} />
          )}
        </Grid>
        <Grid item>
          {editing && (
            <Typography className={classes.pricing}>
              *Updated Monthly Estimate:{' '}
              {`$${getTotalClusterPrice(poolsForEdit)}/month`}
            </Typography>
          )}
          <Grid item container className={classes.ctaOuter}>
            <Button
              className={classes.button}
              buttonType="primary"
              disabled={!editing || submittingForm}
              loading={submittingForm}
              onClick={submitForm}
            >
              Save
            </Button>
            <Button
              className={classes.button}
              buttonType="secondary"
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
