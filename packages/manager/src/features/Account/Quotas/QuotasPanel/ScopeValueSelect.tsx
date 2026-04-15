import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { Select } from '@linode/ui';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';

import type { SelectOption, SelectProps } from '@linode/ui';
import type {
  QuotaScope,
  ScopeValueSelectorProps,
} from 'src/features/Account/Quotas/quotaServices';
import {useState} from "react";
import {Region} from "@linode/api-v4";

type EndpointSelectOption = SelectOption<string>;

interface ScopeValueSelectProps {
  additionalProps: ScopeValueSelectorProps | undefined;
  onChange: (value: null | string) => void;
  scope: Omit<QuotaScope, 'global'>;
  sx?: SelectProps<any>['sx'];
}

export const ScopeValueSelect: React.FC<ScopeValueSelectProps> = ({
  scope,
  onChange,
  sx,
  additionalProps = {},
}) => {
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const [selectedRegion, setSelectedRegion] = useState<null | string>(null);

  const { data: regions, isFetching: isFetchingRegions } = useRegionsQuery(
    scope === 'region'
  );
  const { data: endpoints, isFetching: isFetchingEndpoints } =
    useObjectStorageEndpoints(scope === 'obj-endpoint');

  const handleRegionChange = (_: any, region: Region | null) => {
    const regionId = region?.id ?? null;
    setSelectedRegion(regionId);
    onChange(regionId);
  }

  const sortedEndpoints: EndpointSelectOption[] = React.useMemo(() => {
    return (endpoints ?? [])
      .filter((endpoint) => endpoint.s3_endpoint !== null)
      .map((endpoint) => ({
        label: `${endpoint.s3_endpoint} (Standard ${endpoint.endpoint_type})`,
        value: endpoint.s3_endpoint as string,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [endpoints]);

  if (scope === 'obj-endpoint') {
    return (
      <Select<EndpointSelectOption>
        data-testid="endpoint-select"
        disabled={isFetchingEndpoints}
        label="Object Storage Endpoint"
        loading={isFetchingEndpoints}
        onChange={(_event, value) => onChange(value?.value ?? null)}
        options={sortedEndpoints}
        placeholder={
          isFetchingEndpoints
            ? 'Loading Object Storage endpoints...'
            : 'Select an Object Storage endpoint'
        }
        searchable
        sx={sx}
      />
    );
  }

  return (
    <RegionSelect
      currentCapability={additionalProps?.regionCapability}
      data-testid="region-select"
      disabled={isFetchingRegions}
      isGeckoLAEnabled={isGeckoLAEnabled}
      loading={isFetchingRegions}
      onChange={handleRegionChange}
      regions={regions ?? []}
      value={selectedRegion}
    />
  );
};
