import * as React from 'react';
import { useSelector } from 'react-redux';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ApplicationState } from 'src/store';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import NodePoolDisplayTable from '../../CreateCluster/NodePoolDisplayTable';
import { PoolNodeWithPrice } from '../../types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  displayTable: {
    width: '100%'
  },
  nodePoolHeader: {
    display: 'inline-block'
  },
  nodePoolHeaderOuter: {
    display: 'flex',
    alignItems: 'center'
  }
}));

interface Props {
  pools: PoolNodeWithPrice[];
  types: ExtendedType[];
  loading: boolean;
}

type CombinedProps = Props;

export const NodePoolsDisplay: React.FunctionComponent<CombinedProps> = props => {
  const { loading, pools, types } = props;

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
    <Paper className={classes.root}>
      <Grid container direction="column">
        <Grid
          container
          item
          direction="row"
          justify="space-between"
          alignItems="center"
          xs={12}
        >
          <Grid item className={classes.nodePoolHeaderOuter}>
            <Typography variant="h2" className={classes.nodePoolHeader}>
              Node Pools
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.displayTable}>
          <NodePoolDisplayTable
            pools={pools}
            types={types}
            loading={loading}
            error={poolsError}
          />
        </Grid>
        {/* NodePoolResizeDrawer goes here. */}
      </Grid>
    </Paper>
  );
};

export default React.memo(NodePoolsDisplay);
