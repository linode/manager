import deepEqual from 'fast-deep-equal';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { RESOURCES } from '../Utils/constants';
import {
  getUserPreferenceObject,
  updateGlobalFilterPreference,
} from '../Utils/UserPreference';

import type { Filter } from '@linode/api-v4';

export interface CloudPulseResources {
  id: string;
  label: string;
  region?: string;
}

export interface CloudPulseResourcesSelectProps {
  disabled?: boolean;
  handleResourcesSelection: (resources: CloudPulseResources[]) => void;
  placeholder?: string;
  region?: string;
  resourceType: string | undefined;
  savePreferences?: boolean;
  xFilter?: Filter;
}

export const CloudPulseResourcesSelect = React.memo(
  (props: CloudPulseResourcesSelectProps) => {
    const {
      disabled,
      handleResourcesSelection,
      placeholder,
      region,
      resourceType,
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
    >([]);

    const getResourcesList = (): CloudPulseResources[] => {
      return resources && resources.length > 0 ? resources : [];
    };

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      const saveResources = getUserPreferenceObject()?.resources;
      const defaultResources = Array.isArray(saveResources)
        ? Array.of(saveResources).map((resourceId) => String(resourceId))
        : undefined;
      if (resources) {
        if (defaultResources) {
          const resource = getResourcesList().filter((resource) =>
            defaultResources.includes(String(resource.id))
          );

          handleResourcesSelection(resource);
          setSelectedResources(resource);
        } else {
          setSelectedResources([]);
          handleResourcesSelection([]);
        }
      } else {
        setSelectedResources([]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resources, region, resourceType, xFilter]);

    return (
      <Autocomplete
        onChange={(_: any, resourceSelections: CloudPulseResources[]) => {
          updateGlobalFilterPreference({
            [RESOURCES]: resourceSelections.map((resource: { id: string }) =>
              String(resource.id)
            ),
          });
          setSelectedResources(resourceSelections);
          handleResourcesSelection(resourceSelections);
        }}
        textFieldProps={{
          InputProps: {
            sx: {
              maxHeight: '55px',
              overflow: 'scroll',
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
        options={getResourcesList()}
        placeholder={placeholder ? placeholder : 'Select Resources'}
        value={selectedResources}
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

  // Deep comparison for xFilter
  if (!deepEqual(prevProps.xFilter, nextProps.xFilter)) {
    return false;
  }

  // Ignore function props in comparison
  return true;
}
