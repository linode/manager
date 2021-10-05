import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  storyItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 125,
    '& svg': {
      color: '#333',
    },
  },
  storyLabel: {
    fontSize: '0.875rem',
    margin: theme.spacing(),
  },
}));

const variantList = [
  { displayName: 'Managed', name: 'managed' },
  { displayName: 'Linode', name: 'linode' },
  { displayName: 'Volume', name: 'volume' },
  { displayName: 'NodeBalancer', name: 'nodebalancer' },
  { displayName: 'Firewall', name: 'firewall' },
  { displayName: 'StackScript', name: 'stackscript' },
  { displayName: 'Image', name: 'image' },
  { displayName: 'Domain', name: 'domain' },
  { displayName: 'Kubernetes', name: 'kube' },
  { displayName: 'Object Storage', name: 'bucket' },
  { displayName: 'Longview', name: 'longview' },
  { displayName: 'Marketplace', name: 'oca' },
];

const EntityIconStory: React.FC<{}> = () => {
  const classes = useStyles();

  return (
    <Grid container>
      {variantList.map((variant, idx) => {
        return (
          <Grid key={idx} item className={classes.storyItem}>
            <EntityIcon variant={variant.name as Variant} />
            <div className={classes.storyLabel}>{variant.displayName}</div>
          </Grid>
        );
      })}
    </Grid>
  );
};
export default EntityIconStory;
