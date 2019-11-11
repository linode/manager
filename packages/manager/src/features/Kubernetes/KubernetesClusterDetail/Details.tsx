import * as React from 'react';

import LibraryBook from 'src/assets/icons/guides.svg';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import NodePoolsDisplay from './NodePoolsDisplay';

import { ExtendedCluster } from '.././types';

const useStyles = makeStyles((theme: Theme) => ({
  docsWrapper: {
    padding: theme.spacing(3),
    margin: `${theme.spacing(3)}px 0`
  },
  docsIcon: {
    width: 24,
    position: 'relative',
    top: 2,
    marginRight: 8,
    color: theme.color.headline
  },
  docsHeaderWrapper: {
    marginBottom: theme.spacing(2)
  },
  post: {
    marginBottom: theme.spacing(1) / 2
  }
}));

interface Props {
  cluster: ExtendedCluster;
  nodePoolsLoading: boolean;
  typesData?: ExtendedType[];
}

export type CombinedProps = Props;

export const Details: React.FC<Props> = props => {
  const classes = useStyles();
  const { cluster, nodePoolsLoading, typesData } = props;

  if (!cluster) {
    return null;
  }

  const links = [
    {
      href:
        'https://www.linode.com/docs/applications/containers/kubernetes/how-to-deploy-a-cluster-with-lke/',
      title: 'Deploying LKE',
      idx: 1
    },
    {
      href:
        'https://www.linode.com/docs/applications/containers/kubernetes/troubleshooting-kubernetes/',
      title: 'Troubleshooting Kubernetes',
      idx: 2
    },
    {
      href:
        'https://www.linode.com/docs/applications/containers/kubernetes/beginners-guide-to-kubernetes/',
      title: "Beginner's Guide to Kubernetes",
      idx: 3
    }
  ];

  return (
    <>
      <Grid item xs={12}>
        <NodePoolsDisplay
          editing={false}
          pools={cluster.node_pools}
          poolsForEdit={[]}
          types={typesData || []}
          loading={nodePoolsLoading}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper className={classes.docsWrapper}>
          <Grid
            container
            item
            direction="row"
            justify="flex-start"
            alignItems="center"
            className={classes.docsHeaderWrapper}
          >
            <Grid item>
              <LibraryBook className={classes.docsIcon} />
            </Grid>
            <Grid item>
              <Typography variant="h3">Guides</Typography>
            </Grid>
          </Grid>
          <Grid item>
            {links.map(link => (
              <div key={link.idx}>
                <Typography variant="body1" className={classes.post}>
                  <ExternalLink link={link.href} text={link.title} />
                </Typography>
              </div>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};

export default Details;
