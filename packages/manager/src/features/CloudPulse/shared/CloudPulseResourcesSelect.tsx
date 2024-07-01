import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { getUserPreferenceObject, updateGlobalFilterPreference } from '../Utils/UserPreference';
import { RESOURCES } from '../Utils/CloudPulseConstants';
import Select from 'src/components/EnhancedSelect/Select';

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

    const [, setSelectedResources] = React.useState();  //state variable is used to re-render this component on changing the value.

    const getResourcesList = (): CloudPulseResources[] => {
      return resources && resources.length > 0 ? resources : [];
    };

    const getSelectedResource = (): CloudPulseResources[] | undefined => {
      const defaultResources = getUserPreferenceObject()?.resources
      let selectedResources = undefined;

      if (defaultResources) {
        selectedResources = getResourcesList().filter(resource => defaultResources.includes(String(resource.id)))
      }
      return selectedResources;
    }



    if (!resources) {
      return (<Select
        disabled={true}
        isClearable={true}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onChange={() => { }}
        placeholder="Select Resources"
      />)
    }

    return (
      <Autocomplete
        onChange={(_: any, resourceSelections: any) => {
          updateGlobalFilterPreference({
            [RESOURCES]: resourceSelections.map((resource: { id: any; }) => String(resource.id))
          });
          setSelectedResources(resourceSelections);
          props.handleResourcesSelection(resourceSelections);
        }}
        autoHighlight
        clearOnBlur
        data-testid={'Resource-select'}
        disabled={!props.region || !props.resourceType || isLoading}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label=""
        limitTags={2}
        multiple
        options={getResourcesList()}
        placeholder={props.placeholder ? props.placeholder : 'Select Resources'}
        value={getSelectedResource()}
      />
    );
  }
);
