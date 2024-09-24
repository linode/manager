import deepEqual from 'fast-deep-equal';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { themes } from 'src/utilities/theme';

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
        onChange={(e, resourceSelections: CloudPulseResources[]) => {
          setSelectedResources(resourceSelections);
          handleResourcesSelection(resourceSelections, savePreferences);
        }}
        placeholder={
          selectedResources?.length ? '' : placeholder || 'Select a Resource'
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
          hideLabel: true,
        }}
        autoHighlight
        clearOnBlur
        data-testid="resource-select"
        disabled={disabled || isLoading}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label="Select Resources"
        limitTags={2}
        multiple
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
    'handleResourcesSelection',
  ];

  for (const key of keysToCompare) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  // Deep comparison for xFilter
  if (!deepEqual(prevProps.xFilter, nextProps.xFilter)) {
    return false;
  }

  // Ignore function props in comparison
  return true;
}
