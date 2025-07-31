import { useLinodesQuery } from '@linode/queries';
import { capitalize } from '@linode/utilities';
import { useMemo } from 'react';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import type { Item } from '../../../constants';

interface FetchOptionsProps {
  dimensionLabel: null | string;
  entities?: string[];
  values: null | string[];
}
// Main custom hook to fetch options for autocomplete fields based on dimensionLabel.
export function useFetchOptions(
  props: FetchOptionsProps
): Item<string, string>[] {
  const { dimensionLabel, values, entities } = props;

  // Always fetch firewall resources (data will be undefined if not needed)
  const { data: firewallResources } = useResourcesQuery(
    dimensionLabel === 'parent_vm_entity_id' || dimensionLabel === 'region_id',
    'firewall'
  );

  // Always compute filtered firewall resources
  const filteredFirewallResources = useMemo(() => {
    if (!firewallResources?.length || !entities?.length) return [];
    return firewallResources.filter((fw: { id: string }) =>
      entities.includes(fw.id)
    );
  }, [firewallResources, entities]);

  // Always compute firewall linodes
  const firewallLinodes: Item<string, string>[] = useMemo(() => {
    const mergedEntities: Record<string, string> = filteredFirewallResources
      .map((fw: { entities?: Record<string, string> }) => fw.entities ?? {})
      .reduce(
        (acc: Record<string, string>, cur: Record<string, string>) => ({
          ...acc,
          ...cur,
        }),
        {}
      );
    return Object.entries(mergedEntities).map(([id, label]) => ({
      label,
      value: id,
    }));
  }, [filteredFirewallResources]);

  // Always compute selected firewall linode IDs
  const selectedFirewallLinodeIds = useMemo(
    () => firewallLinodes.map((l) => Number(l.value)),
    [firewallLinodes]
  );

  // Always fetch linodes (data will be undefined if not needed)
  const { data: linodes } = useLinodesQuery(
    {},
    selectedFirewallLinodeIds.length > 0
      ? {
          '+or': selectedFirewallLinodeIds.map((id) => ({ id })),
        }
      : {},
    selectedFirewallLinodeIds.length > 0
  );

  // Always compute linode regions
  const linodeRegions: Item<string, string>[] = useMemo(() => {
    if (!linodes || !entities?.length) return [];
    const regions = new Set<string>();
    linodes.data.forEach(
      (l: { region?: string }) => l.region && regions.add(l.region)
    );
    return Array.from(regions).map((region) => ({
      label: capitalize(region),
      value: region,
    }));
  }, [linodes, entities?.length]);

  // Always compute static options from selectedDimension.values
  const staticOptions: Item<string, string>[] = useMemo(() => {
    return (
      values?.map((val: string) => ({
        label: capitalize(val),
        value: val,
      })) ?? []
    );
  }, [values]);

  // Return the correct options based on dimensionLabel
  switch (dimensionLabel) {
    case 'parent_vm_entity_id':
      return firewallLinodes;
    case 'region_id':
      return linodeRegions;
    default:
      return staticOptions;
  }
}
