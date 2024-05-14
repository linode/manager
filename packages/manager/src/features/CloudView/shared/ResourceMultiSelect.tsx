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

export const CloudViewMultiResourceSelect = (
  props: CloudViewResourceSelectProps
) => {
  const resourceOptions: any = {};

  const [reason, setReason] = React.useState<string>('default');

  const getResourceList = () => {
    if (props.region && props.resourceType) {
      return props.resourceType && resourceOptions[props.resourceType]
        ? filterResourcesByRegion(resourceOptions[props.resourceType]?.data)
        : [];
    }
    return [];
  };

  const getSelectedResource = () => {
    if (selectedResource && selectedResource.length > 0) {
      return selectedResource;
    } else if (reason != 'clear') {
      const resourcesObj = getResourceList().filter(
        (obj: any) => props.defaultValue && props.defaultValue?.includes(obj.id)
      );

      if (resourcesObj && resourcesObj.length > 0) {
        setResource(resourcesObj);
        return resourcesObj;
      }
    }

    return selectedResource;
  };

  const [selectedResource, setResource] = React.useState<any>([]);
  const [resourceInputValue, setResourceInputValue] = React.useState('');

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

  React.useEffect(() => {
    props.handleResourceChange(selectedResource, reason);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  React.useEffect(() => {
    setResource([]);
    setResourceInputValue('');
    props.handleResourceChange([], 'clear');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.region, props.resourceType]);

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
      onChange={(_: any, resource: any) => {
        setResource(resource);
      }}
      onInputChange={(event, newInputValue, reason) => {
        setReason(reason);
        setResourceInputValue(newInputValue);
      }}
      autoHighlight
      clearOnBlur
      defaultValue={selectedResource}
      disabled={props.disabled}
      inputValue={resourceInputValue}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      label=""
      limitTags={2}
      multiple
      options={getResourceList()}
      placeholder="Select a resource"
      value={getSelectedResource()}
    />
  );
};
