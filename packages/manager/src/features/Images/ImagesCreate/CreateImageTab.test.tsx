import { waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import {
  imageFactory,
  linodeDiskFactory,
  linodeFactory,
  regionFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateImageTab } from './CreateImageTab';

describe('CreateImageTab', () => {
  it('should render fields, titles, and buttons in their default state', () => {
    const { getByLabelText, getByText } = renderWithTheme(<CreateImageTab />);

    expect(getByText('Select Linode & Disk')).toBeVisible();

    expect(getByLabelText('Linode')).toBeVisible();

    const diskSelect = getByLabelText('Disk');

    expect(diskSelect).toBeVisible();
    expect(diskSelect).toBeDisabled();

    expect(getByText('Select a Linode to see available disks')).toBeVisible();

    expect(getByText('Image Details')).toBeVisible();

    expect(getByLabelText('Label')).toBeVisible();
    expect(getByLabelText('Add Tags')).toBeVisible();
    expect(getByLabelText('Description')).toBeVisible();

    const submitButton = getByText('Create Image').closest('button');

    expect(submitButton).toBeVisible();
    expect(submitButton).toBeEnabled();
  });

  it('should pre-fill Linode and Disk from search params', async () => {
    const linode = linodeFactory.build();
    const disk = linodeDiskFactory.build();

    server.use(
      http.get('*/v4/linode/instances', () => {
        return HttpResponse.json(makeResourcePage([linode]));
      }),
      http.get('*/v4/linode/instances/:id/disks', () => {
        return HttpResponse.json(makeResourcePage([disk]));
      })
    );

    const { getByLabelText } = renderWithTheme(<CreateImageTab />, {
      MemoryRouter: {
        initialEntries: [
          `/images/create/disk?selectedLinode=${linode.id}&selectedDisk=${disk.id}`,
        ],
      },
    });

    await waitFor(() => {
      expect(getByLabelText('Linode')).toHaveValue(linode.label);
      expect(getByLabelText('Disk')).toHaveValue(disk.label);
    });
  });

  it('should render client side validation errors', async () => {
    const { getByText } = renderWithTheme(<CreateImageTab />);

    const submitButton = getByText('Create Image').closest('button');

    await userEvent.click(submitButton!);

    expect(getByText('Disk is required.')).toBeVisible();
  });

  it('should allow the user to select a disk and submit the form', async () => {
    const linode = linodeFactory.build();
    const disk = linodeDiskFactory.build();
    const image = imageFactory.build();

    server.use(
      http.get('*/v4/linode/instances', () => {
        return HttpResponse.json(makeResourcePage([linode]));
      }),
      http.get('*/v4/linode/instances/:id/disks', () => {
        return HttpResponse.json(makeResourcePage([disk]));
      }),
      http.post('*/v4/images', () => {
        return HttpResponse.json(image);
      })
    );

    const {
      findByText,
      getByLabelText,
      getByText,
      queryByText,
    } = renderWithTheme(<CreateImageTab />);

    const linodeSelect = getByLabelText('Linode');

    await userEvent.click(linodeSelect);

    const linodeOption = await findByText(linode.label);

    await userEvent.click(linodeOption);

    const diskSelect = getByLabelText('Disk');

    // Once a Linode is selected, the Disk select should become enabled
    expect(diskSelect).toBeEnabled();
    expect(queryByText('Select a Linode to see available disks')).toBeNull();

    await userEvent.click(diskSelect);

    const diskOption = await findByText(disk.label);

    await userEvent.click(diskOption);

    const submitButton = getByText('Create Image').closest('button');

    await userEvent.click(submitButton!);

    // Verify success toast shows
    await findByText('Image scheduled for creation.');
  });

  it('should render a notice if the user selects a Linode in a distributed compute region', async () => {
    const region = regionFactory.build({ site_type: 'distributed' });
    const linode = linodeFactory.build({ region: region.id });

    server.use(
      http.get('*/v4/linode/instances', () => {
        return HttpResponse.json(makeResourcePage([linode]));
      }),
      http.get('*/v4/linode/instances/:id', () => {
        return HttpResponse.json(linode);
      }),
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText, getByLabelText } = renderWithTheme(<CreateImageTab />);

    const linodeSelect = getByLabelText('Linode');

    await userEvent.click(linodeSelect);

    const linodeOption = await findByText(linode.label);

    await userEvent.click(linodeOption);

    // Verify distributed compute region notice renders
    await findByText(
      "This Linode is in a distributed compute region. These regions can't store images.",
      { exact: false }
    );
  });

  it('should render a notice if the user selects a Linode in a region that does not support image storage and Image Service Gen 2 GA is enabled', async () => {
    const region = regionFactory.build({ capabilities: [] });
    const linode = linodeFactory.build({ region: region.id });

    server.use(
      http.get('*/v4/linode/instances', () => {
        return HttpResponse.json(makeResourcePage([linode]));
      }),
      http.get('*/v4/linode/instances/:id', () => {
        return HttpResponse.json(linode);
      }),
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText, getByLabelText } = renderWithTheme(<CreateImageTab />, {
      flags: { imageServiceGen2: true, imageServiceGen2Ga: true },
    });

    const linodeSelect = getByLabelText('Linode');

    await userEvent.click(linodeSelect);

    const linodeOption = await findByText(linode.label);

    await userEvent.click(linodeOption);

    await findByText(
      'This Linode’s region doesn’t support local image storage.',
      { exact: false }
    );
  });

  it('should render an encryption notice if disk encryption is enabled and the Linode is not in a distributed compute region', async () => {
    const region = regionFactory.build({ site_type: 'core' });
    const linode = linodeFactory.build({ region: region.id });

    server.use(
      http.get('*/v4/linode/instances', () => {
        return HttpResponse.json(makeResourcePage([linode]));
      }),
      http.get('*/v4/linode/instances/:id', () => {
        return HttpResponse.json(linode);
      }),
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText, getByLabelText } = renderWithTheme(<CreateImageTab />, {
      flags: { linodeDiskEncryption: true },
    });

    const linodeSelect = getByLabelText('Linode');

    await userEvent.click(linodeSelect);

    const linodeOption = await findByText(linode.label);

    await userEvent.click(linodeOption);

    // Verify encryption notice renders
    await findByText('Virtual Machine Images are not encrypted.');
  });

  it('should auto-populate image label based on linode and disk', async () => {
    const linode = linodeFactory.build();
    const disk1 = linodeDiskFactory.build();
    const disk2 = linodeDiskFactory.build();
    const image = imageFactory.build();

    server.use(
      http.get('*/v4/linode/instances', () => {
        return HttpResponse.json(makeResourcePage([linode]));
      }),
      http.get('*/v4/linode/instances/:id', () => {
        return HttpResponse.json(linode);
      }),
      http.get('*/v4/linode/instances/:id/disks', () => {
        return HttpResponse.json(makeResourcePage([disk1, disk2]));
      }),
      http.post('*/v4/images', () => {
        return HttpResponse.json(image);
      })
    );

    const { findByText, getByLabelText, queryByText } = renderWithTheme(
      <CreateImageTab />
    );

    const linodeSelect = getByLabelText('Linode');

    await userEvent.click(linodeSelect);

    const linodeOption = await findByText(linode.label);

    await userEvent.click(linodeOption);

    const diskSelect = getByLabelText('Disk');

    // Once a Linode is selected, the Disk select should become enabled
    expect(diskSelect).toBeEnabled();
    expect(queryByText('Select a Linode to see available disks')).toBeNull();

    await userEvent.click(diskSelect);

    const diskOption = await findByText(disk1.label);

    await userEvent.click(diskOption);

    // Image label should auto-populate
    const imageLabel = getByLabelText('Label');
    expect(imageLabel).toHaveValue(`${linode.label}-${disk1.label}`);

    // Image label should update
    await userEvent.click(diskSelect);

    const disk2Option = await findByText(disk2.label);
    await userEvent.click(disk2Option);

    expect(imageLabel).toHaveValue(`${linode.label}-${disk2.label}`);

    // Image label should not override user input
    const customLabel = 'custom-label';
    await userEvent.clear(imageLabel);
    await userEvent.type(imageLabel, customLabel);
    expect(imageLabel).toHaveValue(customLabel);
    await userEvent.click(diskSelect);
    await userEvent.click(diskOption);
    expect(imageLabel).toHaveValue(customLabel);
  });
});
