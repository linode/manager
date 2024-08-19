import { useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import {
  useLinodeResourcesQuery,
  useResourcesQuery,
} from 'src/queries/cloudpulse/resources';
interface CloudPulseResourceSelectProps {
  /**
   * cluster type selected by the user
   */
  cluster: boolean;
  /**
   * name used for the component to set formik field
   */
  name: string;
  /**
   * region selected by the user
   */
  region: string | undefined;
  /**
   * service type selected by the user
   */
  serviceType: string | undefined;
}

export const CloudPulseMultiResourceSelect = (
  props: CloudPulseResourceSelectProps
) => {
  const resourceOptions: any = {};
  const { cluster, name, region, serviceType } = { ...props };
  const formik = useFormikContext();
  const [selectedResource, setResource] = React.useState<any>([]);
  const filterResourcesByRegion = (resourcesList: any[]) => {
    return resourcesList?.filter((resource: any) => {
      if (region == undefined) {
        return true;
      }
      if (resource.region) {
        return resource.region === region;
      } else if (resource.regions) {
        return resource.regions.includes(region);
      } else {
        return false;
      }
    });
  };
  const getResourceList = () => {
    return serviceType && resourceOptions[serviceType]
      ? filterResourcesByRegion(resourceOptions[serviceType]?.data)
      : [];
  };

  ({ data: resourceOptions['linode'] } = useLinodeResourcesQuery(
    serviceType === 'linode'
  ));
  React.useEffect(() => {
    formik.setFieldValue(
      `${name}`,
      selectedResource.map((resource: any) => {
        return resource.id.toString() + '';
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  React.useEffect(() => {
    setResource([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, serviceType]);

  return (
    <Autocomplete
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      onBlur={(event) => {
        formik.handleBlur(event);
        formik.setFieldTouched(`${name}`, true);
      }}
      onChange={(_: any, resources: any) => {
        setResource(resources);
      }}
      autoHighlight
      clearOnBlur
      label={cluster ? 'Cluster' : 'Resources'}
      limitTags={2}
      multiple
      options={getResourceList()}
      placeholder="Select"
      value={selectedResource ? selectedResource : null}
    />
  );
};
