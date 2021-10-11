import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';

// @todo: Remove this on December 8, 2021
export const DeprecateLinodeDomainBanner: React.FC<{}> = () => {
  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'deprecate-linode-domain'
  );

  if (hasDismissedBanner) {
    return null;
  }

  return (
    <Notice important warning dismissible onClose={handleDismiss}>
      <Typography>
        Linode is deprecating the <b>members.linode.com</b> and{' '}
        <b>nodebalancer.linode.com</b> domains provided to all Linodes and
        NodeBalancers. By December 31st, 2021, update your scripts,
        applications, or settings to use the new default domain.{' '}
        <Link to="https://www.linode.com/docs/guides/members-linode-com-migration">
          Review documentation here
        </Link>
        .
      </Typography>
    </Notice>
  );
};

export default DeprecateLinodeDomainBanner;
