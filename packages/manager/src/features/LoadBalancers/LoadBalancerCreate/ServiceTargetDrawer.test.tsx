import React from 'react';

import { serviceTargetFactory } from 'src/factories';
import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { LoadBalancerCreateFormData } from './LoadBalancerCreateFormWrapper';
import { ServiceTargetDrawer } from './ServiceTargetDrawer';

const formikContext = {
  initialValues: {
    label: '',
    regions: [],
    service_targets: serviceTargetFactory.buildList(1),
  },
  onSubmit: vi.fn(),
};

describe('ServiceTargetDrawer', () => {
  it('renders the drawer in create mode if service target index is undefined', () => {
    const { getByText } = renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ServiceTargetDrawer
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
        onClose={vi.fn()}
        open={true}
        serviceTargetIndex={0}
      />,
      formikContext
    );

    const labelTextField = getByLabelText('Service Target Label');

    expect(labelTextField).toHaveDisplayValue(
      formikContext.initialValues.service_targets[0].label
    );
  });
});
