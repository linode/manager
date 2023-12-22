import userEvent from '@testing-library/user-event';
import React from 'react';

import { serviceTargetFactory } from 'src/factories';
import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { LoadBalancerCreateFormData } from './LoadBalancerCreateFormWrapper';
import { ServiceTargets } from './ServiceTargets';

const formikContext = {
  initialValues: {
    label: '',
    regions: [],
    service_targets: serviceTargetFactory.buildList(5),
  },
  onSubmit: vi.fn(),
};

describe('ServiceTargets', () => {
  it('renders service targets stored in the form context', () => {
    const { getByText } = renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ServiceTargets />,
      formikContext
    );

    for (const serviceTarget of formikContext.initialValues.service_targets) {
      getByText(serviceTarget.label);
    }
  });
  it('can open and close the Add Service Target Drawer', () => {
    const { getByText } = renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ServiceTargets />,
      formikContext
    );

    const addServiceTargetButton = getByText('Add Service Target').closest(
      'button'
    );

    userEvent.click(addServiceTargetButton!);

    expect(getByText('Add a Service Target')).toBeVisible();

    const cancelButton = getByText('Cancel').closest('button');

    userEvent.click(cancelButton!);
  });
});
