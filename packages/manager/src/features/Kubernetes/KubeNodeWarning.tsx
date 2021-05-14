import React from 'react';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';

export const nodeWarning = `We recommend at least 3 nodes in each pool. Fewer nodes may affect availability.`;

const useStyles = makeStyles(() => ({
  notice: {
    fontSize: '1rem',
  },
}));

function KubeNodeWarning() {
  const classes = useStyles();

  return (
    <Notice warning important spacingTop={16}>
      <Typography className={`${classes.notice} noticeText`}>
        {`${nodeWarning} For more info see `}
        <Link to="https://kubernetes.io/docs/setup/production-environment/">
          Kubernetes docs and resources.
        </Link>
      </Typography>
    </Notice>
  );
}

export default KubeNodeWarning;
