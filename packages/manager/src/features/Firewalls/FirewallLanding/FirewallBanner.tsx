import * as React from 'react';
import DismissibleBanner from 'src/components/DismissibleBanner';
import { dcDisplayNames } from 'src/constants';
import { useRegionsQuery } from 'src/queries/regions';
import arrayToList from 'src/utilities/arrayToCommaSeparatedList';

export const FirewallBanner: React.FC<{}> = _ => {
  const regions = useRegionsQuery().data ?? [];
  const regionsWithFirewalls = regions.filter(thisRegion =>
    thisRegion.capabilities.includes('Cloud Firewall')
  );
  const regionDisplayList = arrayToList(
    regionsWithFirewalls.map(thisRegion => dcDisplayNames[thisRegion.id])
  );
  return (
    <DismissibleBanner
      preferenceKey="firewall-beta-notification"
      message={`Cloud Firewalls are currently in open beta. Firewalls can
        only be used with Linodes in ${regionDisplayList}.`}
    />
  );
};

export default FirewallBanner;
