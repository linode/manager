import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateServiceTargetDrawer } from './CreateServiceTargetDrawer';

const props = {
  loadbalancerId: 0,
  onClose: jest.fn(),
  open: true,
};

describe('CreateServiceTargetDrawer', () => {
  it('should show error returned by api-v4', async () => {
    const { findByText, getByText } = renderWithTheme(
      <CreateServiceTargetDrawer {...props} />
    );

    const submitButton = getByText('Create Service Target').closest('button')!;

    userEvent.click(submitButton);

    await findByText('Label is required.');
    await findByText('IP is required.');
  });
  it('should be submittable when correctly configured', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <CreateServiceTargetDrawer {...props} />
    );

    const labelInput = getByLabelText('Service Target Label');
    const ipInput = getByLabelText('Linode or Public IP Address');
    const submitButton = getByText('Create Service Target').closest('button')!;

    userEvent.type(labelInput, 'my-service-target');
    userEvent.type(ipInput, '192.168.1.1');
    userEvent.click(submitButton);

    await waitFor(() => expect(props.onClose).toBeCalled());
  });
});
