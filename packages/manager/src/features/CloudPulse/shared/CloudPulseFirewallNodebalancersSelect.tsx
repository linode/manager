import { useAllNodeBalancersQuery } from '@linode/queries';
import { Autocomplete, SelectedIcon, StyledListItem } from '@linode/ui';
import { Box } from '@mui/material';
import React from 'react';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { PARENT_ENTITY_REGION, RESOURCE_FILTER_MAP } from '../Utils/constants';
import { deepEqual, filterFirewallNodebalancers } from '../Utils/FilterBuilder';
import { getResourcesFilterConfig } from '../Utils/utils';

import type { CloudPulseMetricsFilter } from '../Dashboard/CloudPulseDashboardLanding';
import type {
  CloudPulseServiceType,
  Dashboard,
  FilterValue,
} from '@linode/api-v4';

export interface CloudPulseNodebalancers {
  /**
   * The region of the nodebalancer
   */
  associated_entity_region: string;
  /**
   * The id of the nodebalancer
   */
  id: string;
  /**
   * The label of the nodebalancer
   */
  label: string;
}

export interface CloudPulseFirewallNodebalancersSelectProps {
  /**
   * The default value of the nodebalancers filter
   */
  defaultValue?: Partial<FilterValue>;
  /**
   * Whether the nodebalancers filter is disabled
   */
  disabled?: boolean;
  /**
   * The function to handle the nodebalancers selection
   */
  handleNodebalancersSelection: (
    nodebalancers: CloudPulseNodebalancers[],
    savePref?: boolean
  ) => void;
  /**
   * Whether the nodebalancers filter is optional
   */
  isOptional?: boolean;
  /**
   * The label of the nodebalancers filter
   */
  label: string;
  /**
   * The placeholder of the nodebalancers filter
   */
  placeholder?: string;
  /**
   * Whether to save the preferences
   */
  savePreferences?: boolean;
  /**
   * The selected dashboard
   */
  selectedDashboard: Dashboard;
  /**
   * The service type
   */
  serviceType: CloudPulseServiceType | undefined;
  /**
   * The dependent filters of the nodebalancers
   */
  xFilter?: CloudPulseMetricsFilter;
}

export const CloudPulseFirewallNodebalancersSelect = React.memo(
  (props: CloudPulseFirewallNodebalancersSelectProps) => {
    const {
      defaultValue,
      disabled,
      handleNodebalancersSelection,
      label,
      placeholder,
      serviceType,
      savePreferences,
      xFilter,
      isOptional,
      selectedDashboard,
    } = props;

    // Get the associated entity type for the selected dashboard
    const associatedEntityType = getResourcesFilterConfig(
      selectedDashboard.id
    )?.associatedEntityType;
    const region = xFilter?.[PARENT_ENTITY_REGION];

    const { data: firewalls } = useResourcesQuery(
      disabled !== undefined ? !disabled : Boolean(region && serviceType),
      serviceType,
      {},

      RESOURCE_FILTER_MAP[serviceType ?? ''] ?? {},
      associatedEntityType
    );

    const [selectedNodebalancers, setSelectedNodebalancers] =
      React.useState<CloudPulseNodebalancers[]>();

    /**
     * This is used to track the open state of the autocomplete and useRef optimizes the re-renders that this component goes through and it is used for below
     * When the autocomplete is already closed, we should publish the resources on clear action and deselect action as well since onclose will not be triggered at that time
     * When the autocomplete is open, we should publish any resources on clear action until the autocomplete is close
     */
    const isAutocompleteOpen = React.useRef(false); // Ref to track the open state of Autocomplete

    const {
      data: nodebalancers,
      isError,
      isLoading,
    } = useAllNodeBalancersQuery();

    // Get the list of nodebalancers that are associated with the selected firewall
    const getNodebalancersList = React.useMemo<
      CloudPulseNodebalancers[]
    >(() => {
      return (
        filterFirewallNodebalancers(nodebalancers, xFilter, firewalls) ?? []
      );
    }, [firewalls, nodebalancers, xFilter]);

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      if (disabled && !selectedNodebalancers) {
        return;
      }
      // To save default values, go through side effects if disabled is false
      if (!getNodebalancersList || !savePreferences || selectedNodebalancers) {
        if (selectedNodebalancers) {
          setSelectedNodebalancers([]);
          handleNodebalancersSelection([]);
        }
      } else {
        // Get the default nodebalancers from the nodebalancer ids stored in preferences
        const defaultNodebalancers =
          defaultValue && Array.isArray(defaultValue)
            ? defaultValue.map((nodebalancer) => String(nodebalancer))
            : [];
        const nodebalancers = getNodebalancersList.filter((nodebalancerObj) =>
          defaultNodebalancers.includes(nodebalancerObj.id)
        );

        handleNodebalancersSelection(nodebalancers);
        setSelectedNodebalancers(nodebalancers);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getNodebalancersList, xFilter, serviceType]);

    return (
      <Autocomplete
        autoHighlight
        clearOnBlur
        data-testid="nodebalancer-select"
        disabled={disabled}
        errorText={
          isError ? `Failed to fetch ${label || 'NodeBalancers'}.` : ''
        }
        isOptionEqualToValue={(option, value) => option.label === value.label}
        label={label || 'NodeBalancers'}
        limitTags={1}
        loading={isLoading}
        multiple
        noMarginTop
        onChange={(_e, nodebalancerSelections) => {
          setSelectedNodebalancers(nodebalancerSelections);

          if (!isAutocompleteOpen.current) {
            handleNodebalancersSelection(
              nodebalancerSelections,
              savePreferences
            );
          }
        }}
        onClose={() => {
          isAutocompleteOpen.current = false;
          handleNodebalancersSelection(
            selectedNodebalancers ?? [],
            savePreferences
          );
        }}
        onOpen={() => {
          isAutocompleteOpen.current = true;
        }}
        options={getNodebalancersList}
        placeholder={
          selectedNodebalancers?.length
            ? ''
            : placeholder || 'Select NodeBalancers'
        }
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          const isNodebalancerSelected = selectedNodebalancers?.some(
            (item) => item.id === option.id
          );

          const isSelectAllORDeslectAllOption =
            option.label === 'Select All ' || option.label === 'Deselect All ';

          const ListItem = isSelectAllORDeslectAllOption
            ? StyledListItem
            : 'li';

          return (
            <ListItem {...rest} data-qa-option key={key}>
              <>
                <Box sx={{ flexGrow: 1 }}>{option.label}</Box>
                <SelectedIcon visible={isNodebalancerSelected || false} />
              </>
            </ListItem>
          );
        }}
        textFieldProps={{
          InputProps: {
            sx: {
              '::-webkit-scrollbar': {
                display: 'none',
              },
              maxHeight: '55px',
              msOverflowStyle: 'none',
              overflow: 'auto',
              scrollbarWidth: 'none',
            },
          },
          optional: isOptional,
        }}
        value={selectedNodebalancers ?? []}
      />
    );
  },
  compareProps
);

function compareProps(
  prevProps: CloudPulseFirewallNodebalancersSelectProps,
  nextProps: CloudPulseFirewallNodebalancersSelectProps
): boolean {
  const keysToCompare: (keyof CloudPulseFirewallNodebalancersSelectProps)[] = [
    'serviceType',
  ];

  for (const key of keysToCompare) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  if (!deepEqual(prevProps.xFilter, nextProps.xFilter)) {
    return false;
  }

  // Ignore function props in comparison
  return true;
}
