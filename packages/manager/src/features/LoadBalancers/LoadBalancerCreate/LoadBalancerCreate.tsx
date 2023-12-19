import { CreateLoadBalancerSchema } from '@linode/validation';
import Stack from '@mui/material/Stack';
import { Formik, Form as FormikForm } from 'formik';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { AGLB_FEEDBACK_FORM_URL } from 'src/features/LoadBalancers/constants';

import { LoadBalancerActionPanel } from './LoadBalancerActionPanel';
import { LoadBalancerConfigurations } from './LoadBalancerConfigurations';
import { LoadBalancerLabel } from './LoadBalancerLabel';
import { LoadBalancerRegions } from './LoadBalancerRegions';

import type {
  ConfigurationPayload,
  CreateLoadbalancerPayload,
  ServiceTargetPayload,
} from '@linode/api-v4';

export interface LoadBalancerCreateFormData
  extends Omit<CreateLoadbalancerPayload, 'configurations'> {
  configurations: (ConfigurationPayload & {
    service_targets: ServiceTargetPayload[];
  })[];
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

export const LoadBalancerCreate = () => {
  const handleSubmit = (values: LoadBalancerCreateFormData) => {
    // console.log('Submitted values:', values);
  };

  return (
    <>
      <DocumentTitleSegment segment="Create a Load Balancer" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Global Load Balancers',
              position: 1,
            },
          ],
          pathname: location.pathname,
        }}
        betaFeedbackLink={AGLB_FEEDBACK_FORM_URL}
        title="Create"
      />
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={CreateLoadBalancerSchema}
      >
        <FormikForm>
          <Stack spacing={3}>
            <LoadBalancerLabel />
            <LoadBalancerRegions />
            <LoadBalancerConfigurations />
            <LoadBalancerActionPanel />
          </Stack>
        </FormikForm>
      </Formik>
    </>
  );
};
