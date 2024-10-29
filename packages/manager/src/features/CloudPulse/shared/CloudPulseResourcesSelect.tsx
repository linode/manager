import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { themes } from 'src/utilities/theme';

import { deepEqual } from '../Utils/FilterBuilder';

import type { Filter, FilterValue } from '@linode/api-v4';

export interface CloudPulseResources {
  id: string;
  label: string;
  region?: string;
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
      xFilter,
    } = props;

    const platformFilter =
      resourceType === 'dbaas' ? { platform: 'rdbms-default' } : {};

    const { data: resources, isLoading } = useResourcesQuery(
      disabled !== undefined ? !disabled : Boolean(region && resourceType),
      resourceType,
      {},
      xFilter
        ? {
            ...platformFilter,
            ...xFilter,
          }
        : {
            ...platformFilter,
            region,
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

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
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
        textFieldProps={{
          InputProps: {
            sx: {
              maxHeight: '55px',
              overflow: 'auto',
              svg: {
                color: themes.light.color.grey3,
              },
            },
          },
        }}
        autoHighlight
        clearOnBlur
        data-testid="resource-select"
        disabled={disabled || isLoading}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label={label || 'Resources'}
        limitTags={2}
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
