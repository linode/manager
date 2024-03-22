import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useCloudViewServices } from 'src/queries/cloudview/services';

import { CloudViewResourceTypes } from './ResourceSelect';

interface CloudViewServiceSelectProps {
  handleServiceChange: (service: string | undefined) => void;
}

export const CloudViewServiceSelect = React.memo(
  (props: CloudViewServiceSelectProps) => {
    const { data: serviceOptions } = useCloudViewServices();

    const [
      selectedService,
      setService,
    ] = React.useState<CloudViewResourceTypes>();

    const getServicesList = () => {
      return serviceOptions ? addEntry(serviceOptions.service_types) : [];
    };

    const addEntry = (services: any[]) => {
      services.forEach(
        (service: any) => (service.label = service.service_type)
      );
      return services;
    };

    React.useEffect(() => {
      props.handleServiceChange(selectedService);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedService]);

    return (
      <Autocomplete
        onChange={(_: any, service: any) => {
          setService(service?.label);
        }}
        disableClearable
        fullWidth
        isOptionEqualToValue={(option, value) => option.label === value.label}
        label=""
        noMarginTop
        options={getServicesList()}
      />
    );
  }
);
