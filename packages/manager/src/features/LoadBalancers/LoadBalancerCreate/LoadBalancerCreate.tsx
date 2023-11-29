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

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

const initialValues: CreateLoadbalancerPayload = {
  configurations: [
    {
      certificates: [{ hostname: '', id: 0 }],
      label: '',
      port: 80,
      protocol: 'tcp',
      // TODO: AGLB - Below initial values may change as we develop following create flow tickets
      routes: [
        {
          label: '',
          protocol: 'tcp',
          rules: [
            {
              match_condition: {
                hostname: '',
                match_field: 'path_prefix',
                match_value: '',
                session_stickiness_cookie: '',
                session_stickiness_ttl: 0,
              },
              service_targets: [
                {
                  ca_certificate: '', // TODO: AGLB - Need to confirm with API team on this field.
                  endpoints: [
                    {
                      host: '',
                      ip: '',
                      port: 80, // Default port, update as necessary
                      rate_capacity: 1, // Assuming a default capacity, update as necessary
                    },
                  ],
                  healthcheck: {
                    healthy_threshold: 0,
                    host: '',
                    interval: 0,
                    path: '',
                    protocol: 'tcp',
                    timeout: 0,
                    unhealthy_threshold: 0,
                  },
                  label: '',
                  load_balancing_policy: 'round_robin',
                  percentage: 0,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  label: '',
  regions: [],
};

const LoadBalancerCreate = () => {
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
