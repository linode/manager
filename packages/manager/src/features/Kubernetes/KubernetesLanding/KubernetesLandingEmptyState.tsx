import * as React from 'react';
import { useHistory } from 'react-router-dom';
import KubernetesSvg from 'src/assets/icons/entityIcons/kubernetes.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Placeholder from 'src/components/Placeholder';

const useStyles = makeStyles((theme: Theme) => ({
  placeholderAdjustment: {
    padding: `${theme.spacing(2)} 0 0 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(10)} 0 0 0`,
    },
  },
}));

export const KubernetesEmptyState = () => {
  const { push } = useHistory();
  const classes = useStyles();

  return (
    <Placeholder
      title="Kubernetes"
      isEntity
      icon={KubernetesSvg}
      className={classes.placeholderAdjustment}
      buttonProps={[
        {
          onClick: () => push('/kubernetes/create'),
          children: 'Create Cluster',
        },
      ]}
      showTransferDisplay
    >
      {' '}
      <Typography variant="subtitle1">Need help getting started?</Typography>
      <Typography variant="subtitle1">
        <a
          href="https://www.linode.com/docs/applications/containers/kubernetes/how-to-deploy-a-cluster-with-lke/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-u"
        >
          Learn more about getting started with LKE.
        </a>
      </Typography>
    </Placeholder>
  );
};
