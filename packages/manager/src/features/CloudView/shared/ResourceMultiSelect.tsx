/* eslint-disable no-console */
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import {
  useLinodeResourcesQuery,
  useLoadBalancerResourcesQuery,
} from 'src/queries/cloudview/resources';

interface CloudViewResourceSelectProps {
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

  const getResourceList = () => {
    if (props.region) {
      return props.resourceType && resourceOptions[props.resourceType]
        ? filterResourcesByRegion(resourceOptions[props.resourceType]?.data)
        : [];
    }
    return props.resourceType && resourceOptions[props.resourceType]
      ? resourceOptions[props.resourceType]?.data
      : [];
  };

  ({ data: resourceOptions['linodes'] } = useLinodeResourcesQuery(
    props.resourceType === 'linodes'
  ));
  ({ data: resourceOptions['ACLB'] } = useLoadBalancerResourcesQuery(
    props.resourceType === 'ACLB'
  ));

  React.useEffect(() => {
    props.handleResourceChange(selectedResource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  React.useEffect(() => {
    setResource([]);
    setResourceInputValue('');
    props.handleResourceChange([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.region, props.resourceType]);

  return (
    <Autocomplete
      onChange={(_: any, resource: any) => {
        setResource(resource);
      }}
      onInputChange={(event, newInputValue) => {
        setResourceInputValue(newInputValue);
      }}
      autoHighlight
      clearOnBlur
      disabled={props.disabled}
      inputValue={resourceInputValue}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      label=""
      limitTags={2}
      multiple
      options={getResourceList()}
      placeholder="Select a resource"
      value={selectedResource}
    />
  );
};
