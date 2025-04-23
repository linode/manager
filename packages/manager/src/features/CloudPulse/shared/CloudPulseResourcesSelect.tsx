import { Autocomplete, SelectedIcon, StyledListItem } from '@linode/ui';
import { Box } from '@mui/material';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { deepEqual } from '../Utils/FilterBuilder';

import type { Filter, FilterValue } from '@linode/api-v4';

export interface CloudPulseResources {
  id: string;
  label: string;
  region?: string;
  tags?: string[];
}

export interface CloudPulseResourcesSelectProps {
  defaultValue?: Partial<FilterValue>;
  disabled?: boolean;
  handleResourcesSelection: (
    resources: CloudPulseResources[],
    savePref?: boolean
  ) => void;
  label: string;
  placeholder?: string;
  region?: string;
  resourceType: string | undefined;
  savePreferences?: boolean;
  tags?: string[];
  xFilter?: Filter;
}

export const CloudPulseResourcesSelect = React.memo(
  (props: CloudPulseResourcesSelectProps) => {
    const {
      defaultValue,
      disabled,
      handleResourcesSelection,
      label,
      placeholder,
      region,
      resourceType,
      savePreferences,
      tags,
      xFilter,
    } = props;

    const flags = useFlags();

    const resourceFilterMap: Record<string, Filter> = {
      dbaas: {
        '+order': 'asc',
        '+order_by': 'label',
        platform: 'rdbms-default',
      },
    };

    const { data: resources, isError, isLoading } = useResourcesQuery(
      disabled !== undefined ? !disabled : Boolean(region && resourceType),
      resourceType,
      {},
      xFilter
        ? {
            ...(resourceFilterMap[resourceType ?? ''] ?? {}),
            ...xFilter, // the usual xFilters
          }
        : {
            ...(resourceFilterMap[resourceType ?? ''] ?? {}),
            region,
            ...(tags ?? []),
          }
    );

    const [selectedResources, setSelectedResources] = React.useState<
      CloudPulseResources[]
    >();

    /**
     * This is used to track the open state of the autocomplete and useRef optimizes the re-renders that this component goes through and it is used for below
     * When the autocomplete is already closed, we should publish the resources on clear action and deselect action as well since onclose will not be triggered at that time
     * When the autocomplete is open, we should publish any resources on clear action until the autocomplete is close
     */
    const isAutocompleteOpen = React.useRef(false); // Ref to track the open state of Autocomplete

    const getResourcesList = React.useMemo<CloudPulseResources[]>(() => {
      return resources && resources.length > 0 ? resources : [];
    }, [resources]);

    // Maximum resource selection limit is fetched from launchdarkly
    const maxResourceSelectionLimit = React.useMemo(() => {
      const obj = flags.aclpResourceTypeMap?.find(
        (item) => item.serviceType === resourceType
      );
      return obj?.maxResourceSelections || 10;
    }, [resourceType, flags.aclpResourceTypeMap]);

    const resourcesLimitReached = React.useMemo(() => {
      return getResourcesList.length > maxResourceSelectionLimit;
    }, [getResourcesList.length, maxResourceSelectionLimit]);

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      if (disabled && !selectedResources) {
        return;
      }
      // To save default values, go through side effects if disabled is false
      if (resources && savePreferences && !selectedResources) {
        const defaultResources =
          defaultValue && Array.isArray(defaultValue)
            ? defaultValue.map((resource) => String(resource))
            : [];
        const resource = getResourcesList.filter((resource) =>
          defaultResources.includes(String(resource.id))
        );

        handleResourcesSelection(resource);
        setSelectedResources(resource);
      } else {
        if (selectedResources) {
          setSelectedResources([]);
        }
        handleResourcesSelection([]);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resources, region, xFilter, resourceType]);

    return (
      <Autocomplete
        helperText={
          !isError ? `Select up to ${maxResourceSelectionLimit} ${label}` : ''
        }
        onChange={(e, resourceSelections) => {
          setSelectedResources(resourceSelections);

          if (!isAutocompleteOpen.current) {
            handleResourcesSelection(resourceSelections, savePreferences);
          }
        }}
        onClose={() => {
          isAutocompleteOpen.current = false;
          handleResourcesSelection(selectedResources ?? [], savePreferences);
        }}
        onOpen={() => {
          isAutocompleteOpen.current = true;
        }}
        placeholder={
          selectedResources?.length ? '' : placeholder || 'Select Resources'
        }
        renderOption={(props, option) => {
          // After selecting resources up to the max resource selection limit, rest of the unselected options will be disabled if there are any
          const { key, ...rest } = props;
          const isResourceSelected = selectedResources?.some(
            (item) => item.label === option.label
          );

          const isSelectAllORDeslectAllOption =
            option.label === 'Select All ' || option.label === 'Deselect All ';

          const isMaxSelectionsReached =
            selectedResources &&
            selectedResources.length >= maxResourceSelectionLimit &&
            !isResourceSelected &&
            !isSelectAllORDeslectAllOption;

          const ListItem = isSelectAllORDeslectAllOption
            ? StyledListItem
            : 'li';

          return (
            <ListItem
              {...rest}
              aria-disabled={isMaxSelectionsReached}
              data-qa-option
              key={key}
            >
              <>
                <Box sx={{ flexGrow: 1 }}>{option.label}</Box>
                <SelectedIcon visible={isResourceSelected || false} />
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
        autoHighlight
        clearOnBlur
        data-testid="resource-select"
        disableSelectAll={resourcesLimitReached} // Select_All option will not be available if number of resources are higher than resource selection limit
        disabled={disabled}
        errorText={isError ? `Failed to fetch ${label || 'Resources'}.` : ''}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label={label || 'Resources'}
        limitTags={1}
        loading={isLoading}
        multiple
        noMarginTop
        options={getResourcesList}
        value={selectedResources ?? []}
      />
    );
  },
  compareProps
);

function compareProps(
  prevProps: CloudPulseResourcesSelectProps,
  nextProps: CloudPulseResourcesSelectProps
): boolean {
  // these properties can be extended going forward
  const keysToCompare: (keyof CloudPulseResourcesSelectProps)[] = [
    'region',
    'resourceType',
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
