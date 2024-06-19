import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

export interface CloudPulseResources {
  id: number;
  label: string;
  region?: string; // usually linodes are associated with only one region
  regions?: string[]; // aclb are associated with multiple regions
}

export interface CloudPulseResourcesSelectProps {
  defaultSelection?: number[];
  handleResourcesSelection: (resources: CloudPulseResources[]) => void;
  placeholder?: string;
  region: string | undefined;
  resourceType: string | undefined;
}

export const CloudPulseResourcesSelect = React.memo(
  (props: CloudPulseResourcesSelectProps) => {
    const [selectedResource, setResources] = React.useState<
      CloudPulseResources[]
    >([]);
    const { data: resources, isLoading } = useResourcesQuery(
      props.region && props.resourceType ? true : false,
      props.resourceType,
      {},
      { region: props.region }
    );

    const getResourcesList = (): CloudPulseResources[] => {
      return resources && resources.length > 0 ? resources : [];
    };

    React.useEffect(() => {
      const defaultResources = resources?.filter((instance) =>
        props.defaultSelection?.includes(instance.id)
      );

      if (defaultResources && defaultResources.length > 0) {
        setResources(defaultResources);
        props.handleResourcesSelection(defaultResources!);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resources, props.region]); // only on any resources or region change, select defaults if any

    return (
      <Autocomplete
        onChange={(_: any, resourceSelections: any) => {
          setResources(resourceSelections);
          props.handleResourcesSelection(resourceSelections);
        }}
        autoHighlight
        clearOnBlur
        data-testid={'Resource-select'}
        disabled={!props.region || !props.resourceType || isLoading}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        label=""
        limitTags={2}
        multiple
        options={getResourcesList()}
        placeholder={props.placeholder ? props.placeholder : 'Select Resources'}
        value={selectedResource ? selectedResource : []}
      />
    );
  },
  compareProps // we can re-render this component, on only region and resource type changes
);

function compareProps(
  oldProps: CloudPulseResourcesSelectProps,
  newProps: CloudPulseResourcesSelectProps
) {
  return (
    oldProps.region == newProps.region &&
    oldProps.resourceType == newProps.resourceType
  );
}
