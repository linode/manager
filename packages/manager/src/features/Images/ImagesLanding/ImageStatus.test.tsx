import React from 'react';

import { eventFactory, imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageStatus } from './ImageStatus';

describe('ImageStatus', () => {
  it('renders the image status', () => {
    const image = imageFactory.build({ status: 'available' });

    const { getByText } = renderWithTheme(
      <ImageStatus event={undefined} image={image} />
    );

    expect(getByText('Available')).toBeVisible();
  });

  it('should render the first region status if any region status is not "available"', () => {
    const image = imageFactory.build({
      regions: [
        { region: 'us-west', status: 'available' },
        { region: 'us-east', status: 'pending replication' },
      ],
      status: 'available',
    });

    const { getByText } = renderWithTheme(
      <ImageStatus event={undefined} image={image} />
    );

    expect(getByText('Pending Replication')).toBeVisible();
  });

  it('should render the image status with a percent if an in progress event is happening', () => {
    const image = imageFactory.build({ status: 'creating' });
    const event = eventFactory.build({
      percent_complete: 20,
      status: 'started',
    });

    const { getByText } = renderWithTheme(
      <ImageStatus event={event} image={image} />
    );

    expect(getByText('Creating (20%)')).toBeVisible();
  });

  it('should render "Upload Failed" if image is pending_upload, but we have a failed image upload event', () => {
    const image = imageFactory.build({ status: 'pending_upload' });
    const event = eventFactory.build({
      action: 'image_upload',
      message: 'Image too large when uncompressed',
      status: 'failed',
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <ImageStatus event={event} image={image} />
    );

    expect(getByText('Upload Failed')).toBeVisible();
    expect(getByLabelText('Image too large when uncompressed')).toBeVisible();
  });
});
