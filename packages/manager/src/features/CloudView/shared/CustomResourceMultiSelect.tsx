/* eslint-disable no-console */
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import Select from 'src/components/EnhancedSelect/Select';
import {
  useLinodeResourcesQuery,
  useLoadBalancerResourcesQuery,
} from 'src/queries/cloudview/resources';

interface CloudViewResourceSelectProps {
  defaultValue?: any[];
  disabled: boolean;
  handleResourceChange: (resource: any, reason: string) => void;
  region: string | undefined;
  resourceType: string | undefined;
}

export const CustomCloudViewMultiResourceSelect = (
  props: CloudViewResourceSelectProps
) => {
  const resourceOptions: any = {};

  const isSet = React.useRef(false);

  const getResourceList = () => {
    if (props.region && props.resourceType) {
      return props.resourceType && resourceOptions[props.resourceType]
        ? filterResourcesByRegion(resourceOptions[props.resourceType]?.data)
        : [];
    }
    return [];
  };

  const getSelectedResources = () => {
    const selectedResource = getResourceList().filter(
      (obj) => props.defaultValue && props.defaultValue?.includes(obj.id)
    );

    if (!isSet.current) {
      props.handleResourceChange(selectedResource, 'default');
    }
    isSet.current = true;

    return selectedResource;
  };

  const filterResourcesByRegion = (resourcesList: any[]) => {
    return resourcesList?.filter((resource: any) => {
      if (resource.region) {
        return resource.region === props.region;
      } else if (resource.regions) {
        return resource.regions.includes(props.region);
      } else {
        return false;
      }
    });
  };

  ({ data: resourceOptions['linode'] } = useLinodeResourcesQuery(
    props.resourceType === 'linode'
  ));
  ({ data: resourceOptions['aclb'] } = useLoadBalancerResourcesQuery(
    props.resourceType === 'aclb'
  ));

  if (
    props.disabled ||
    !resourceOptions[props.resourceType!] ||
    !props.region
  ) {
    return (
      <Select
        isClearable={true}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onChange={() => {}}
        placeholder="Select Resources"
      />
    );
  }

  return (
    <Autocomplete
      onChange={(_: any, resource: any, reason) => {
        props.handleResourceChange(resource, reason);
      }}
      autoHighlight
      clearOnBlur
      disabled={props.disabled}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      label=""
      limitTags={2}
      multiple
      options={getResourceList()}
      placeholder="Select a resources"
      value={getSelectedResources()}
    />
  );
};
