/* eslint-disable no-console */
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import {
  useLinodeResourcesQuery,
  useLoadBalancerResourcesQuery,
} from 'src/queries/cloudview/resources';
import { fetchUserPrefObject, updateGlobalFilterPreference } from '../Utils/UserPreference';
import { RESOURCES } from '../Utils/CloudPulseConstants';

interface CloudViewResourceSelectProps {
  // defaultValue?: any[];
  disabled: boolean;
  handleResourceChange: (resource: any) => void;
  region: string | undefined;
  resourceType: string | undefined;
}

export const CloudViewMultiResourceSelect = (
  props: CloudViewResourceSelectProps
) => {
  const resourceOptions: any = {};
  const [selectedResource, setResource] = React.useState<any>([]);
  // const defaultCalls = React.useRef(false);
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
    const defaultValue = fetchUserPrefObject()?.resources;
    const selectedResourceObj = getResourceList().filter(
      (obj) => defaultValue && defaultValue?.includes(obj.id)
    );
    // defaultCalls.current = true;
    // setResource(selectedResourceObj);
    props.handleResourceChange(selectedResourceObj);
    return selectedResourceObj
  };

  // React.useEffect(() => {
  //   setResource([]);
  // }, [props.region, props.resourceType]);

  // React.useEffect(() => {
  //   if (!defaultCalls.current && resourceOptions[props.resourceType!]) {
  //     getSelectedResources();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [resourceOptions]);

  // if (!props.region || !props.resourceType || !resourceOptions[props.resourceType]) {
  //   return (
  //     <Select
  //       disabled={true}
  //       isClearable={true}
  //       // eslint-disable-next-line @typescript-eslint/no-empty-function
  //       onChange={() => { }}
  //       placeholder="Select Resources"
  //     />
  //   );
  // }
  return (
    <Autocomplete
      onChange={(_: any, resource: any, reason) => {
        updateGlobalFilterPreference({
          [RESOURCES]: resource.map((obj) => obj.id) ?? [],
        });
        setResource(resource);
        props.handleResourceChange(resource);
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
      value={getSelectedResources()}
    />
  );
};
