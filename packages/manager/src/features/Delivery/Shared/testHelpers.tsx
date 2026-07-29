import { screen, waitForElementToBeRemoved } from '@testing-library/react';

import { objectStorageBucketFactory } from 'src/factories';

import type { UserEvent } from '@testing-library/user-event';

/** JSDOM does not implement scrollIntoView. */
export const mockScrollIntoView = () => {
  Element.prototype.scrollIntoView ??= vi.fn();
};

/**
 * Waits for the `circle-progress` loader to be removed from the DOM.
 *
 * No-op when the loader is not present, so it is safe to call after a render
 * that may or may not show a loading state.
 */
export const waitForLoadingToComplete = async () => {
  const loadingElement = screen.queryByTestId('circle-progress');
  if (loadingElement) {
    await waitForElementToBeRemoved(loadingElement);
  }
};

export const mockObjectStorageBuckets = [
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

/**
 * Fills the Akamai Object Storage bucket fields in manual-entry mode (Endpoint,
 * Bucket, Access Key, Secret Key, Log Path Prefix). Assumes the destination
 * details form is already visible.
 */
export const fillOutAkamaiObjectStorageDestinationFields = async (
  user: UserEvent
) => {
  await user.click(screen.getByLabelText('Enter Bucket details manually'));
  await user.type(screen.getByLabelText('Endpoint'), 'test.com');
  await user.type(screen.getByLabelText('Bucket'), 'test');
  await user.type(screen.getByLabelText('Access Key'), 'Test');
  await user.type(screen.getByLabelText('Secret Key'), 'Test');
  await user.type(screen.getByLabelText('Log Path Prefix (optional)'), 'Test');
};
