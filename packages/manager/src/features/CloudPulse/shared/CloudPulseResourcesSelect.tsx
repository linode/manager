import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { RESOURCES } from '../Utils/constants';
import {
  getUserPreferenceObject,
  updateGlobalFilterPreference,
} from '../Utils/UserPreference';

export interface CloudPulseResources {
  id: string;
  label: string;
  region?: string; // usually linodes are associated with only one region
  regions?: string[]; // aclb are associated with multiple regions
}

export interface CloudPulseResourcesSelectProps {
  handleResourcesSelection: (resources: CloudPulseResources[]) => void;
  placeholder?: string;
  region: string | undefined;
  resourceType: string | undefined;
}

export const CloudPulseResourcesSelect = React.memo(
  (props: CloudPulseResourcesSelectProps) => {
    const { data: resources, isLoading } = useResourcesQuery(
      props.region && props.resourceType ? true : false,
      props.resourceType,
      {},
      { region: props.region }
    );

    const [selectedResources, setSelectedResources] = React.useState<any>();

    const getResourcesList = (): any[] => {
      return resources && resources.length > 0 ? resources : [];
    };

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      const defaultResources = getUserPreferenceObject()?.resources;
      if (resources) {
        if (defaultResources) {
          const resource = getResourcesList().filter((resource) =>
            defaultResources.includes(String(resource.id))
          );

          props.handleResourcesSelection(resource);
          setSelectedResources(resource);
        } else {
          setSelectedResources(undefined);
          props.handleResourcesSelection([]);
        }
      } else {
        setSelectedResources(undefined);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resources, props.region, props.resourceType]);

    return (
      <Autocomplete
        onChange={(_: any, resourceSelections: any) => {
          updateGlobalFilterPreference({
            [RESOURCES]: resourceSelections.map((resource: { id: any }) =>
              String(resource.id)
            ),
          });
          setSelectedResources(resourceSelections);
          props.handleResourcesSelection(resourceSelections);
        }}
        autoHighlight
        clearOnBlur
        data-testid="Resource-select"
        disabled={!props.region || !props.resourceType || isLoading}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label=""
        limitTags={2}
        multiple
        options={getResourcesList()}
        placeholder={props.placeholder ? props.placeholder : 'Select Resources'}
        value={selectedResources ?? []}
      />
    );
  }
);
