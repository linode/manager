import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { destinationFactory } from 'src/factories/datastream';
import { DestinationEdit } from 'src/features/DataStream/Destinations/DestinationForm/DestinationEdit';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';
const destinationId = 123;
const mockDestination = destinationFactory.build({
  id: destinationId,
  label: `Destination ${destinationId}`,
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ destinationId: 123 }),
  };
});

describe('DestinationEdit', () => {
  const assertInputHasValue = (inputLabel: string, inputValue: string) => {
    expect(screen.getByLabelText(inputLabel)).toHaveValue(inputValue);
  };

  it('should render edited destination when destination fetched properly', async () => {
    server.use(
      http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
        return HttpResponse.json(mockDestination);
      })
    );

    renderWithThemeAndHookFormContext({
      component: <DestinationEdit />,
    });

    const loadingElement = screen.queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    assertInputHasValue('Destination Type', 'Linode Object Storage');
    await waitFor(() => {
      assertInputHasValue('Destination Name', 'Destination 123');
    });
    assertInputHasValue('Host', '3000');
    assertInputHasValue('Bucket', 'Bucket Name');
    await waitFor(() => {
      assertInputHasValue('Region', 'US, Chicago, IL (us-ord)');
    });
    assertInputHasValue('Access Key ID', 'Access Id');
    assertInputHasValue('Secret Access Key', 'Access Secret');
    assertInputHasValue('Log Path Prefix', 'file');
  });

  describe('given Test Connection and Edit Destination buttons', () => {
    const testConnectionButtonText = 'Test Connection';
    const editDestinationButtonText = 'Edit Destination';
    const editDestinationSpy = vi.fn();
    const verifyDestinationSpy = vi.fn();

    describe('when Test Connection button clicked and connection verified positively', () => {
      it("should enable Edit Destination button and perform proper call when it's clicked", async () => {
        server.use(
          http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
            return HttpResponse.json(mockDestination);
          }),
          http.post('*/monitor/streams/destinations/verify', () => {
            verifyDestinationSpy();
            return HttpResponse.json({});
          }),
          http.put(`*/monitor/streams/destinations/${destinationId}`, () => {
            editDestinationSpy();
            return HttpResponse.json({});
          })
        );

        renderWithThemeAndHookFormContext({
          component: <DestinationEdit />,
        });
        const loadingElement = screen.queryByTestId(loadingTestId);
        await waitForElementToBeRemoved(loadingElement);

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const editDestinationButton = screen.getByRole('button', {
          name: editDestinationButtonText,
        });

        expect(editDestinationButton).toBeDisabled();
        await userEvent.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();

        await waitFor(() => {
          expect(editDestinationButton).toBeEnabled();
        });

        await userEvent.click(editDestinationButton);
        expect(editDestinationSpy).toHaveBeenCalled();
      });
    });

    describe('when Test Connection button clicked and connection verified negatively', () => {
      it('should not enable Edit Destination button', async () => {
        server.use(
          http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
            return HttpResponse.json(mockDestination);
          }),
          http.post('*/monitor/streams/destinations/verify', () => {
            verifyDestinationSpy();
            return HttpResponse.error();
          })
        );

        renderWithThemeAndHookFormContext({
          component: <DestinationEdit />,
        });

        const loadingElement = screen.queryByTestId(loadingTestId);
        await waitForElementToBeRemoved(loadingElement);
        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const editDestinationButton = screen.getByRole('button', {
          name: editDestinationButtonText,
        });

        expect(editDestinationButton).toBeDisabled();
        await userEvent.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();

        await waitFor(() => {
          expect(editDestinationButton).toBeDisabled();
        });
      });
    });
  });
});
