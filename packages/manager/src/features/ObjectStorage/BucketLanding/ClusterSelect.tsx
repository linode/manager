import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useObjectStorageClusters } from 'src/queries/object-storage/queries';

import type { Region } from '@linode/api-v4/lib/regions';

interface Props {
  disabled?: boolean;
  error?: string;
  onBlur: (e: any) => void;
  onChange: (value: string) => void;
  required?: boolean;
  selectedCluster: string | undefined;
}

export const ClusterSelect: React.FC<Props> = (props) => {
  const {
    disabled,
    error,
    onBlur,
    onChange,
    required,
    selectedCluster,
  } = props;

  const { data: clusters, error: clustersError } = useObjectStorageClusters();
  const { data: regions } = useRegionsQuery();

  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const regionOptions = clusters?.reduce<Region[]>((acc, cluster) => {
    const region = regions?.find((r) => r.id === cluster.region);
    if (region) {
      acc.push({ ...region, id: cluster.id });
    }
    return acc;
  }, []);

  // Error could be: 1. General Clusters error, 2. Field error, 3. Nothing
  const errorText = clustersError
    ? 'Error loading regions'
    : error
    ? error
    : undefined;

  return (
    <RegionSelect
      currentCapability="Object Storage"
      data-qa-select-cluster
      disableClearable
      disabled={disabled}
      errorText={errorText}
      isGeckoLAEnabled={isGeckoLAEnabled}
      label="Region"
      onBlur={onBlur}
      onChange={(e, region) => onChange(region.id)}
      placeholder="Select a Region"
      regions={regionOptions ?? []}
      required={required}
      value={selectedCluster ?? undefined}
    />
  );
};

export default ClusterSelect;
