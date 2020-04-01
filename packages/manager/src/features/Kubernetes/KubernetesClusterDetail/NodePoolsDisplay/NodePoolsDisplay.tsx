import * as React from 'react';
import { useSelector } from 'react-redux';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { displayTypeForKubePoolNode } from 'src/features/linodes/presentation';
import { ApplicationState } from 'src/store';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { PoolNodeWithPrice } from '../../types';
import NodePool from './NodePool';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  displayTable: {
    width: '100%'
  },
  nodePoolHeader: {
    marginBottom: theme.spacing()
  },
  nodePoolHeaderOuter: {
    display: 'flex',
    alignItems: 'center'
  }
}));

export interface Props {
  pools: PoolNodeWithPrice[];
  types: ExtendedType[];
}

export const NodePoolsDisplay: React.FC<Props> = props => {
  const { pools, types } = props;

  const classes = useStyles();

  /**
   * If the API returns an error when fetching node pools,
   * we want to display this error to the user from the
   * NodePoolDisplayTable.
   *
   * Only do this if we haven't yet successfully retrieved this
   * data, so a random error in our subsequent polling doesn't
   * break the view.
   */
  const poolsError = useSelector((state: ApplicationState) => {
    const error = state.__resources.nodePools?.error?.read;
    const lastUpdated = state.__resources.nodePools.lastUpdated;
    if (error && lastUpdated === 0) {
      return getAPIErrorOrDefault(error, 'Unable to load Node Pools.')[0]
        .reason;
    }
    return undefined;
  });

  return (
    <>
      <Typography variant="h2" className={classes.nodePoolHeader}>
        Node Pools
      </Typography>
      <Paper className={classes.root}>
        {poolsError ? (
          <ErrorState errorText={poolsError} />
        ) : (
          <Grid container direction="column">
            <Grid item xs={12} className={classes.displayTable}>
              {pools.map(thisPool => {
                const { id, nodes } = thisPool;

                const thisPoolType = types.find(
                  thisType => thisType.id === thisPool.type
                );

                const typeLabel = thisPoolType
                  ? displayTypeForKubePoolNode(
                      thisPoolType.class,
                      thisPoolType.memory,
                      thisPoolType.vcpus
                    )
                  : 'Unknown type'; // This should never happen, but better not to crash if it does.

                return (
                  <NodePool
                    key={id}
                    poolId={thisPool.id}
                    typeLabel={typeLabel}
                    nodes={nodes ?? []}
                    // @todo: real handlers
                    // deletePool={() => null}
                    // handleClickResize={() => null}
                  />
                );
              })}
            </Grid>
            {/* NodePoolResizeDrawer goes here. */}
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default React.memo(NodePoolsDisplay);
