import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';

interface Props {
  openAddFirewallDrawer: () => void;
}

export const FirewallLandingEmptyState = React.memo((props: Props) => {
  const { openAddFirewallDrawer } = props;
  return (
    <Placeholder
      title={'Firewalls'}
      icon={FirewallIcon}
      isEntity
      buttonProps={[
        {
          onClick: openAddFirewallDrawer,
          children: 'Create Firewall',
        },
      ]}
    >
      <Typography variant="h2">Secure cloud-based firewall</Typography>
      <Typography variant="subtitle1">
        Control network traffic to and from Linode Compute Instances with a
        simple management interface
      </Typography>
      <Link to="https://www.linode.com/docs/guides/getting-started-with-cloud-firewall/">
        Get started with Cloud Firewalls.
      </Link>
    </Placeholder>
  );
});
