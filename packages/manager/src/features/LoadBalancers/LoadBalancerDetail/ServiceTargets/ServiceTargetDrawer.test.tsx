import React from 'react';

import { serviceTargetFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ServiceTargetDrawer } from './ServiceTargetDrawer';

const props = {
  loadbalancerId: 1,
  onClose: vi.fn(),
  open: true,
};

describe('ServiceTargetDrawer', () => {
  it('should be in create mode when no serviceTarget is passed', () => {
    const { getByText } = renderWithTheme(<ServiceTargetDrawer {...props} />);

    expect(getByText('Add a Service Target')).toBeVisible();
  });
  it('should be in edit mode when a serviceTarget is passed', () => {
    const serviceTarget = serviceTargetFactory.build();

    const { getByText } = renderWithTheme(
      <ServiceTargetDrawer {...props} serviceTarget={serviceTarget} />
    );

    expect(getByText(`Edit ${serviceTarget.label}`)).toBeVisible();
  });
  it('should populate TextFields with data if we are editing', () => {
    const serviceTarget = serviceTargetFactory.build();

    const { getByLabelText } = renderWithTheme(
      <ServiceTargetDrawer {...props} serviceTarget={serviceTarget} />
    );

    const labelTextField = getByLabelText('Service Target Label');
    expect(labelTextField).toHaveDisplayValue(serviceTarget.label);
  });
});
