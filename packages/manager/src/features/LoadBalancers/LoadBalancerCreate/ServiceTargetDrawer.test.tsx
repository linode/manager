import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { LoadBalancerCreateFormData } from './LoadBalancerCreateFormWrapper';
import { ServiceTargetDrawer } from './ServiceTargetDrawer';

const initialValues: LoadBalancerCreateFormData = {
  configurations: [
    {
      certificates: [],
      label: '',
      port: 8080,
      protocol: 'http' as const,
      service_targets: [
        {
          certificate_id: null,
          endpoints: [],
          healthcheck: {
            healthy_threshold: 0,
            interval: 0,
            protocol: 'tcp',
            timeout: 0,
            unhealthy_threshold: 0,
          },
          label: 'test',
          load_balancing_policy: 'least_request',
          percentage: 100,
          protocol: 'http',
        },
      ],
    },
  ],
  label: '',
  regions: [],
};

const formikContext = {
  initialValues,
  onSubmit: vi.fn(),
};

describe('ServiceTargetDrawer', () => {
  it('renders the drawer in create mode if service target index is undefined', () => {
    const { getByText } = renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ServiceTargetDrawer
        configurationIndex={0}
        onClose={vi.fn()}
        open={true}
        serviceTargetIndex={undefined}
      />,
      formikContext
    );

    expect(getByText('Add a Service Target')).toBeVisible();
  });
  it('renders the drawer in edit mode if service target index is defined', () => {
    const { getByText } = renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ServiceTargetDrawer
        configurationIndex={0}
        onClose={vi.fn()}
        open={true}
        serviceTargetIndex={0}
      />,
      formikContext
    );

    expect(getByText('Edit Service Target')).toBeVisible();
  });
  it('contains data from context when we are editing', () => {
    const {
      getByLabelText,
    } = renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ServiceTargetDrawer
        configurationIndex={0}
        onClose={vi.fn()}
        open={true}
        serviceTargetIndex={0}
      />,
      formikContext
    );

    const labelTextField = getByLabelText('Service Target Label');

    expect(labelTextField).toHaveDisplayValue(
      formikContext.initialValues.configurations[0].service_targets[0].label
    );
  });
});
