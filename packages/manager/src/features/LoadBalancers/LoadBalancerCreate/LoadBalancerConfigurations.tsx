import { FieldArray, useFormikContext } from 'formik';
import * as React from 'react';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import { CreateLoadBalancerFormValues } from './LoadBalancerCreate';

export const LoadBalancerConfigurations = () => {
  const { values } = useFormikContext<CreateLoadBalancerFormValues>();
  return (
    <FieldArray name="configurations">
      {({ insert, push, remove }) => (
        <div>
          {values.configurations.map((configuration, index) => (
            <div key={index}>
              {/* Render the LoadBalancerConfiguration component for each configuration */}
              <LoadBalancerConfiguration index={index} />
            </div>
          ))}
        </div>
      )}
    </FieldArray>
  );
};
