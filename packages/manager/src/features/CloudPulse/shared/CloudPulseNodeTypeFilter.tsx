import { Autocomplete } from '@linode/ui';
import * as React from 'react';

import { useAllDatabasesQuery } from 'src/queries/databases/databases';

import type { DatabaseInstance, FilterValue } from '@linode/api-v4';

export interface CloudPulseNodeType {
  id: string;
  label: string;
}

export interface CloudPulseNodeTypeFilterProps {
  database_ids?: number[];
  defaultValue?: FilterValue;
  disabled?: boolean;
  handleNodeTypeChange: (
    nodeTypeId: string | undefined,
    labels: string[],
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
    ] = React.useState<CloudPulseNodeType | null>();

    const {
      data: databaseClusters,
      isError,
      isLoading,
    } = useAllDatabasesQuery(); // fetch all databases

    const nodeTypeOptionslist = [
      {
        id: 'primary',
        label: 'Primary',
      },
      {
        id: 'secondary',
        label: 'Secondary',
      },
    ];

    const isClusterSizeGreaterThanOne = React.useMemo<
      boolean | undefined
    >(() => {
      if (!databaseClusters || !database_ids?.length) {
        return undefined;
      }
      // check if any cluster has a size greater than 1 for selected database ids
      return databaseClusters.some(
        (cluster: DatabaseInstance) =>
          database_ids.includes(cluster.id) && cluster.cluster_size > 1
      );
    }, [databaseClusters, database_ids]);

    React.useEffect(() => {
      // when savePreferences is false, we retain the primary selection as default selected value
      if (!savePreferences) {
        setSelectedNodeType(nodeTypeOptionslist[0]);
        handleNodeTypeChange(nodeTypeOptionslist[0].id, [
          nodeTypeOptionslist[0].label,
        ]);
        return;
      }

      // when savePreferences is true and selected node is undefined
      if (
        isClusterSizeGreaterThanOne !== undefined &&
        savePreferences &&
        selectedNodeType === undefined
      ) {
        const nodeType =
          nodeTypeOptionslist.find((type) => type.id === defaultValue) ??
          nodeTypeOptionslist[0]; // set default value if available else set primary as default
        setSelectedNodeType(nodeType);
        handleNodeTypeChange(nodeType?.id, nodeType ? [nodeType?.label] : []);
        return;
      }
      // when selected node type is null and clustersize is defined
      if (
        selectedNodeType == null &&
        isClusterSizeGreaterThanOne !== undefined
      ) {
        setSelectedNodeType(nodeTypeOptionslist[0]);
        handleNodeTypeChange(nodeTypeOptionslist[0].id, [
          nodeTypeOptionslist[0].label,
        ]);
        return;
      }
      // if node type is already selected, check validity for current clusters
      if (selectedNodeType) {
        if (isClusterSizeGreaterThanOne === undefined) {
          setSelectedNodeType(null);
          handleNodeTypeChange(undefined, []);
          return;
        }

        const isNodeTypeValid = isClusterSizeGreaterThanOne
          ? nodeTypeOptionslist.find((type) => type.id === selectedNodeType.id)
          : false;

        if (!isNodeTypeValid) {
          setSelectedNodeType(nodeTypeOptionslist[0]);
          handleNodeTypeChange(nodeTypeOptionslist[0].id, [
            nodeTypeOptionslist[0].label,
          ]);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savePreferences, defaultValue, isClusterSizeGreaterThanOne]);

    return (
      <Autocomplete
        isOptionEqualToValue={(option, value) =>
          option.id === value.id && option.label === value.label
        }
        onChange={(_e, selectedNode) => {
          handleNodeTypeChange(
            selectedNode?.id,
            selectedNode ? [selectedNode.label] : [],
            savePreferences
          );
          setSelectedNodeType(selectedNode ?? null);
        }}
        options={
          isClusterSizeGreaterThanOne !== undefined
            ? isClusterSizeGreaterThanOne
              ? nodeTypeOptionslist
              : [nodeTypeOptionslist[0]]
            : []
        }
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
        placeholder={placeholder ?? 'Select a Node Type'}
        value={selectedNodeType ?? null}
      />
    );
  }
);
