import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { objectStorageBucketFactory } from 'src/factories';
import { mockScrollIntoView } from 'src/features/Delivery/Shared/testHelpers';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationAkamaiObjectStorageDetailsForm } from './DestinationAkamaiObjectStorageDetailsForm';

const bucketWithHostname = 'bucket-with-hostname';
const bucketWithHostnameEndpoint =
  'bucket-with-hostname.us-east-1.linodeobjects.com';
const bucketWithS3Endpoint = 'bucket-with-s3-endpoint';
const s3Endpoint = 'eu-central-1.linodeobjects.com';
const accountBucketLabel = 'Select Bucket associated with the account';
const createMode = 'create';
const endpointLabel = 'Endpoint';
const manualBucketLabel = 'Enter Bucket details manually';

const mockBuckets = [
  objectStorageBucketFactory.build({
    hostname: bucketWithHostnameEndpoint,
    label: bucketWithHostname,
    region: 'us-east',
    s3_endpoint: undefined,
  }),
  objectStorageBucketFactory.build({
    hostname: 'bucket-with-s3-endpoint.eu-central-1.linodeobjects.com',
    label: bucketWithS3Endpoint,
    region: 'eu-central',
    s3_endpoint: s3Endpoint,
  }),
];

const queryMocks = vi.hoisted(() => ({
  useObjectStorageBuckets: vi.fn().mockReturnValue({
    data: null,
    error: null,
    isLoading: true,
  }),
  useRegionsQuery: vi.fn().mockReturnValue({
    data: [],
    isPending: false,
  }),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

vi.mock(
  import('src/features/ObjectStorage/Buckets/hooks/useObjectStorageBuckets'),
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useObjectStorageBuckets: queryMocks.useObjectStorageBuckets,
    };
  }
);

interface TestFormValues {
  details: {
    access_key_id: string;
    access_key_secret: string;
    bucket_name: string;
    host: string;
    path: string;
  };
}

const renderComponent = (mode: 'create' | 'edit') => {
  return renderWithThemeAndHookFormContext<TestFormValues>({
    component: (
      <DestinationAkamaiObjectStorageDetailsForm
        entity="destination"
        mode={mode}
      />
    ),
    useFormOptions: {
      defaultValues: {
        details: {
          access_key_id: '',
          access_key_secret: '',
          bucket_name: '',
          host: '',
          path: '',
        },
      },
    },
  });
};

const selectBucket = async (label: string) => {
  const user = userEvent.setup({ delay: null });
  const bucketInput = screen.getByLabelText('Bucket');

  await user.click(bucketInput);
  await user.click(await screen.findByText(label));

  return bucketInput;
};

describe('DestinationAkamaiObjectStorageDetailsForm', () => {
  beforeEach(() => {
    mockScrollIntoView();
    queryMocks.useObjectStorageBuckets.mockReturnValue({
      data: mockBuckets,
      error: null,
      isLoading: false,
    });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [],
      isPending: false,
    });
  });

  describe('in create mode', () => {
    it('should update Sample Destination Object Name when Log Path Prefix changes', async () => {
      const user = userEvent.setup({ delay: null });

      renderComponent(createMode);
      await user.type(
        screen.getByLabelText('Log Path Prefix (optional)'),
        '/test'
      );

      screen.getByText('/test/akamai_log-000166-1756015362-319597-login.gz');
    });

    it('should default to account bucket with a disabled Endpoint field', () => {
      renderComponent(createMode);

      expect(screen.getByLabelText(accountBucketLabel)).toBeChecked();
      expect(screen.getByLabelText(endpointLabel)).toBeDisabled();
    });

    it('should enable Endpoint when manual bucket details are selected', async () => {
      const user = userEvent.setup({ delay: null });

      renderComponent(createMode);
      await user.click(screen.getByLabelText(manualBucketLabel));

      expect(screen.getByLabelText(endpointLabel)).toBeEnabled();
    });

    it('should clear Bucket and Endpoint when switching back to account bucket', async () => {
      const user = userEvent.setup({ delay: null });

      renderComponent(createMode);
      await user.click(screen.getByLabelText(manualBucketLabel));
      await user.type(screen.getByLabelText('Bucket'), 'my-manual-bucket');
      await user.type(screen.getByLabelText(endpointLabel), 'my-endpoint.com');

      await user.click(screen.getByLabelText(accountBucketLabel));

      expect(screen.getByLabelText('Bucket')).toHaveValue('');
      expect(screen.getByLabelText(endpointLabel)).toHaveValue('');
    });

    it('should set Bucket and Endpoint from s3_endpoint when selecting a bucket with s3_endpoint', async () => {
      renderComponent(createMode);

      const bucketInput = await selectBucket(bucketWithS3Endpoint);

      await waitFor(() => {
        expect(bucketInput).toHaveValue(bucketWithS3Endpoint);
      });
      expect(screen.getByLabelText(endpointLabel)).toHaveValue(s3Endpoint);
    });

    it('should set Bucket and Endpoint from hostname when selecting a bucket without s3_endpoint', async () => {
      renderComponent(createMode);

      const bucketInput = await selectBucket(bucketWithHostname);

      await waitFor(() => {
        expect(bucketInput).toHaveValue(bucketWithHostname);
      });
      expect(screen.getByLabelText(endpointLabel)).toHaveValue(
        bucketWithHostnameEndpoint
      );
    });
  });

  describe('in edit mode', () => {
    it('should default to "Enter Bucket details manually" radio', () => {
      renderComponent('edit');

      expect(screen.getByLabelText(manualBucketLabel)).toBeChecked();
    });

    it('should have Endpoint enabled by default', () => {
      renderComponent('edit');

      expect(screen.getByLabelText(endpointLabel)).toBeEnabled();
    });

    it('should clear Bucket and Endpoint when switching to account bucket', async () => {
      const user = userEvent.setup({ delay: null });

      renderComponent('edit');
      await user.type(screen.getByLabelText('Bucket'), 'existing-bucket');
      await user.type(
        screen.getByLabelText(endpointLabel),
        'existing-endpoint.com'
      );

      await user.click(screen.getByLabelText(accountBucketLabel));

      expect(screen.getByLabelText('Bucket')).toHaveValue('');
      expect(screen.getByLabelText(endpointLabel)).toHaveValue('');
    });

    it('should disable Endpoint after switching to account bucket', async () => {
      const user = userEvent.setup({ delay: null });

      renderComponent('edit');
      await user.click(screen.getByLabelText(accountBucketLabel));

      expect(screen.getByLabelText(endpointLabel)).toBeDisabled();
    });

    it('should set Bucket and Endpoint from hostname when selecting a bucket without s3_endpoint', async () => {
      const user = userEvent.setup({ delay: null });

      renderComponent('edit');
      await user.click(screen.getByLabelText(accountBucketLabel));

      const bucketInput = await selectBucket(bucketWithHostname);

      await waitFor(() => {
        expect(bucketInput).toHaveValue(bucketWithHostname);
      });
      expect(screen.getByLabelText(endpointLabel)).toHaveValue(
        bucketWithHostnameEndpoint
      );
    });

    it('should set Bucket and Endpoint from s3_endpoint when selecting a bucket with s3_endpoint', async () => {
      const user = userEvent.setup({ delay: null });

      renderComponent('edit');
      await user.click(screen.getByLabelText(accountBucketLabel));

      const bucketInput = await selectBucket(bucketWithS3Endpoint);

      await waitFor(() => {
        expect(bucketInput).toHaveValue(bucketWithS3Endpoint);
      });
      expect(screen.getByLabelText(endpointLabel)).toHaveValue(s3Endpoint);
    });
  });
});
