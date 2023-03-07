import * as React from 'react';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions';

interface Props {
  selectedCluster: string;
  onChange: (value: string) => void;
  onBlur: (e: any) => void;
  error?: string;
  disabled?: boolean;
}

export const ClusterSelect: React.FC<Props> = (props) => {
  const { selectedCluster, error, onChange, onBlur, disabled } = props;

  const { data, error: regionsError } = useRegionsQuery();

  const regions =
    data?.filter((r) => r.capabilities.includes('Object Storage')) ?? [];

  // Error could be: 1. General Clusters error, 2. Field error, 3. Nothing
  const errorText = regionsError
    ? 'Error loading regions'
    : error
    ? error
    : undefined;

  return (
    <RegionSelect
      data-qa-select-cluster
      name="cluster"
      label="Region"
      regions={regions}
      selectedID={selectedCluster}
      placeholder="Select a Region"
      handleSelection={(id) => onChange(id)}
      onBlur={onBlur}
      isSearchable={false}
      isClearable={false}
      errorText={errorText}
      disabled={disabled}
    />
  );
};

export default ClusterSelect;
