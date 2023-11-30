import { CreateLoadBalancerSchema } from '@linode/validation';
import Stack from '@mui/material/Stack';
import { Form, Formik } from 'formik';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { AGLB_FEEDBACK_FORM_URL } from 'src/features/LoadBalancers/constants';

import { LoadBalancerActionPanel } from './LoadBalancerActionPanel';
import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import { LoadBalancerLabel } from './LoadBalancerLabel';
import { LoadBalancerRegions } from './LoadBalancerRegions';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

const initialValues = {
  label: '',
  regions: [],
};

export const LoadBalancerCreate = () => {
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
      <Formik<CreateLoadbalancerPayload>
        onSubmit={(values, actions) => {
          // TODO: AGLB - Implement form submit
          // console.log('Values ', values);
        }}
        initialValues={initialValues}
        validationSchema={CreateLoadBalancerSchema}
      >
        <Form>
          <Stack spacing={3}>
            <LoadBalancerLabel />
            <LoadBalancerRegions />
            <LoadBalancerConfiguration />
            <LoadBalancerActionPanel />
          </Stack>
        </Form>
      </Formik>
    </>
  );
};
