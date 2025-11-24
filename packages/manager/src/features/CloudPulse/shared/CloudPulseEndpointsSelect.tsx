import { Autocomplete, SelectedIcon, StyledListItem } from '@linode/ui';
import { Box } from '@mui/material';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { ENDPOINT, RESOURCE_FILTER_MAP } from '../Utils/constants';
import { deepEqual, filterEndpointsUsingRegion } from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { CLOUD_PULSE_TEXT_FIELD_PROPS } from './styles';

import type {
  CloudPulseMetricsFilter,
  FilterValueType,
} from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseResources } from './CloudPulseResourcesSelect';
import type { CloudPulseServiceType, FilterValue } from '@linode/api-v4';
import type { CloudPulseResourceTypeMapFlag } from 'src/featureFlags';

export interface CloudPulseEndpointsSelectProps {
  /**
   * The dashboard id for the endpoints filter
   */
  dashboardId: number;
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
   * Whether to restrict the selections
   */
  hasRestrictedSelections?: boolean;
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
      dashboardId,
      handleEndpointsSelection,
      label,
      placeholder,
      region,
      serviceType,
      savePreferences,
      xFilter,
      hasRestrictedSelections,
    } = props;

    const flags = useFlags();

    // Get the endpoints filter configuration for the dashboard
    const endpointsFilterConfig = FILTER_CONFIG.get(dashboardId)?.filters.find(
      (filter) => filter.configuration.filterKey === ENDPOINT
    );
    const filterFn = endpointsFilterConfig?.configuration.filterFn;

    const {
      data: validSortedEndpoints,
      isError,
      isLoading,
    } = useResourcesQuery(
      disabled !== undefined ? !disabled : Boolean(region && serviceType),
      serviceType,
      {},
      RESOURCE_FILTER_MAP[serviceType ?? ''] ?? {},
      undefined,
      filterFn
    );

    const [selectedEndpoints, setSelectedEndpoints] =
      React.useState<CloudPulseResources[]>();

    /**
     * This is used to track the open state of the autocomplete and useRef optimizes the re-renders that this component goes through and it is used for below
     * When the autocomplete is already closed, we should publish the resources on clear action and deselect action as well since onclose will not be triggered at that time
     * When the autocomplete is open, we should publish any resources on clear action until the autocomplete is close
     */
    const isAutocompleteOpen = React.useRef(false); // Ref to track the open state of Autocomplete

    const getEndpointsList = React.useMemo<CloudPulseResources[]>(() => {
      return filterEndpointsUsingRegion(validSortedEndpoints, xFilter) ?? [];
    }, [validSortedEndpoints, xFilter]);

    // Maximum endpoints selection limit is fetched from launchdarkly
    const maxEndpointsSelectionLimit = React.useMemo(() => {
      const obj = flags.aclpResourceTypeMap?.find(
        (item: CloudPulseResourceTypeMapFlag) =>
          item.serviceType === serviceType
      );
      return obj?.maxResourceSelections || 10;
    }, [serviceType, flags.aclpResourceTypeMap]);

    const endpointsLimitReached = React.useMemo(() => {
      return getEndpointsList.length > maxEndpointsSelectionLimit;
    }, [getEndpointsList.length, maxEndpointsSelectionLimit]);

    // Disable Select All option if the number of available endpoints are greater than the limit
    const disableSelectAll = hasRestrictedSelections
      ? endpointsLimitReached
      : false;

    const errorText = isError ? `Failed to fetch ${label || 'Endpoints'}.` : '';
    const helperText =
      !isError && hasRestrictedSelections
        ? `Select up to ${maxEndpointsSelectionLimit} ${label}`
        : '';

    // Check if the number of selected endpoints are greater than or equal to the limit
    const maxSelectionsReached = React.useMemo(() => {
      return (
        selectedEndpoints &&
        selectedEndpoints.length >= maxEndpointsSelectionLimit
      );
    }, [selectedEndpoints, maxEndpointsSelectionLimit]);

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      if (disabled && !selectedEndpoints) {
        return;
      }
      // To save default values, go through side effects if disabled is false
      if (!validSortedEndpoints || !savePreferences || selectedEndpoints) {
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
    }, [validSortedEndpoints, region, xFilter, serviceType]);

    return (
      <Autocomplete
        autoHighlight
        clearOnBlur
        data-testid="endpoint-select"
        disabled={disabled}
        disableSelectAll={disableSelectAll}
        errorText={errorText}
        helperText={helperText}
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

          const isMaxSelectionsReached =
            maxSelectionsReached &&
            !isEndpointSelected &&
            !isSelectAllORDeslectAllOption;

          return (
            <ListItem
              {...rest}
              aria-disabled={
                hasRestrictedSelections ? isMaxSelectionsReached : false
              }
              data-qa-option
              key={key}
            >
              <>
                <Box sx={{ flexGrow: 1 }}>{option.label}</Box>
                <SelectedIcon visible={isEndpointSelected || false} />
              </>
            </ListItem>
          );
        }}
        textFieldProps={{ ...CLOUD_PULSE_TEXT_FIELD_PROPS }}
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
