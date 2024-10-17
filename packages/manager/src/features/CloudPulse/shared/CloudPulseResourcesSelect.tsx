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

    const { data: resources, isLoading } = useResourcesQuery(
      disabled !== undefined ? !disabled : Boolean(region && resourceType),
      resourceType,
      {},
      xFilter ? xFilter : { region }
    );

    const [selectedResources, setSelectedResources] = React.useState<
      CloudPulseResources[]
    >();

    // here we track the open state with ref to avoid unwanted re-renders, as we are any re-rendering while updating the selected values itself
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
