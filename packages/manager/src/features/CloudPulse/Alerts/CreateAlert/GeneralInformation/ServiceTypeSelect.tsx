import { useFormikContext } from 'formik';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useCloudPulseServices } from 'src/queries/cloudpulse/services';

interface CloudPulseServiceSelectProps {
  /**
   * name used for the component to set formik field
   */
  name: string;
}

export const CloudPulseServiceSelect = (
  props: CloudPulseServiceSelectProps
) => {
  const { name } = props;
  const { data: serviceOptions } = useCloudPulseServices();
  const formik = useFormikContext();

  const [selectedService, setSelectedService] = React.useState<any>({
    label: '',
    value: '',
  });

  React.useEffect(() => {
    formik.setFieldValue(
      name,
      selectedService.value ? selectedService.value : ''
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  const getServicesList = () => {
    return serviceOptions ? serviceOptions.data : [];
  };
  return (
    <Autocomplete
      isOptionEqualToValue={(option, value) => {
        return option === value;
      }}
      onBlur={(event) => {
        formik.handleBlur(event);
        formik.setFieldTouched(name, true);
      }}
      onChange={(_: any, newValue) => {
        setSelectedService(newValue);
      }}
      data-testid="servicetype-select"
      disableClearable
      fullWidth
      label="Service"
      noMarginTop
      options={getServicesList()}
      placeholder="Select a service"
      sx={{ marginTop: '5px' }}
      value={selectedService.label ? selectedService : null}
    />
  );
};
