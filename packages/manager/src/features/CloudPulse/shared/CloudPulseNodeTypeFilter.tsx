/* eslint-disable react-hooks/exhaustive-deps */
import { Autocomplete } from '@linode/ui';
import * as React from 'react';

import { useAllDatabasesQuery } from 'src/queries/databases/databases';

import type { FilterValue } from '@linode/api-v4';

export interface CloudPulseNodeTypes {
  label: string;
}

export interface CloudPulseNodeTypeFilterProps {
  database_ids?: number[];
  defaultValue?: FilterValue;
  disabled?: boolean;
  handleNodeTypeChange: (
    nodeType: CloudPulseNodeTypes | null,
    savePref?: boolean
  ) => void;
  label: string;
  placeholder?: string;
  savePreferences?: boolean;
}

export const CloudPulseNodeTypeFilter = React.memo(
  (props: CloudPulseNodeTypeFilterProps) => {
    const {
      database_ids,
      defaultValue,
      disabled,
      handleNodeTypeChange,
      label,
      placeholder,
      savePreferences,
    } = props;

    const [
      selectedNodeType,
      setSelectedNodeType,
    ] = React.useState<CloudPulseNodeTypes | null>(null);

    const {
      data: databaseClusters,
      isError,
      isLoading,
    } = useAllDatabasesQuery(); // fetch all databases

    const maxClusterSize = React.useMemo<number>(() => {
      return !databaseClusters || !database_ids?.length
        ? 1
        : Math.max(
            ...databaseClusters
              .filter((cluster) => database_ids.includes(cluster.id))
              .map((cluster) => cluster.cluster_size)
          );
    }, [databaseClusters, database_ids]);

    // node type options are based on maximum cluster size of the selected databases
    const nodeTypeOptions = React.useMemo<CloudPulseNodeTypes[]>(() => {
      return maxClusterSize > 1
        ? [{ label: 'Primary' }, { label: 'Secondary' }]
        : [{ label: 'Primary' }];
    }, [maxClusterSize]);

    const initialRenderRef = React.useRef(true); // used to check if the component is being rendered for the first time

    // set the default node type based on preferences
    React.useEffect(() => {
      if (
        initialRenderRef.current &&
        database_ids?.length &&
        savePreferences &&
        defaultValue
      ) {
        const nodeType = nodeTypeOptions.find(
          (type) => type.label === defaultValue
        ) ?? {
          label: 'Primary',
        };
        setSelectedNodeType(nodeType);
        handleNodeTypeChange(nodeType);
        initialRenderRef.current = false;
      } else {
        setSelectedNodeType({ label: 'Primary' });
        handleNodeTypeChange({ label: 'Primary' });
      }
    }, [database_ids?.length, savePreferences, defaultValue, nodeTypeOptions]);

    return (
      <Autocomplete
        onChange={(_e, selectedNode) => {
          handleNodeTypeChange(selectedNode, savePreferences);
          setSelectedNodeType(selectedNode);
        }}
        slotProps={{
          popper: {
            placement: 'bottom',
          },
        }}
        autoHighlight
        clearOnBlur
        data-testid="node-type-select"
        disabled={disabled}
        errorText={isError ? 'Error loading node types.' : ''}
        fullWidth
        label={label || 'Node Type'}
        loading={isLoading}
        noMarginTop
        options={nodeTypeOptions}
        placeholder={placeholder ?? 'Select a Node Type'}
        value={selectedNodeType}
      />
    );
  }
);
