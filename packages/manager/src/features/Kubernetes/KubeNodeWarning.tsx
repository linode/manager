import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';

const nodeWarning = `We recommend at least 3 nodes in each pool. Fewer nodes may affect availability.`;

const useStyles = makeStyles((theme: Theme) => ({
  notice: {
    color: theme.cmrTextColors.headlineStatic,
    fontSize: '1rem',
    lineHeight: `20px`,
    '& p': {
      fontSize: '1rem',
    },
  },
}));

interface Props {
  spacingTop?: 0 | 8 | 16 | 24;
}

function KubeNodeWarning(props: Props) {
  const classes = useStyles();
  const { spacingTop } = props;

  return (
    <Notice warning important spacingTop={spacingTop || 0}>
      <Typography className={`${classes.notice} noticeText`}>
        {`${nodeWarning} For more info see `}
        <Link to="https://www.linode.com/docs/products/compute/kubernetes/guides/create-lke-cluster/">
          Kubernetes docs and resources.
        </Link>
      </Typography>
    </Notice>
  );
}

export default KubeNodeWarning;
