import userEvent from '@testing-library/user-event';
import React from 'react';

import { serviceTargetFactory } from 'src/factories';
import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { LoadBalancerCreateFormData } from './LoadBalancerCreate';
import { ServiceTargets } from './ServiceTargets';
import { handlers } from './LoadBalancerConfiguration.test';

const formikContext = {
  initialValues: {
    configurations: [
      {
        certificates: [],
        label: 'test',
        port: 1,
        protocol: 'http' as const,
        service_targets: serviceTargetFactory.buildList(1),
      },
    ],
    label: '',
    regions: [],
  },
  onSubmit: vi.fn(),
};

describe('ServiceTargets', () => {
  it('renders service targets stored in the form context', () => {
    const { getByText } = renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ServiceTargets configurationIndex={0} handlers={handlers} />,
      formikContext
    );

    for (const serviceTarget of formikContext.initialValues.configurations[0]
      .service_targets) {
      getByText(serviceTarget.label);
    }
  });
  it('can open the Add Service Target Drawer', async () => {
    const { getByText } = renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ServiceTargets configurationIndex={0} handlers={handlers} />,
      formikContext
    );

    const addServiceTargetButton = getByText('Add Service Target').closest(
      'button'
    );

    userEvent.click(addServiceTargetButton!);

    expect(handlers.handleAddServiceTarget).toHaveBeenCalled();
  });
});
