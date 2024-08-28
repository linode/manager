import { useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
interface CloudPulseResourceSelectProps {
  /**
   * cluster type selected by the user
   */
  cluster: boolean;
  /**
   * database engine type selected by the user
   */
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
export interface CloudPulseResources {
  engine?: string;
  id: string;
  label: string;
  region?: string;
}

export const CloudPulseMultiResourceSelect = (
  props: CloudPulseResourceSelectProps
) => {
  const { cluster, name, region, serviceType } = { ...props };
  const formik = useFormikContext();

  const engine = formik.getFieldProps('engineOption').value;
  const [selectedResources, setSelectedResources] = React.useState<
    CloudPulseResources[]
  >([]);
  const { data: resources, isLoading } = useResourcesQuery(
    Boolean(region && serviceType),
    serviceType,
    {},
    cluster ? { engine, region } : { region }
  );
  const getResourcesList = (): CloudPulseResources[] => {
    return resources && resources.length > 0 ? resources : [];
  };

  React.useEffect(() => {
    formik.setFieldValue(
      `${name}`,
      selectedResources.map((resource: CloudPulseResources) => {
        return resource.id.toString();
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResources]);

  React.useEffect(() => {
    setSelectedResources([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, serviceType]);

  return (
    <Autocomplete
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      onBlur={(event) => {
        formik.handleBlur(event);
        formik.setFieldTouched(name, true);
      }}
      onChange={(_: React.SyntheticEvent<Element, Event>, resources) => {
        setSelectedResources(resources);
      }}
      autoHighlight
      clearOnBlur
      data-testid="resource-select"
      disabled={!Boolean(region && serviceType)}
      label={cluster ? 'Cluster' : 'Resources'}
      limitTags={2}
      loading={isLoading && Boolean(region && serviceType)}
      multiple
      options={getResourcesList()}
      placeholder="Select Resources"
      value={selectedResources}
    />
  );
};
