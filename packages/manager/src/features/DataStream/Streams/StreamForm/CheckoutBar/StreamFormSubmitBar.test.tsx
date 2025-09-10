import { destinationType, streamType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect } from 'vitest';

import { StreamFormSubmitBar } from 'src/features/DataStream/Streams/StreamForm/CheckoutBar/StreamFormSubmitBar';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import type { FormMode } from 'src/features/DataStream/Shared/types';

describe('StreamFormSubmitBar', () => {
  const createStream = () => {};

  const renderComponent = (mode: FormMode) => {
    renderWithThemeAndHookFormContext({
      component: <StreamFormSubmitBar mode={mode} onSubmit={createStream} />,
      useFormOptions: {
        defaultValues: {
          stream: {
            type: streamType.AuditLogs,
            details: {},
          },
          destination: {
            type: destinationType.LinodeObjectStorage,
            details: {
              region: '',
            },
          },
        },
      },
    });
  };

  describe('when in create mode', () => {
    it('should render checkout bar with enabled Create Stream button', async () => {
      renderComponent('create');
      const submitButton = screen.getByText('Create Stream');

      expect(submitButton).toBeEnabled();
    });
  });

  describe('when in edit mode', () => {
    it('should render checkout bar with enabled Edit Stream button', async () => {
      renderComponent('edit');
      const submitButton = screen.getByText('Edit Stream');

      expect(submitButton).toBeEnabled();
    });
  });

  it('should render Delivery summary with destination type', () => {
    renderComponent('create');
    const deliveryTitle = screen.getByText('Delivery');
    const deliveryType = screen.getByText('Linode Object Storage');

    expect(deliveryTitle).toBeInTheDocument();
    expect(deliveryType).toBeInTheDocument();
  });
});
