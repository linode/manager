import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';

interface Props {
  openAddFirewallDrawer: () => void;
}

const FirewallEmptyState: React.FC<Props> = props => {
  const { openAddFirewallDrawer } = props;
  return (
    <Placeholder
      title={'Firewalls'}
      icon={FirewallIcon}
      isEntity
      buttonProps={[
        {
          onClick: openAddFirewallDrawer,
          children: 'Add a Firewall',
        },
      ]}
    >
      <Typography variant="subtitle1">
        <div>Control network access to your Linodes from the Cloud.</div>
        <Link to="https://www.linode.com/docs/guides/getting-started-with-cloud-firewall/">
          Get started with Cloud Firewalls.
        </Link>
      </Typography>
    </Placeholder>
  );
};

export default React.memo(FirewallEmptyState);
