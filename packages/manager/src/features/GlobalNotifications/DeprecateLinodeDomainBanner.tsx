import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';

export const DeprecateLinodeDomainBanner: React.FC<{}> = () => {
  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'linode-domain'
  );

  if (hasDismissedBanner) {
    return null;
  }

  return (
    <Notice important warning dismissible onClose={handleDismiss}>
      <Typography>
        Effective Monday, January 31, 2022, all Linodes with members.linode.com
        and nodebalancer.linode.com forward or reverse DNS entries will be
        updated to linodeusercontent.com. <Link to="">Read more</Link>.
      </Typography>
    </Notice>
  );
};

export default DeprecateLinodeDomainBanner;
