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
    onRestore: vi.fn(),
    onRetry: vi.fn(),
  };

  it('should render an image row with Image Service Gen2 enabled', async () => {
    const image = imageFactory.build({
      capabilities: ['cloud-init', 'distributed-sites'],
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
      size: 300,
      total_size: 600,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <ImageRow handlers={handlers} image={image} multiRegionsEnabled />
      )
    );

    // Check to see if the row rendered some data
    expect(getByText(image.label)).toBeVisible();
    expect(getByText(image.id)).toBeVisible();
    expect(getByText('Ready')).toBeVisible();
    expect(getByText('Cloud-init, Distributed')).toBeVisible();
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

  it('should show a cloud-init icon with a tooltip when Image Service Gen 2 GA is enabled and the image supports cloud-init', () => {
    const image = imageFactory.build({
      capabilities: ['cloud-init'],
      regions: [{ region: 'us-east', status: 'available' }],
    });

    const { getByLabelText } = renderWithTheme(
      wrapWithTableBody(
        <ImageRow handlers={handlers} image={image} multiRegionsEnabled />,
        { flags: { imageServiceGen2: true, imageServiceGen2Ga: true } }
      )
    );

    expect(
      getByLabelText('This image supports our Metadata service via cloud-init.')
    ).toBeVisible();
  });

  it('does not show the compatibility column when Image Service Gen2 GA is enabled', () => {
    const image = imageFactory.build({
      capabilities: ['cloud-init', 'distributed-sites'],
    });

    const { queryByText } = renderWithTheme(
      wrapWithTableBody(
        <ImageRow handlers={handlers} image={image} multiRegionsEnabled />,
        { flags: { imageServiceGen2: true, imageServiceGen2Ga: true } }
      )
    );

    expect(queryByText('Cloud-init, Distributed')).not.toBeInTheDocument();
  });

  it('should show N/A if multiRegionsEnabled is true, but the Image does not have any regions', () => {
    const image = imageFactory.build({ regions: [] });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <ImageRow handlers={handlers} image={image} multiRegionsEnabled />,
        { flags: { imageServiceGen2: true } }
      )
    );

    expect(getByText('N/A')).toBeVisible();
  });

  it('calls handlers when performing actions', async () => {
    const image = imageFactory.build({
      regions: [{ region: 'us-east', status: 'available' }],
    });

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <ImageRow handlers={handlers} image={image} multiRegionsEnabled />
      )
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
    expect(handlers.onRestore).toBeCalledWith(image);

    await userEvent.click(getByText('Delete'));
    expect(handlers.onDelete).toBeCalledWith(
      image.label,
      image.id,
      image.status
    );
  });
});
