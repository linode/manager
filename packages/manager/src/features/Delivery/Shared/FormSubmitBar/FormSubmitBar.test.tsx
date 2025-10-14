import { destinationType, streamType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect } from 'vitest';

import { FormSubmitBar } from 'src/features/Delivery/Shared/FormSubmitBar/FormSubmitBar';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import type { FormMode, FormType } from 'src/features/Delivery/Shared/types';

describe('StreamFormSubmitBar', () => {
  const mockFn = () => {};

  const renderComponent = (
    formType: FormType,
    mode: FormMode,
    blockSubmit = false,
    connectionTested = false
  ) => {
    renderWithThemeAndHookFormContext({
      component: (
        <FormSubmitBar
          blockSubmit={blockSubmit}
          connectionTested={connectionTested}
          destinationType={destinationType.AkamaiObjectStorage}
          formType={formType}
          isSubmitting={false}
          isTesting={false}
          mode={mode}
          onSubmit={mockFn}
          onTestConnection={mockFn}
        />
      ),
      useFormOptions: {
        defaultValues: {
          stream: {
            type: streamType.AuditLogs,
            details: {},
          },
          destination: {
            type: destinationType.AkamaiObjectStorage,
            details: {
              region: '',
            },
          },
        },
      },
    });
  };

  describe('when in stream form', () => {
    describe('and in create mode', () => {
      const createStreamButtonText = 'Create Stream';
      describe('and blockSubmit is true and connection is not tested', () => {
        it('should disabled Create Stream button', async () => {
          renderComponent('stream', 'create', true);
          const submitButton = screen.getByText(createStreamButtonText);

          expect(submitButton).toBeDisabled();
        });
      });

      describe('and blockSubmit is true and connection is tested', () => {
        it('should enabled Create Stream button', async () => {
          renderComponent('stream', 'create', true, true);
          const submitButton = screen.getByText(createStreamButtonText);

          expect(submitButton).toBeEnabled();
        });
      });

      describe('and blockSubmit is false', () => {
        it('should render enabled Create Stream button', async () => {
          renderComponent('stream', 'create');
          const submitButton = screen.getByText(createStreamButtonText);

          expect(submitButton).toBeEnabled();
        });
      });
    });

    describe('and in edit mode', () => {
      it('should render enabled Edit Stream button', async () => {
        renderComponent('stream', 'edit');
        const submitButton = screen.getByText('Edit Stream');

        expect(submitButton).toBeEnabled();
      });
    });

    it('should render Delivery summary with destination type', () => {
      renderComponent('stream', 'create');
      const deliveryTitle = screen.getByText('Delivery');
      const deliveryType = screen.getByText('Akamai Object Storage');

      expect(deliveryTitle).toBeInTheDocument();
      expect(deliveryType).toBeInTheDocument();
    });
  });

  describe('when in destination form', () => {
    describe('and in create mode', () => {
      it('should render enabled Create Destination button', async () => {
        renderComponent('destination', 'create');
        const submitButton = screen.getByText('Create Destination');

        expect(submitButton).toBeEnabled();
      });
    });

    describe('and in edit mode', () => {
      it('should render enabled Edit Destination button', async () => {
        renderComponent('destination', 'edit');
        const submitButton = screen.getByText('Edit Destination');

        expect(submitButton).toBeEnabled();
      });
    });
  });
});
