import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory } from 'src/factories';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { ImageRow } from './ImageRow';

import type { Handlers } from './ImagesActionMenu';

beforeAll(() => mockMatchMedia());

describe('Image Table Row', () => {
  const handlers: Handlers = {
    onCancelFailed: vi.fn(),
    onDelete: vi.fn(),
    onDeploy: vi.fn(),
    onEdit: vi.fn(),
    onManageRegions: vi.fn(),
    onRebuild: vi.fn(),
  };

  it('should render an image row with details', async () => {
    const image = imageFactory.build({
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'available' },
      ],
      size: 300,
      total_size: 600,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(<ImageRow handlers={handlers} image={image} />)
    );

    // Check to see if the row rendered some data
    expect(getByText(image.label)).toBeVisible();
    expect(getByText(image.id)).toBeVisible();
    expect(getByText('Available')).toBeVisible();
    expect(getByText('2 Regions')).toBeVisible();
    expect(getByText('0.29 GB')).toBeVisible(); // Size is converted from MB to GB - 300 / 1024 = 0.292
    expect(getByText('0.59 GB')).toBeVisible(); // Size is converted from MB to GB - 600 / 1024 = 0.585

    // Open action menu
    const actionMenu = getByLabelText(`Action menu for Image ${image.label}`);
    await userEvent.click(actionMenu);

    expect(getByText('Edit')).toBeVisible();
    expect(getByText('Manage Replicas')).toBeVisible();
    expect(getByText('Deploy to New Linode')).toBeVisible();
    expect(getByText('Rebuild an Existing Linode')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('should show a cloud-init icon if the image supports it', () => {
    const image = imageFactory.build({
      capabilities: ['cloud-init'],
      regions: [{ region: 'us-east', status: 'available' }],
    });

    const { getByLabelText } = renderWithTheme(
      wrapWithTableBody(<ImageRow handlers={handlers} image={image} />)
    );

    expect(
      getByLabelText('This image supports our Metadata service via cloud-init.')
    ).toBeVisible();
  });

  it('should show an unencrypted icon if the image is not "Gen2" (does not have the distributed-site capability)', () => {
    const image = imageFactory.build({
      capabilities: ['cloud-init'],
      regions: [],
      status: 'available',
    });

    const { getByLabelText } = renderWithTheme(
      wrapWithTableBody(<ImageRow handlers={handlers} image={image} />)
    );

    expect(
      getByLabelText('This image is not encrypted.', { exact: false })
    ).toBeVisible();
  });

  it('should not show an unencrypted icon when a "Gen2" Image is still "creating"', () => {
    // The API does not populate the "distributed-sites" capability until the image is done creating.
    // We must account for this because the image would show as "Unencrypted" while it is creating,
    // then suddenly show as encrypted once it was done creating. We don't want that.
    // Therefore, we decided we won't show the unencrypted icon until the image is done creating to
    // prevent confusion.
    const image = imageFactory.build({
      capabilities: ['cloud-init'],
      status: 'creating',
      type: 'manual',
    });

    const { queryByLabelText } = renderWithTheme(
      wrapWithTableBody(<ImageRow handlers={handlers} image={image} />)
    );

    expect(
      queryByLabelText('This image is not encrypted.', { exact: false })
    ).toBeNull();
  });

  it('should show N/A if Image does not have any regions', () => {
    const image = imageFactory.build({ regions: [] });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<ImageRow handlers={handlers} image={image} />)
    );

    expect(getByText('N/A')).toBeVisible();
  });

  it('calls handlers when performing actions', async () => {
    const image = imageFactory.build({
      regions: [{ region: 'us-east', status: 'available' }],
    });

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(<ImageRow handlers={handlers} image={image} />)
    );

    // Open action menu
    const actionMenu = getByLabelText(`Action menu for Image ${image.label}`);
    await userEvent.click(actionMenu);

    await userEvent.click(getByText('Edit'));
    expect(handlers.onEdit).toBeCalledWith(image);

    await userEvent.click(getByText('Manage Replicas'));
    expect(handlers.onManageRegions).toBeCalledWith(image);

    await userEvent.click(getByText('Deploy to New Linode'));
    expect(handlers.onDeploy).toBeCalledWith(image.id);

    await userEvent.click(getByText('Rebuild an Existing Linode'));
    expect(handlers.onRebuild).toBeCalledWith(image);

    await userEvent.click(getByText('Delete'));
    expect(handlers.onDelete).toBeCalledWith(image);
  });
});
