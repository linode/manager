import { useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

interface CloudPulseServiceSelectProps {
  /**
   * name used for the component to set formik field
   */
  name: string;
}

type CloudPulseServiceTypeOptions = {
  label: string;
  value: string;
};

export const CloudPulseServiceSelect = (
  props: CloudPulseServiceSelectProps
) => {
  const { name } = props;
  const {
    data: serviceOptions,
    error: serviceTypesError,
    isLoading: serviceTypesLoading,
  } = useCloudPulseServiceTypes(true);
  const formik = useFormikContext();

  const [
    selectedService,
    setSelectedService,
  ] = React.useState<CloudPulseServiceTypeOptions | null>(null);

  React.useEffect(() => {
    formik.setFieldValue(name, selectedService?.value ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  const getServicesList = (): CloudPulseServiceTypeOptions[] => {
    return serviceOptions
      ? serviceOptions.data.map((service) => ({
          label: service.service_type.toUpperCase(),
          value: service.service_type,
        }))
      : [];
  };

  return (
    <Autocomplete
      isOptionEqualToValue={(option, value) => {
        return option.value === value.value;
      }}
      onBlur={(event) => {
        formik.handleBlur(event);
        formik.setFieldTouched(name, true);
      }}
      onChange={(_: React.SyntheticEvent<Element, Event>, newValue) => {
        setSelectedService(newValue);
      }}
      data-testid="servicetype-select"
      errorText={serviceTypesError ? 'Unable to load service types' : ''}
      fullWidth
      label="Service"
      loading={serviceTypesLoading && !serviceTypesError}
      noMarginTop
      options={getServicesList()}
      placeholder="Select a service"
      sx={{ marginTop: '5px' }}
      value={selectedService}
    />
  );
};
