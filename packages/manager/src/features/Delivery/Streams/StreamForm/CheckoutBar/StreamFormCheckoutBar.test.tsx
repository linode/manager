import { destinationType, streamType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect } from 'vitest';

import { StreamFormCheckoutBar } from 'src/features/Delivery/Streams/StreamForm/CheckoutBar/StreamFormCheckoutBar';
import { StreamFormGeneralInfo } from 'src/features/Delivery/Streams/StreamForm/StreamFormGeneralInfo';
import {
  renderWithTheme,
  renderWithThemeAndHookFormContext,
} from 'src/utilities/testHelpers';

// Skipped until StreamFormCheckoutBar will be used again
describe.skip('StreamFormCheckoutBar', () => {
  const getDeliveryPriceContext = () => screen.getByText(/\/unit/i).textContent;
  const createStream = () => {};

  const renderComponent = () => {
    renderWithThemeAndHookFormContext({
      component: <StreamFormCheckoutBar createStream={createStream} />,
      useFormOptions: {
        defaultValues: {
          destination: {
            type: destinationType.LinodeObjectStorage,
          },
        },
      },
    });
  };

  it('should render checkout bar with enabled checkout button', async () => {
    renderComponent();
    const submitButton = screen.getByText('Create Stream');

    expect(submitButton).toBeEnabled();
  });

  it('should render Delivery summary with destination type and price', () => {
    renderComponent();
    const deliveryTitle = screen.getByText('Delivery');
    const deliveryType = screen.getByText('Linode Object Storage');

    expect(deliveryTitle).toBeInTheDocument();
    expect(deliveryType).toBeInTheDocument();
  });

  const TestFormComponent = () => {
    const methods = useForm({
      defaultValues: {
        stream: {
          label: '',
          type: streamType.AuditLogs,
        },
        destination: {
          type: destinationType.LinodeObjectStorage,
        },
      },
    });

    return (
      <FormProvider {...methods}>
        <form>
          <StreamFormGeneralInfo mode="create" />
          <StreamFormCheckoutBar createStream={createStream} />
        </form>
      </FormProvider>
    );
  };

  it('should not update Delivery summary price on label change', async () => {
    renderWithTheme(<TestFormComponent />);
    const initialPrice = getDeliveryPriceContext();

    // change form label value
    const nameInput = screen.getByPlaceholderText('Stream name...');
    await userEvent.type(nameInput, 'Test');

    expect(getDeliveryPriceContext()).toEqual(initialPrice);
  });

  it('should update Delivery summary price on form value change', async () => {
    renderWithTheme(<TestFormComponent />);
    const initialPrice = getDeliveryPriceContext();
    const streamTypesAutocomplete = screen.getByRole('combobox');

    // change form type value
    await userEvent.click(streamTypesAutocomplete);
    const kubernetesAuditLogs = await screen.findByText(
      'Kubernetes Audit Logs'
    );
    await userEvent.click(kubernetesAuditLogs);

    expect(getDeliveryPriceContext()).not.toEqual(initialPrice);
  });
});
