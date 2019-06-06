import * as React from 'react';
import { compose } from 'recompose';

import Breadcrumb from 'src/components/Breadcrumb';
import Grid from 'src/components/core/Grid';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ExtendedPoolNode } from '.././types';

type ClassNames =
  | 'root'
  | 'title'
  | 'titleWrapper'
  | 'backButton'
  | 'listParent'
  | 'label'
  | 'labelIcon'
  | 'status'
  | 'open'
  | 'ticketLabel'
  | 'closed';

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
  label: {
    marginBottom: theme.spacing.unit
  },
  ticketLabel: {
    position: 'relative',
    top: -3
  },
  labelIcon: {
    paddingRight: 0,
    '& .outerCircle': {
      fill: theme.bg.offWhiteDT,
      stroke: theme.bg.main
    },
    '& .circle': {
      stroke: theme.bg.main
    }
  },
  listParent: {},
  status: {
    marginLeft: theme.spacing.unit,
    color: theme.color.white
  },
  open: {
    backgroundColor: theme.color.green
  },
  closed: {
    backgroundColor: theme.color.red
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

      <Grid container className={classes.listParent}>
        Hello
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(styled);

export default enhanced(KubernetesClusterDetail);
