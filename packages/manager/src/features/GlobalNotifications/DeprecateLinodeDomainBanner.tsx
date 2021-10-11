import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  domains: {
    fontFamily: theme.font.bold,
  },
}));

export const DeprecateLinodeDomainBanner: React.FC<{}> = () => {
  const classes = useStyles();

  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'linode-domain'
  );

  if (hasDismissedBanner) {
    return null;
  }

  return (
    <Notice important warning dismissible onClose={handleDismiss}>
      <Typography>
        Linode is deprecating the{' '}
        <span className={classes.domains}>members.linode.com</span> and{' '}
        <span className={classes.domains}>nodebalancer.linode.com</span> domains
        provided to all Linodes and NodeBalancers. By December 31st, 2021,
        update your scripts, applications, or settings to use the new default
        domain.{' '}
        <Link to="https://www.linode.com/docs/guides/members-linode-com-migration">
          Review documentation here
        </Link>
        .
      </Typography>
    </Notice>
  );
};

export default DeprecateLinodeDomainBanner;
