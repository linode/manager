import { useFormikContext } from 'formik';
import React from 'react';

import { ConfigurationAccordion } from './EditConfigurationDetails/ConfigurationAccordion';

import type { LoadBalancerCreateFormData } from '../../LoadBalancerCreateFormWrapper';

export const EditLoadBalancerConfigurations = () => {
  const { values } = useFormikContext<LoadBalancerCreateFormData>();

  return (
    <div>
      {values.configurations?.map((configuration, index) => (
        <ConfigurationAccordion
          configuration={configuration}
          index={index}
          key={index}
        />
      ))}
    </div>
  );
};
