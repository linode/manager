import * as React from 'react';
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
import { ExtendedPoolNode } from '.././types';
import NodePoolPanel from '../CreateCluster/NodePoolPanel';
import KubeSummaryPanel from './KubeSummaryPanel';

type ClassNames = 'root' | 'title' | 'titleWrapper' | 'backButton' | 'section';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    display: 'flex',
    alignItems: 'center'
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
  }
});

interface ClusterEditingState {
  nodePools: ExtendedPoolNode[];
}

type CombinedProps = {} & WithStyles<ClassNames>;

export const KubernetesClusterDetail: React.FunctionComponent<
  CombinedProps
> = props => {
  const [editing, setEditing] = React.useState<boolean>(false);
  const [fields, updateFields] = React.useState<ClusterEditingState>({
    nodePools: []
  });
  const { classes } = props;

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
            labelTitle={`${'Cluster-label'}`}
            data-qa-breadcrumb
          />
        </Grid>
      </Grid>

      <Grid container direction="row" className={classes.section}>
        <Grid container item direction="column" xs={10}>
          <Grid item>Node Pool table</Grid>
          <Grid item>
            <NodePoolPanel
              pools={[]}
              types={[]}
              addNodePool={() => null}
              deleteNodePool={() => null}
              handleTypeSelect={() => null}
              updateNodeCount={() => null}
              nodeCount={0}
              typesLoading={false}
            />
          </Grid>
        </Grid>
        <Grid container item direction="column" xs={2}>
          <Grid item className={classes.section}>
            <Button type="primary">Download kubeconfig</Button>
          </Grid>
          <Grid item className={classes.section}>
            <KubeSummaryPanel />
          </Grid>
          <Grid item className={classes.section}>
            <Paper>
              <Typography variant="h3" className={classes.title} data-qa-title>
                Tags
              </Typography>
              <TagsPanel
                tags={['tag1', 'tag2']}
                updateTags={() => Promise.resolve()}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(styled);

export default enhanced(KubernetesClusterDetail);
