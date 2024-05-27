/* eslint-disable no-console */
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
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
  const [selectedResource, setResource] = React.useState<any>([]);
  const defaultCalls = React.useRef(false);
  const filterResourcesByRegion = (resourcesList: any[]) => {
    return resourcesList?.filter((resource: any) => {
      if (props.region == undefined) {
        return true;
      }
      if (resource.region) {
        return resource.region === props.region;
      } else if (resource.regions) {
        return resource.regions.includes(props.region);
      } else {
        return false;
      }
    });
  };

  const getResourceList = () => {
    return props.resourceType && resourceOptions[props.resourceType]
      ? filterResourcesByRegion(resourceOptions[props.resourceType]?.data)
      : [];
  };

  ({ data: resourceOptions['linode'] } = useLinodeResourcesQuery(
    props.resourceType === 'linode'
  ));
  ({ data: resourceOptions['aclb'] } = useLoadBalancerResourcesQuery(
    props.resourceType === 'aclb'
  ));

  const getSelectedResources = () => {
    const selectedResourceObj = getResourceList().filter(
      (obj) => props.defaultValue && props.defaultValue?.includes(obj.id)
    );

    defaultCalls.current = true;
    setResource(selectedResourceObj);
    props.handleResourceChange(selectedResourceObj, 'default');
  };

  React.useEffect(() => {
    setResource([]);
  }, [props.region, props.resourceType]);

  React.useEffect(() => {
    if (!defaultCalls.current && resourceOptions[props.resourceType!]) {
      getSelectedResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceOptions]);

  return (
    <Autocomplete
      onChange={(_: any, resource: any, reason) => {
        setResource(resource);
        props.handleResourceChange(resource, reason);
      }}
      autoHighlight
      clearOnBlur
      data-testid={'Resource-select'}
      disabled={props.disabled}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      key={'multi-select-resource'}
      label=""
      limitTags={2}
      multiple
      options={getResourceList()}
      placeholder="Select a resource"
      value={selectedResource ? selectedResource : []}
    />
  );
};
