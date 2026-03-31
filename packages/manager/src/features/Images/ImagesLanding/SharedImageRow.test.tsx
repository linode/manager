import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory } from 'src/factories';
import { SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS } from 'src/features/Images/constants';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { SharedImageRow } from './SharedImageRow';

import type { Handlers } from './ImagesActionMenu';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

describe('Shared Image Table Row', () => {
  const handlers: Handlers = {
    onDelete: vi.fn(),
    onDeploy: vi.fn(),
    onEdit: vi.fn(),
    onManageRegions: vi.fn(),
    onRebuild: vi.fn(),
  };

  beforeEach(() => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
  });

  it('should render a shared image row with details', async () => {
    const image = imageFactory.build({
      image_sharing: {
        shared_by: {
          sharegroup_id: 1,
          sharegroup_label: 'my-share-group',
          sharegroup_uuid: 'abc-123',
          source_image_id: 42,
        },
        shared_with: null,
      },
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'available' },
      ],
      size: 300,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <SharedImageRow
          handlers={handlers}
          image={image}
          pendoIDs={SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS}
        />
      )
    );

    expect(getByText(image.label)).toBeVisible();
    expect(getByText('my-share-group')).toBeVisible();
    expect(getByText(image.id)).toBeVisible();
    expect(getByText('2 Regions')).toBeVisible();
    expect(getByText('0.29 GB')).toBeVisible(); // 300 / 1024 = 0.292

    // Open action menu
    const actionMenu = getByLabelText(`Action menu for Image ${image.label}`);
    await userEvent.click(actionMenu);

    expect(getByText('View Image Details')).toBeVisible();
    expect(getByText('Deploy to New Linode')).toBeVisible();
    expect(getByText('Rebuild an Existing Linode')).toBeVisible();
  });

  it('should show a dash for the Share Group column when image_sharing is not set', () => {
    const image = imageFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <SharedImageRow
          handlers={handlers}
          image={image}
          pendoIDs={SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS}
        />
      )
    );

    expect(getByText('-')).toBeVisible();
  });

  it('should show a cloud-init icon if the image supports it', () => {
    const image = imageFactory.build({
      capabilities: ['cloud-init'],
      regions: [{ region: 'us-east', status: 'available' }],
    });

    const { getByLabelText } = renderWithTheme(
      wrapWithTableBody(
        <SharedImageRow
          handlers={handlers}
          image={image}
          pendoIDs={SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS}
        />
      )
    );

    expect(
      getByLabelText('This image supports our Metadata service via cloud-init.')
    ).toBeVisible();
  });

  it('should show a dash in "Replicated in" cell if image does not have any regions', () => {
    const image = imageFactory.build({ regions: [] });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <SharedImageRow
          handlers={handlers}
          image={image}
          pendoIDs={SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS}
        />
      )
    );

    expect(getByText('—')).toBeVisible();
  });

  it('should not show Edit, Manage Replicas, or Delete actions', async () => {
    const image = imageFactory.build({
      regions: [{ region: 'us-east', status: 'available' }],
    });

    const { getByLabelText, queryByText } = renderWithTheme(
      wrapWithTableBody(
        <SharedImageRow
          handlers={handlers}
          image={image}
          pendoIDs={SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS}
        />
      )
    );

    const actionMenu = getByLabelText(`Action menu for Image ${image.label}`);
    await userEvent.click(actionMenu);

    expect(queryByText('Edit')).not.toBeInTheDocument();
    expect(queryByText('Manage Replicas')).not.toBeInTheDocument();
    expect(queryByText('Delete')).not.toBeInTheDocument();
  });

  it('calls handlers when performing actions', async () => {
    const image = imageFactory.build({
      regions: [{ region: 'us-east', status: 'available' }],
    });

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <SharedImageRow
          handlers={handlers}
          image={image}
          pendoIDs={SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS}
        />
      )
    );

    const actionMenu = getByLabelText(`Action menu for Image ${image.label}`);
    await userEvent.click(actionMenu);

    await userEvent.click(getByText('Deploy to New Linode'));
    expect(handlers.onDeploy).toBeCalledWith(image.id);

    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Rebuild an Existing Linode'));
    expect(handlers.onRebuild).toBeCalledWith(image);
  });
});
