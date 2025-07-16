import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect } from 'vitest';

import { destinationType } from 'src/features/DataStream/Shared/types';
import { StreamCreateCheckoutBar } from 'src/features/DataStream/Streams/StreamCreate/CheckoutBar/StreamCreateCheckoutBar';
import { StreamCreateGeneralInfo } from 'src/features/DataStream/Streams/StreamCreate/StreamCreateGeneralInfo';
import { streamType } from 'src/features/DataStream/Streams/StreamCreate/types';
import {
  renderWithTheme,
  renderWithThemeAndHookFormContext,
} from 'src/utilities/testHelpers';

describe('StreamCreateCheckoutBar', () => {
  const getDeliveryPriceContext = () => screen.getByText(/\/unit/i).textContent;

  const renderComponent = () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreateCheckoutBar />,
      useFormOptions: {
        defaultValues: {
          destination_type: destinationType.LinodeObjectStorage,
        },
      },
    });
  };

  it('should render checkout bar with disabled checkout button', async () => {
    renderComponent();
    const submitButton = screen.getByText('Create Stream');

    expect(submitButton).toBeDisabled();
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
        type: streamType.AuditLogs,
        destination_type: destinationType.LinodeObjectStorage,
        label: '',
      },
    });

    return (
      <FormProvider {...methods}>
        <form>
          <StreamCreateGeneralInfo />
          <StreamCreateCheckoutBar />
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
