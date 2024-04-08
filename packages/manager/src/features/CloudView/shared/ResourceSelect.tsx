/* eslint-disable no-console */
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import {
  useLinodeResourcesQuery,
  useLoadBalancerResourcesQuery,
} from 'src/queries/cloudview/resources';

export type CloudViewResourceTypes = 'ACLB' | 'linodes' | undefined;

interface CloudViewResourceSelectProps {
  handleResourceChange: (resourceId: any) => void;
  region: string | undefined;
  resourceType: CloudViewResourceTypes;
  disabled: boolean;
}

interface Resource {
  id: any;
  label: any;
}
export const CloudViewResourceSelect = (
  props: CloudViewResourceSelectProps
) => {
  const resourceOptions: any = {};

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

  const checkLabelMatch = (option: any, value: any) => {
    return option.label === selectedResource?.label;
  };

  const [selectedResource, setResource] = React.useState<
    Resource | undefined
  >();

  ({ data: resourceOptions['linodes'] } = useLinodeResourcesQuery(
    props.resourceType === 'linodes'
  ));
  ({ data: resourceOptions['ACLB'] } = useLoadBalancerResourcesQuery(
    props.resourceType === 'ACLB'
  ));

  React.useEffect(() => {
    props.handleResourceChange(selectedResource?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  React.useEffect(() => {
    setResource(undefined);
    props.handleResourceChange(selectedResource?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.region, props.resourceType]);

  return (
    <Autocomplete
      filterOptions={(options, state) => {
        const { inputValue } = state;
        const isExisting = options.some((option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        if ((inputValue !== '' && !isExisting) || options.length === 0) {
          return [
            {
              label: 'No Options',
            },
          ];
        }
        return options.filter((option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
      }}
      onChange={(_: any, resource: any) => {
        setResource({ id: resource?.id, label: resource?.label });
      }}
      autoHighlight
      autoSelect
      clearOnBlur
      disableClearable
      forcePopupIcon
      freeSolo
      fullWidth
      getOptionDisabled={(option) => option.label === 'No Options'}
      isOptionEqualToValue={(option, value) => checkLabelMatch(option, value)}
      label=""
      noMarginTop
      options={getResourceList()}
      value={selectedResource ? selectedResource.label : ''}
      disabled={props.disabled}
      placeholder='Select Resources'
    />
  );
};
