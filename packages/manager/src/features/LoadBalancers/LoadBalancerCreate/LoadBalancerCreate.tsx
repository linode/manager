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

import type { Protocol } from '@linode/api-v4';

// TODO: AGLB - CreateLoadBalancerFormValues could be replaced with CreateLoadBalancerPayload once the form is completely build.
export interface CreateLoadBalancerFormValues {
  configurations: { label: string; port: number; protocol: Protocol }[];
  label: string;
}

const initialValues: CreateLoadBalancerFormValues = {
  configurations: [{ label: '', port: 80, protocol: 'https' }],
  label: '',
};

export const LoadBalancerCreate = () => {
  const handleSubmit = (values: CreateLoadBalancerFormValues) => {
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
