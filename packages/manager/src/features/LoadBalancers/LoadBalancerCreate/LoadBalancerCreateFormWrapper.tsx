import { CreateLoadBalancerSchema } from '@linode/validation';
import { Formik } from 'formik';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { useFlags } from 'src/hooks/useFlags';

import type {
  CreateLoadbalancerPayload,
  ServiceTargetPayload,
} from '@linode/api-v4';

const LoadBalancerCreate = React.lazy(() =>
  import('./LoadBalancerCreate').then((module) => ({
    default: module.LoadBalancerCreate,
  }))
);

const LoadBalancerBasicCreate = React.lazy(() =>
  import('./LoadBalancerBasicCreate').then((module) => ({
    default: module.LoadBalancerBasicCreate,
  }))
);

const LoadBalancerSummary = React.lazy(() =>
  import('./LoadBalancerSummary/LoadBalancerSummary').then((module) => ({
    default: module.LoadBalancerSummary,
  }))
);

export interface LoadBalancerCreateFormData extends CreateLoadbalancerPayload {
  /**
   * A shared array of service targets. This should be removed before we
   * make our POST to the API.
   */
  service_targets: ServiceTargetPayload[];
}

export const initialValues: LoadBalancerCreateFormData = {
  configurations: [
    { certificates: [], label: '', port: 443, protocol: 'https' },
  ],
  label: '',
  regions: [],
  service_targets: [],
};

export const LoadBalancerCreateFormWrapper = () => {
  const flags = useFlags();

  const handleSubmit = (values: LoadBalancerCreateFormData) => {
    // Handle form submission
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={CreateLoadBalancerSchema}
    >
      {() => (
        <Switch>
          <Route
            render={() =>
              flags.aglbFullCreateFlow ? (
                <LoadBalancerCreate />
              ) : (
                <LoadBalancerBasicCreate />
              )
            }
            exact
            path="/loadbalancers/create"
          />
          {flags.aglbFullCreateFlow && (
            <Route
              path="/loadbalancers/create/summary"
              render={() => <LoadBalancerSummary />}
            />
          )}
        </Switch>
      )}
    </Formik>
  );
};
