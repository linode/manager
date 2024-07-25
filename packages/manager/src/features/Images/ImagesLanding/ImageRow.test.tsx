import userEvent from '@testing-library/user-event';
import * as React from 'react';

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
  const image = imageFactory.build({
    capabilities: ['cloud-init', 'distributed-sites'],
    regions: [
      { region: 'us-east', status: 'available' },
      { region: 'us-southeast', status: 'pending' },
    ],
  });

  const handlers: Handlers = {
    onCancelFailed: vi.fn(),
    onDelete: vi.fn(),
    onDeploy: vi.fn(),
    onEdit: vi.fn(),
    onManageRegions: vi.fn(),
    onRestore: vi.fn(),
    onRetry: vi.fn(),
  };

  it('should render an image row', async () => {
    const { getAllByText, getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <ImageRow handlers={handlers} image={image} multiRegionsEnabled />
      )
    );

    // Check to see if the row rendered some data
    getByText(image.label);
    getAllByText('Ready');
    getAllByText((text) => text.includes(image.regions[0].region));
    getAllByText('+1');
    getAllByText('Cloud-init, Distributed');
    expect(getAllByText('1500 MB').length).toBe(2);
    getAllByText(image.id);

    // Open action menu
    const actionMenu = getByLabelText(`Action menu for Image ${image.label}`);
    await userEvent.click(actionMenu);

    getByText('Edit');
    getByText('Manage Regions');
    getByText('Deploy to New Linode');
    getByText('Rebuild an Existing Linode');
    getByText('Delete');
  });

  it('calls handlers when performing actions', async () => {
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

    await userEvent.click(getByText('Manage Regions'));
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
