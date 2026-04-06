import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  objectStorageBucketFactory,
} from 'src/factories';
import { DestinationEdit } from 'src/features/Delivery/Destinations/DestinationForm/DestinationEdit';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';
const destinationId = 123;
const mockDestination = akamaiObjectStorageDestinationFactory.build({
  id: destinationId,
  label: `Destination ${destinationId}`,
});

const mockBuckets = [
  objectStorageBucketFactory.build({
    hostname: 'bucket-with-hostname.us-east-1.linodeobjects.com',
    label: 'bucket-with-hostname',
    region: 'us-east',
  }),
  objectStorageBucketFactory.build({
    hostname: 'bucket-with-s3-endpoint.eu-central-1.linodeobjects.com',
    label: 'bucket-with-s3-endpoint',
    region: 'eu-central',
    s3_endpoint: 'eu-central-1.linodeobjects.com',
  }),
];

const queryMocks = vi.hoisted(() => ({
  useObjectStorageBuckets: vi.fn().mockReturnValue({
    data: undefined,
    error: null,
    isPending: true,
  }),
}));

vi.mock('src/queries/object-storage/queries', async () => {
  const actual = await vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useObjectStorageBuckets: queryMocks.useObjectStorageBuckets,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ destinationId: 123 }),
  };
});

describe('DestinationEdit', () => {
  beforeEach(() => {
    queryMocks.useObjectStorageBuckets.mockReturnValue({
      data: { buckets: mockBuckets },
      error: null,
      isPending: false,
    });
  });
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
    expect(loadingElement).toBeInTheDocument();
    await waitForElementToBeRemoved(loadingElement);

    assertInputHasValue('Destination Type', 'Akamai Object Storage');
    await waitFor(() => {
      assertInputHasValue('Destination Name', 'Destination 123');
    });
    assertInputHasValue('Endpoint', 'destinations-bucket-name.host.com');
    assertInputHasValue('Bucket', 'destinations-bucket-name');
    assertInputHasValue('Access Key ID', 'Access Id');
    assertInputHasValue('Secret Access Key', '');
    assertInputHasValue('Log Path Prefix (optional)', 'file');
  });

  describe('Bucket selection behavior in edit mode', () => {
    const renderEditWithMockDestination = async () => {
      server.use(
        http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
          return HttpResponse.json(mockDestination);
        })
      );

      renderWithThemeAndHookFormContext({
        component: <DestinationEdit />,
      });

      const loadingElement = screen.queryByTestId(loadingTestId);
      await waitForElementToBeRemoved(loadingElement);
    };

    it('should default to "Enter Bucket manually" radio in edit mode', async () => {
      await renderEditWithMockDestination();

      const manualRadio = screen.getByLabelText('Enter Bucket manually');
      expect(manualRadio).toBeChecked();
    });

    it('should enable the Endpoint field in manual mode', async () => {
      await renderEditWithMockDestination();

      await waitFor(() => {
        expect(screen.getByLabelText('Endpoint')).toBeEnabled();
      });
    });

    it('should clear Bucket and Endpoint when switching to "Select Bucket associated with the account"', async () => {
      await renderEditWithMockDestination();

      await waitFor(() => {
        assertInputHasValue('Bucket', 'destinations-bucket-name');
      });
      assertInputHasValue('Endpoint', 'destinations-bucket-name.host.com');

      // Switch to bucket_from_account
      const bucketFromAccountRadio = screen.getByLabelText(
        'Select Bucket associated with the account'
      );
      await userEvent.click(bucketFromAccountRadio);

      // Both fields should be cleared
      expect(screen.getByLabelText('Bucket')).toHaveValue('');
      expect(screen.getByLabelText('Endpoint')).toHaveValue('');
    });

    it('should disable the Endpoint field after switching to "Select Bucket associated with the account"', async () => {
      await renderEditWithMockDestination();

      const bucketFromAccountRadio = screen.getByLabelText(
        'Select Bucket associated with the account'
      );
      await userEvent.click(bucketFromAccountRadio);

      expect(screen.getByLabelText('Endpoint')).toBeDisabled();
    });

    it('should set Bucket and Endpoint from hostname when selecting a bucket without s3_endpoint', async () => {
      await renderEditWithMockDestination();

      // Switch to bucket_from_account to show the Autocomplete
      const bucketFromAccountRadio = screen.getByLabelText(
        'Select Bucket associated with the account'
      );
      await userEvent.click(bucketFromAccountRadio);

      // Open the Bucket Autocomplete and select a bucket with only hostname
      const bucketAutocomplete = screen.getByLabelText('Bucket');
      await userEvent.click(bucketAutocomplete);

      const bucketOption = await screen.findByText('bucket-with-hostname');
      await userEvent.click(bucketOption);

      // Bucket should display the selected bucket label
      await waitFor(() => {
        expect(bucketAutocomplete).toHaveValue('bucket-with-hostname');
      });

      // Endpoint should be auto-filled with the bucket's hostname
      expect(screen.getByLabelText('Endpoint')).toHaveValue(
        'bucket-with-hostname.us-east-1.linodeobjects.com'
      );
    });

    it('should set Bucket and Endpoint from s3_endpoint when selecting a bucket with s3_endpoint', async () => {
      await renderEditWithMockDestination();

      // Switch to bucket_from_account to show the Autocomplete
      const bucketFromAccountRadio = screen.getByLabelText(
        'Select Bucket associated with the account'
      );
      await userEvent.click(bucketFromAccountRadio);

      // Open the Bucket Autocomplete and select a bucket with s3_endpoint
      const bucketAutocomplete = screen.getByLabelText('Bucket');
      await userEvent.click(bucketAutocomplete);

      const bucketOption = await screen.findByText('bucket-with-s3-endpoint');
      await userEvent.click(bucketOption);

      // Bucket should display the selected bucket label
      await waitFor(() => {
        expect(bucketAutocomplete).toHaveValue('bucket-with-s3-endpoint');
      });

      // Endpoint should be auto-filled with the bucket's s3_endpoint
      expect(screen.getByLabelText('Endpoint')).toHaveValue(
        'eu-central-1.linodeobjects.com'
      );
    });
  });

  describe('given Test Connection and Edit Destination buttons', () => {
    const testConnectionButtonText = 'Test Connection';
    const saveDestinationButtonText = 'Save Changes';
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
        const saveDestinationButton = screen.getByRole('button', {
          name: saveDestinationButtonText,
        });

        // Enter Secret Access Key
        const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
        await userEvent.type(secretAccessKeyInput, 'Test');

        expect(saveDestinationButton).toBeDisabled();
        await userEvent.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();

        await waitFor(() => {
          expect(saveDestinationButton).toBeEnabled();
        });

        await userEvent.click(saveDestinationButton);
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
        const saveDestinationButton = screen.getByRole('button', {
          name: saveDestinationButtonText,
        });

        // Enter Secret Access Key
        const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
        await userEvent.type(secretAccessKeyInput, 'Test');

        expect(saveDestinationButton).toBeDisabled();
        await userEvent.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();

        await waitFor(() => {
          expect(saveDestinationButton).toBeDisabled();
        });
      });
    });
  });
});
