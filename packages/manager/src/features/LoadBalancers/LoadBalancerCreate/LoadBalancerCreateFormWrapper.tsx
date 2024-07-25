import { CreateLoadBalancerSchema } from '@linode/validation';
import { Formik } from 'formik';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import type {
  ConfigurationPayload,
  CreateLoadbalancerPayload,
  ServiceTargetPayload,
} from '@linode/api-v4';

const LoadBalancerCreate = React.lazy(() =>
  import('./LoadBalancerCreate').then((module) => ({
    default: module.LoadBalancerCreate,
  }))
);

const LoadBalancerSummary = React.lazy(() =>
  import('./LoadBalancerSummary/LoadBalancerSummary').then((module) => ({
    default: module.LoadBalancerSummary,
  }))
);

interface ConfigurationPayloadWithServiceTargets extends ConfigurationPayload {
  service_targets: ServiceTargetPayload[];
}

export interface LoadBalancerCreateFormData
  extends Omit<CreateLoadbalancerPayload, 'configurations'> {
  configurations: ConfigurationPayloadWithServiceTargets[];
}

export const initialValues: LoadBalancerCreateFormData = {
  configurations: [
    {
      certificates: [],
      label: '',
      port: 443,
      protocol: 'https',
      routes: [],
      service_targets: [],
    },
  ],
  label: '',
  regions: [],
};

export const LoadBalancerCreateFormWrapper = () => {
  const handleSubmit = (values: LoadBalancerCreateFormData) => {
    // Handle form submission
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={CreateLoadBalancerSchema}
    >
      <Switch>
        <Route
          component={LoadBalancerCreate}
          exact
          path="/loadbalancers/create"
        />
        <Route
          component={LoadBalancerSummary}
          path="/loadbalancers/create/summary"
        />
      </Switch>
    </Formik>
  );
};
