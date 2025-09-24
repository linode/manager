import { Autocomplete, SelectedIcon, StyledListItem } from '@linode/ui';
import { Box } from '@mui/material';
import React, { useMemo } from 'react';

import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { RESOURCE_FILTER_MAP } from '../Utils/constants';
import { deepEqual, filterEndpointsUsingRegion } from '../Utils/FilterBuilder';

import type {
  CloudPulseMetricsFilter,
  FilterValueType,
} from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceType, FilterValue } from '@linode/api-v4';

export interface CloudPulseEndpoints {
  /**
   * The label of the endpoint which is 's3_endpoint' in the response from the API
   */
  label: string;
  /**
   * The region of the endpoint
   */
  region: string;
}

export interface CloudPulseEndpointsSelectProps {
  /**
   * The default value of the endpoints filter
   */
  defaultValue?: Partial<FilterValue>;
  /**
   * Whether the endpoints filter is disabled
   */
  disabled?: boolean;
  /**
   * The function to handle the endpoints selection
   */
  handleEndpointsSelection: (endpoints: string[], savePref?: boolean) => void;
  /**
   * The label of the endpoints filter
   */
  label: string;
  /**
   * The placeholder of the endpoints filter
   */
  placeholder?: string;
  /**
   * The region of the endpoints
   */
  region?: FilterValueType;
  /**
   * Whether to save the preferences
   */
  savePreferences?: boolean;
  /**
   * The service type
   */
  serviceType: CloudPulseServiceType | undefined;
  /**
   * The dependent filters of the endpoints
   */
  xFilter?: CloudPulseMetricsFilter;
}

export const CloudPulseEndpointsSelect = React.memo(
  (props: CloudPulseEndpointsSelectProps) => {
    const {
      defaultValue,
      disabled,
      handleEndpointsSelection,
      label,
      placeholder,
      region,
      serviceType,
      savePreferences,
      xFilter,
    } = props;

    const {
      data: buckets,
      isError,
      isLoading,
    } = useResourcesQuery(
      disabled !== undefined ? !disabled : Boolean(region && serviceType),
      serviceType,
      {},

      RESOURCE_FILTER_MAP[serviceType ?? ''] ?? {}
    );

    const validSortedEndpoints = useMemo(() => {
      if (!buckets) return [];

      const visitedEndpoints = new Set<string>();
      const uniqueEndpoints: CloudPulseEndpoints[] = [];

      buckets.forEach(({ endpoint, region }) => {
        if (endpoint && region && !visitedEndpoints.has(endpoint)) {
          visitedEndpoints.add(endpoint);
          uniqueEndpoints.push({ label: endpoint, region });
        }
      });

      uniqueEndpoints.sort((a, b) => a.label.localeCompare(b.label));
      return uniqueEndpoints;
    }, [buckets]);

    const [selectedEndpoints, setSelectedEndpoints] =
      React.useState<CloudPulseEndpoints[]>();

    /**
     * This is used to track the open state of the autocomplete and useRef optimizes the re-renders that this component goes through and it is used for below
     * When the autocomplete is already closed, we should publish the resources on clear action and deselect action as well since onclose will not be triggered at that time
     * When the autocomplete is open, we should publish any resources on clear action until the autocomplete is close
     */
    const isAutocompleteOpen = React.useRef(false); // Ref to track the open state of Autocomplete

    const getEndpointsList = React.useMemo<CloudPulseEndpoints[]>(() => {
      return filterEndpointsUsingRegion(validSortedEndpoints, xFilter) ?? [];
    }, [validSortedEndpoints, xFilter]);

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      if (disabled && !selectedEndpoints) {
        return;
      }
      // To save default values, go through side effects if disabled is false
      if (!buckets || !savePreferences || selectedEndpoints) {
        if (selectedEndpoints) {
          setSelectedEndpoints([]);
          handleEndpointsSelection([]);
        }
      } else {
        const defaultEndpoints =
          defaultValue && Array.isArray(defaultValue)
            ? defaultValue.map((endpoint) => String(endpoint))
            : [];
        const endpoints = getEndpointsList.filter((endpointObj) =>
          defaultEndpoints.includes(endpointObj.label)
        );

        handleEndpointsSelection(endpoints.map((endpoint) => endpoint.label));
        setSelectedEndpoints(endpoints);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buckets, region, xFilter, serviceType]);

    return (
      <Autocomplete
        autoHighlight
        clearOnBlur
        data-testid="endpoint-select"
        disabled={disabled}
        errorText={isError ? `Failed to fetch ${label || 'Endpoints'}.` : ''}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        label={label || 'Endpoints'}
        limitTags={1}
        loading={isLoading}
        multiple
        noMarginTop
        onChange={(_e, endpointSelections) => {
          setSelectedEndpoints(endpointSelections);

          if (!isAutocompleteOpen.current) {
            handleEndpointsSelection(
              endpointSelections.map((endpoint) => endpoint.label),
              savePreferences
            );
          }
        }}
        onClose={() => {
          isAutocompleteOpen.current = false;
          handleEndpointsSelection(
            selectedEndpoints?.map((endpoint) => endpoint.label) ?? [],
            savePreferences
          );
        }}
        onOpen={() => {
          isAutocompleteOpen.current = true;
        }}
        options={getEndpointsList}
        placeholder={
          selectedEndpoints?.length ? '' : placeholder || 'Select Endpoints'
        }
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          const isEndpointSelected = selectedEndpoints?.some(
            (item) => item.label === option.label
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
                <SelectedIcon visible={isEndpointSelected || false} />
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
        }}
        value={selectedEndpoints ?? []}
      />
    );
  },
  compareProps
);

function compareProps(
  prevProps: CloudPulseEndpointsSelectProps,
  nextProps: CloudPulseEndpointsSelectProps
): boolean {
  // these properties can be extended going forward
  const keysToCompare: (keyof CloudPulseEndpointsSelectProps)[] = [
    'region',
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
