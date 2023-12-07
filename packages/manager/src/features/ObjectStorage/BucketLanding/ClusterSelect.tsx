import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions';

interface Props {
  disabled?: boolean;
  error?: string;
  onBlur: (e: any) => void;
  onChange: (value: string) => void;
  required?: boolean;
  selectedCluster: string;
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

  const { data: regions, error: regionsError } = useRegionsQuery();

  // Error could be: 1. General Clusters error, 2. Field error, 3. Nothing
  const errorText = error || regionsError?.[0]?.reason;

  return (
    <RegionSelect
      currentCapability="Object Storage"
      data-qa-select-cluster
      disabled={disabled}
      errorText={errorText}
      handleSelection={(id) => onChange(id)}
      isClearable={false}
      label="Region"
      onBlur={onBlur}
      placeholder="Select a Region"
      regions={regions ?? []}
      required={required}
      selectedId={selectedCluster}
    />
  );
};

export default ClusterSelect;
