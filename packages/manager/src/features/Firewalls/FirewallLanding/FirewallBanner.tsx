import * as React from 'react';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import ExternalLink from 'src/components/ExternalLink';
import { dcDisplayNames } from 'src/constants';
import { useRegionsQuery } from 'src/queries/regions';
import arrayToList from 'src/utilities/arrayToCommaSeparatedList';

export const FirewallBanner: React.FC<{}> = (_) => {
  const regions = useRegionsQuery().data ?? [];
  const regionsWithFirewalls = regions.filter((thisRegion) =>
    thisRegion.capabilities.includes('Cloud Firewall')
  );

  const regionDisplayList = arrayToList(
    regionsWithFirewalls.map((thisRegion) => dcDisplayNames[thisRegion.id])
  );

  return (
    <DismissibleBanner preferenceKey="firewall-beta-notification">
      <Typography>
        Cloud Firewall is currently in beta and is subject to the terms of the{' '}
        <ExternalLink
          text="Early Adopter Testing Agreement"
          link="https://www.linode.com/legal-eatp/"
          hideIcon
        />
        . Firewalls can only be used with Linodes in {regionDisplayList}.
      </Typography>
    </DismissibleBanner>
  );
};

export default FirewallBanner;
