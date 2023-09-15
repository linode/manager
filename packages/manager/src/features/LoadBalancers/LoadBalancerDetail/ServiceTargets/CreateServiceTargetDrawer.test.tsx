import { act, waitFor } from '@testing-library/react';
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

    act(() => {
      userEvent.click(submitButton);
    });

    await findByText('Label is required.');
  });
  it('should be submittable when correctly configured', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <CreateServiceTargetDrawer {...props} />
    );

    const labelInput = getByLabelText('Service Target Label');
    const submitButton = getByText('Create Service Target').closest('button')!;

    act(() => {
      userEvent.type(labelInput, 'my-service-target');
      userEvent.click(submitButton);
    });

    await waitFor(() => expect(props.onClose).toBeCalled());
  });
  it('should be submittable when an endpoint is added', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <CreateServiceTargetDrawer {...props} />
    );

    const labelInput = getByLabelText('Service Target Label');
    const ipInput = getByLabelText('Linode or Public IP Address');
    const submitButton = getByText('Create Service Target').closest('button')!;
    const addEndpointButton = getByText('Add Endpoint').closest('button')!;

    act(() => {
      userEvent.type(labelInput, 'my-service-target');
      userEvent.type(ipInput, '192.168.1.1');
      userEvent.click(addEndpointButton);
      userEvent.click(submitButton);
    });

    await waitFor(() => expect(props.onClose).toBeCalled());
  });
});
