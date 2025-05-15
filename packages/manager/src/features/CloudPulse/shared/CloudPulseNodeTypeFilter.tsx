import { Autocomplete } from '@linode/ui';
import * as React from 'react';

import { useAllDatabasesQuery } from 'src/queries/databases/databases';

import { PRIMARY_NODE } from '../Utils/constants';

import type { DatabaseInstance, FilterValue } from '@linode/api-v4';

export interface CloudPulseNodeType {
  id: string;
  label: string;
}

const nodeTypeOptionsList: CloudPulseNodeType[] = [
  {
    id: 'primary',
    label: 'Primary',
  },
  {
    id: 'secondary',
    label: 'Secondary',
  },
];

const nodeTypeMap = new Map<string, CloudPulseNodeType>(
  nodeTypeOptionsList.map((type) => [type.id, type])
);

const primaryNode = nodeTypeMap.get(PRIMARY_NODE);

export interface CloudPulseNodeTypeFilterProps {
  /**
   * Selected database cluster ids
   */
  database_ids?: number[];

  /**
   * Last selected node type value from user preferences
   */
  defaultValue?: FilterValue;

  /**
   * Boolean to check if the filter selection is to be disabled
   */
  disabled?: boolean;

  /**
   * This will handle the change in node type filter selection
   */
  handleNodeTypeChange: (
    nodeTypeId: string | undefined,
    labels: string[],
    savePref?: boolean
  ) => void;

  /**
   * A required label for the Autocomplete to ensure accessibility
   **/
  label: string;

  /**
   * Placeholder text for Node Type selection input
   **/
  placeholder?: string;

  /**
   * Boolean to check if preferences need to be saved and applied
   */
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

    const [selectedNodeType, setSelectedNodeType] =
      React.useState<CloudPulseNodeType | null>();

    const {
      data: databaseClusters,
      isError,
      isLoading,
    } = useAllDatabasesQuery(); // fetch all databases

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

    const handleNodeTypeSelection = (
      selectedNode: CloudPulseNodeType | null
    ) => {
      handleNodeTypeChange(
        selectedNode?.id,
        selectedNode ? [selectedNode.label] : [],
        savePreferences
      );
      setSelectedNodeType(selectedNode ?? null);
    };

    const availableOptions = getNodeTypeOptions(isClusterSizeGreaterThanOne);

    React.useEffect(() => {
      // when savePreferences is false, we retain the primary selection as default selected value
      if (!savePreferences) {
        setSelectedNodeType(primaryNode ?? nodeTypeOptionsList[0]);
        handleNodeTypeChange(primaryNode?.id ?? 'primary', [
          primaryNode?.label ?? 'primary',
        ]);
        return;
      }
      // when savePreferences is true and selected node is undefined, default value from preferences is shown on initial render
      if (
        isClusterSizeGreaterThanOne !== undefined &&
        savePreferences &&
        selectedNodeType === undefined
      ) {
        const nodeType = defaultValue
          ? nodeTypeMap.get(defaultValue as string)
          : undefined;
        setSelectedNodeType(nodeType);
        handleNodeTypeChange(nodeType?.id, nodeType ? [nodeType?.label] : []);
        return;
      }
      // set the selected node type as null to differentiate between initial and subsequent renders
      if (selectedNodeType) {
        setSelectedNodeType(null);
        handleNodeTypeChange(undefined, []);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savePreferences, database_ids?.sort().join(',')]);

    return (
      <Autocomplete
        autoHighlight
        clearOnBlur
        data-testid="node-type-select"
        disabled={disabled}
        errorText={isError ? 'Error loading node types.' : ''}
        fullWidth
        isOptionEqualToValue={(option, value) =>
          option.id === value.id && option.label === value.label
        }
        label={label || 'Node Type'}
        loading={isLoading}
        noMarginTop
        onChange={(_e, selectedNode) => handleNodeTypeSelection(selectedNode)}
        options={availableOptions}
        placeholder={placeholder ?? 'Select a Node Type'}
        slotProps={{
          popper: {
            placement: 'bottom',
          },
        }}
        value={selectedNodeType ?? null}
      />
    );
  }
);

/**
 * Calculates available node type options based on cluster size.
 * Returns only primary as an option if max cluster size is 1 for chosen clusters,
 * otherwise returns both primary and secondary options.
 *
 * @param isClusterSizeGreaterThanOne - Boolean indicating if any selected cluster has size > 1
 * @returns Array of available node type options
 */
const getNodeTypeOptions = (
  isClusterSizeGreaterThanOne: boolean | undefined
): CloudPulseNodeType[] => {
  return isClusterSizeGreaterThanOne === undefined
    ? []
    : isClusterSizeGreaterThanOne
      ? nodeTypeOptionsList
      : primaryNode
        ? [primaryNode]
        : [];
};
