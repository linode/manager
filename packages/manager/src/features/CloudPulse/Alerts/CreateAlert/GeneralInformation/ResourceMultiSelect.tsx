import { useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useLinodeResourcesQuery } from 'src/queries/cloudpulse/resources';
interface CloudPulseResourceSelectProps {
  cluster: boolean;
  disabled: boolean;
  name: string;
  region: string | undefined;
  resourceType: string | undefined;
}

export const CloudPulseMultiResourceSelect = (
  props: CloudPulseResourceSelectProps
) => {
  const resourceOptions: any = {};

  const formik = useFormikContext();
  const [selectedResource, setResource] = React.useState<any>([]);
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

  React.useEffect(() => {
    formik.setFieldValue(
      `${props.name}`,
      selectedResource.map((resource: any) => {
        return resource.id.toString() + '';
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  React.useEffect(() => {
    setResource([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.region, props.resourceType]);

  return (
    <Autocomplete
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      onBlur={(event) => {
        formik.handleBlur(event);
        formik.setFieldTouched(`${props.name}`, true);
      }}
      onChange={(_: any, resources: any) => {
        setResource(resources);
      }}
      autoHighlight
      clearOnBlur
      disabled={props.disabled}
      label={props.cluster ? 'Cluster' : 'Resources'}
      limitTags={2}
      multiple
      options={getResourceList()}
      placeholder="Select"
      value={selectedResource ? selectedResource : null}
    />
  );
};
