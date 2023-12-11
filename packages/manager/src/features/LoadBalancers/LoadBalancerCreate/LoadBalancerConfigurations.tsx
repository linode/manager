import { FieldArray, useFormikContext } from 'formik';
import * as React from 'react';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

export const LoadBalancerConfigurations = () => {
  const { values } = useFormikContext<CreateLoadbalancerPayload>();
  return (
    <FieldArray name="configurations">
      {({ insert, push, remove }) => (
        <div>
          {values.configurations?.map((configuration, index) => (
            <LoadBalancerConfiguration
              index={index}
              key={index}
              name="configurations"
            />
          ))}
        </div>
      )}
    </FieldArray>
  );
};
