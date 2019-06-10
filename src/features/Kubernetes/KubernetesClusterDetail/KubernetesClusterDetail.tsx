import { path, remove, update } from 'ramda';
import * as React from 'react';
import {
  RouteComponentProps,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';

import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import TagsPanel from 'src/components/TagsPanel';
import KubeContainer from 'src/containers/kubernetes.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { extendCluster } from '.././kubeUtils';
import { ExtendedCluster, ExtendedPoolNode } from '.././types';
import NodePoolPanel from '../CreateCluster/NodePoolPanel';
import KubeSummaryPanel from './KubeSummaryPanel';
import NodePoolsDisplay from './NodePoolsDisplay';

type ClassNames =
  | 'root'
  | 'title'
  | 'titleWrapper'
  | 'backButton'
  | 'section'
  | 'panelItem'
  | 'button';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing.unit
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  backButton: {
    margin: '-6px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34
    },
    padding: 0
  },
  section: {
    margin: theme.spacing.unit * 2
  },
  panelItem: {
    padding: theme.spacing.unit
  },
  button: {
    marginLeft: theme.spacing.unit * 2
  }
});
interface KubernetesContainerProps {
  cluster: ExtendedCluster | null;
  clustersLoading: boolean;
  lastUpdated: number;
  requestKubernetesClusters: () => void;
  requestClusterForStore: (clusterID: string) => void;
}

type CombinedProps = WithTypesProps & RouteComponentProps<{clusterID: string}> & KubernetesContainerProps & WithStyles<ClassNames>;

export const KubernetesClusterDetail: React.FunctionComponent<
  CombinedProps
> = props => {
  const { classes, cluster, clustersLoading, lastUpdated, typesData, typesError, typesLoading } = props;

  const [editing, setEditing] = React.useState<boolean>(false);
  /** Holds the local state of the cluster's node pools when editing */
  const [pools, updatePools] = React.useState<ExtendedPoolNode[]>([]);
  /** When adding new pools in the NodePoolPanel component, use these variables. */
  const [selectedType, setSelectedType] = React.useState<string|undefined>(undefined);
  const [count, setCount] = React.useState<number>(1);

  React.useEffect(() => {
    /**
     * Eventually the clusters request will probably be made from App.tsx
     * (to facilitate searching), but for now if a user navigates directly
     * to this url without going through KubernetesLanding the clusters won't have
     * been requested yet.
     */
    if (props.lastUpdated === 0) {
      props.requestKubernetesClusters();
    } else {
      const clusterID = props.match.params.clusterID;
      props.requestClusterForStore(clusterID);
    }
  }, []);

  if (clustersLoading && lastUpdated !== 0) { return <div>'loading...'</div>; }
  if (cluster === null) { return null; }

  const updatePool = (poolIdx: number, updatedPool: ExtendedPoolNode) => {
    updatePools((prevPools) =>
       update(poolIdx, updatedPool, prevPools)
    );
  }

  const resetFormState = () => {
    updatePools(cluster.node_pools);
  }

  const toggleEditing = () => {
    updatePools(cluster.node_pools);
    setEditing(!editing);
  }

  const handleAddNodePool = (pool: ExtendedPoolNode) => {
    if (editing) {
      /** We're already in editing mode, so the list of pool nodes should be accurate */
      updatePools(prevPools => {
        const newPools = [
          ...prevPools,
          {
            ...pool,
            queuedForAddition: true
          }
        ]
        return newPools;
      })
    } else {
      /** From a static state, adding a node pool should trigger editing state */
      setEditing(true);
      /** Make sure the list of node pools is correct */
      updatePools([
          ...cluster.node_pools,
          {
            ...pool,
            queuedForAddition: true
          }
        ])
      }
  }

  const handleDeletePool = (poolIdx: number) => {
    updatePools((prevPools) => {
      const poolToDelete = path<ExtendedPoolNode>([poolIdx], prevPools);
      if (poolToDelete) {
        if (poolToDelete.queuedForAddition) {
          /**
           * This is a new pool in local state that doesn't exist as far as the API is concerned. 
           * It can be directly removed.
           */
          return remove(poolIdx, 1, prevPools);
        } else {
          /** 
           * This is a "real" node that we don't want users to accidentally delete. Mark it for deletion
           * (it will be handled on form submission).
           */
          const withMarker = {
            ...poolToDelete,
            queuedForDeletion: !Boolean(poolToDelete.queuedForDeletion)
          }
          return update(poolIdx, withMarker, prevPools)
        }
        
      } else {
        return prevPools;
      }
    });
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Kubernetes Cluster ${'label'}`} />
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        style={{ marginTop: 8, marginBottom: 8 }}
      >
        <Grid item className={classes.titleWrapper}>
          <Breadcrumb
            linkTo={{
              pathname: `/kubernetes`
            }}
            linkText="Clusters"
            labelTitle={cluster.label}
            data-qa-breadcrumb
          />
        </Grid>
      </Grid>

      <Grid container direction="row" className={classes.section}>
        <Grid container item direction="column" xs={9}>
          <Grid item>
            <NodePoolsDisplay
              editing={editing}
              toggleEditing={toggleEditing}
              updatePool={updatePool}
              deletePool={handleDeletePool}
              resetForm={resetFormState}
              pools={cluster.node_pools}
              poolsForEdit={pools}
              types={typesData || []}
            />
          </Grid>
          <Grid item>
            <NodePoolPanel
              hideTable
              pools={[]} // Not needed
              selectedType={selectedType}
              types={typesData || []}
              nodeCount={count}
              addNodePool={handleAddNodePool}
              deleteNodePool={() => null} // Not needed since we're not displaying the table from inside this component
              handleTypeSelect={(newType) => setSelectedType(newType)}
              updateNodeCount={(newCount) => setCount(newCount)}
              updatePool={() => null} // Not needed
              typesLoading={typesLoading}
              typesError={
                typesError
                  ? getAPIErrorOrDefault(
                      typesError,
                      'Error loading Linode type information.'
                    )[0].reason
                  : undefined
              }
            />
          </Grid>
          <Grid item className={classes.section}>
            <Button destructive type="secondary" onClick={() => null}>
              Delete Cluster
            </Button>
          </Grid>
        </Grid>
        <Grid container item direction="column" xs={3}>
          <Grid item className={classes.button}>
            <Button type="primary">Download kubeconfig</Button>
          </Grid>
          <Grid item className={classes.section}>
            <KubeSummaryPanel cluster={cluster} />
          </Grid>
          <Grid item className={classes.section}>
            <Paper>
              <Typography variant="h3" className={classes.title} data-qa-title>
                Cluster Tags
              </Typography>
              <div className={classes.panelItem}>
                <TagsPanel
                  tags={['tag1', 'tag2']}
                  updateTags={() => Promise.resolve()}
                />
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const withCluster = KubeContainer<{}, WithTypesProps & RouteComponentProps<{clusterID: string}>>((
  ownProps,
  clustersLoading,
  lastUpdated,
  clustersError,
  clustersData,
) => {
  const thisCluster = clustersData.find(c => c.id === ownProps.match.params.clusterID);
  const cluster = thisCluster ? extendCluster(thisCluster, ownProps.typesData || []): null;
  return {
  ...ownProps,
  cluster,
  lastUpdated,
  clustersLoading
}})

const enhanced = compose<CombinedProps, {}>(
  styled,
  withTypes,
  withCluster,
  withRouter,
);

export default enhanced(KubernetesClusterDetail);
