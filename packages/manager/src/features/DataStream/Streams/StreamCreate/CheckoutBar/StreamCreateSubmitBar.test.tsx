import { destinationType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect } from 'vitest';

import { StreamCreateSubmitBar } from 'src/features/DataStream/Streams/StreamCreate/CheckoutBar/StreamCreateSubmitBar';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

describe('StreamCreateSubmitBar', () => {
  const createStream = () => {};

  const renderComponent = () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreateSubmitBar createStream={createStream} />,
      useFormOptions: {
        defaultValues: {
          destination: { type: destinationType.LinodeObjectStorage },
        },
      },
    });
  };

  it('should render checkout bar with enabled checkout button', async () => {
    renderComponent();
    const submitButton = screen.getByText('Create Stream');

    expect(submitButton).toBeEnabled();
  });

  it('should render Delivery summary with destination type', () => {
    renderComponent();
    const deliveryTitle = screen.getByText('Delivery');
    const deliveryType = screen.getByText('Linode Object Storage');

    expect(deliveryTitle).toBeInTheDocument();
    expect(deliveryType).toBeInTheDocument();
  });
});
