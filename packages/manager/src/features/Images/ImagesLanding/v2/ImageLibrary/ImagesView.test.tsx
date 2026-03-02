import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { ImagesView } from './ImagesView';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  usePermissions: vi.fn().mockReturnValue({ data: { create_image: false } }),
  useQueryWithPermissions: vi.fn().mockReturnValue({}),
  useLinodesPermissionsCheck: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('../utils.ts', async () => {
  const actual = await vi.importActual('../utils');
  return {
    ...actual,
    useLinodesPermissionsCheck: queryMocks.useLinodesPermissionsCheck,
  };
});

const mockHandlers = {
  onDelete: vi.fn(),
  onDeploy: vi.fn(),
  onEdit: vi.fn(),
  onRebuild: vi.fn(),
  onManageReplicas: vi.fn(),
};

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';

describe('ImagesView component', () => {
  beforeEach(() => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        update_image: true,
        delete_image: true,
        rebuild_linode: true,
        create_linode: true,
        replicate_image: true,
      },
    });

    queryMocks.useLocation.mockReturnValue({
      pathname: '/images/image-library',
    });
  });

  // For Custom Images (Owned by me)
  describe('For Custom Images (Owned by me)', () => {
    it("should render 'Owned by me' tab with items", async () => {
      server.use(
        http.get('*/images', () => {
          const images = imageFactory.buildList(3, {
            regions: [
              { region: 'us-east', status: 'available' },
              { region: 'us-southeast', status: 'pending' },
            ],
          });
          return HttpResponse.json(makeResourcePage(images));
        })
      );

      const { getByText, queryAllByTestId } = renderWithTheme(
        <ImagesView handlers={mockHandlers} type="owned-by-me" />,
        {
          initialRoute: '/images/image-library/owned-by-me',
        }
      );

      const loadingElement = queryAllByTestId(loadingTestId);
      await waitForElementToBeRemoved(loadingElement);

      // Custom Images table should render
      getByText('Owned by me');

      // Static text and table column headers
      expect(getByText('Image')).toBeVisible();
      expect(getByText('Replicated in')).toBeVisible();
      expect(getByText('Original Image')).toBeVisible();
      expect(getByText('All Replicas')).toBeVisible();
      expect(getByText('Created')).toBeVisible();
      expect(getByText('Image ID')).toBeVisible();
    });

    it("should render 'Owned by me' (manual) empty state", async () => {
      server.use(
        http.get('*/images', ({ request }) => {
          return HttpResponse.json(
            makeResourcePage(
              request.headers.get('x-filter')?.includes('automatic')
                ? [imageFactory.build({ type: 'automatic' })]
                : []
            )
          );
        })
      );

      const { findByText } = renderWithTheme(
        <ImagesView handlers={mockHandlers} type="owned-by-me" />,
        {
          initialRoute: '/images/image-library/owned-by-me',
        }
      );

      expect(await findByText('No custom images to display')).toBeVisible();
    });

    it('disables the action menu buttons if user does not have permissions to edit images', async () => {
      queryMocks.usePermissions.mockReturnValue({
        data: { create_image: false },
      });
      const image = imageFactory.build({
        id: 'private/99999',
        label: 'vi-test-image',
      });
      queryMocks.useLinodesPermissionsCheck.mockReturnValue({
        availableLinodes: [],
      });

      server.use(
        http.get('*/images', ({ request }) => {
          const filter = request.headers.get('x-filter');

          if (filter?.includes('manual')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { findByLabelText } = renderWithTheme(
        <ImagesView handlers={mockHandlers} type="owned-by-me" />,
        {
          initialRoute: '/images/image-library/owned-by-me',
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );

      await userEvent.click(actionMenu);

      const disabledEditText = await findByLabelText(
        "You don't have permissions to edit this Image. Please contact your account administrator to request the necessary permissions."
      );
      const disabledDeleteText = await findByLabelText(
        "You don't have permissions to delete this Image. Please contact your account administrator to request the necessary permissions."
      );
      const disabledLinodeCreationText = await findByLabelText(
        "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions."
      );

      expect(disabledEditText).toBeVisible();
      expect(disabledDeleteText).toBeVisible();
      expect(disabledLinodeCreationText).toBeVisible();
    });

    it('should disable create button if user lacks create_image permission', async () => {
      queryMocks.usePermissions.mockReturnValue({
        data: { create_image: false },
      });

      const { getByText, queryAllByTestId } = renderWithTheme(
        <ImagesView handlers={mockHandlers} type="owned-by-me" />,
        {
          initialRoute: '/images/image-library/owned-by-me',
        }
      );

      const loadingElement = queryAllByTestId(loadingTestId);
      await waitForElementToBeRemoved(loadingElement);

      const createButton = getByText('Create Image');
      expect(createButton).toBeDisabled();
      expect(createButton).toHaveAttribute(
        'data-qa-tooltip',
        "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
      );
    });

    it('should enable create button if user has create_image permission', async () => {
      queryMocks.usePermissions.mockReturnValue({
        data: { create_image: true },
      });

      const { getByText, queryAllByTestId } = renderWithTheme(
        <ImagesView handlers={mockHandlers} type="owned-by-me" />,
        {
          initialRoute: '/images/image-library/owned-by-me',
        }
      );

      const loadingElement = queryAllByTestId(loadingTestId);
      await waitForElementToBeRemoved(loadingElement);

      const createButton = getByText('Create Image');
      expect(createButton).toBeEnabled();
    });
  });

  // For Recovery images
  describe('For Recovery images', () => {
    it("should render 'Recovery images tab' with items", async () => {
      server.use(
        http.get('*/images', () => {
          const images = imageFactory.buildList(3, {
            regions: [
              { region: 'us-east', status: 'available' },
              { region: 'us-southeast', status: 'pending' },
            ],
            type: 'automatic',
          });
          return HttpResponse.json(makeResourcePage(images));
        })
      );

      const { getByText, queryAllByTestId } = renderWithTheme(
        <ImagesView handlers={mockHandlers} type="recovery-images" />,
        {
          initialRoute: '/images/image-library/recovery-images',
        }
      );

      const loadingElement = queryAllByTestId(loadingTestId);
      await waitForElementToBeRemoved(loadingElement);

      // Recovery images table should render
      getByText('Recovery images');

      // Static text and table column headers
      expect(getByText('Image')).toBeVisible();
      expect(getByText('Status')).toBeVisible();
      expect(getByText('Size')).toBeVisible();
      expect(getByText('Created')).toBeVisible();
      expect(getByText('Expires')).toBeVisible();
    });

    it("should render 'Recovery images' (automatic) empty state", async () => {
      server.use(
        http.get('*/images', () => {
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { findByText } = renderWithTheme(
        <ImagesView handlers={mockHandlers} type="recovery-images" />,
        {
          initialRoute: '/images/image-library/recovery-images',
        }
      );

      expect(await findByText('No recovery images to display')).toBeVisible();
    });

    it('disables the action menu buttons if user does not have permissions to edit images', async () => {
      queryMocks.usePermissions.mockReturnValue({
        data: { create_image: false },
      });
      const image = imageFactory.build({
        id: 'private/99999',
        label: 'vi-test-image',
      });
      queryMocks.useLinodesPermissionsCheck.mockReturnValue({
        availableLinodes: [],
      });

      server.use(
        http.get('*/images', ({ request }) => {
          const filter = request.headers.get('x-filter');

          if (filter?.includes('automatic')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { findByLabelText } = renderWithTheme(
        <ImagesView handlers={mockHandlers} type="recovery-images" />,
        {
          initialRoute: '/images/image-library/recovery-images',
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );

      await userEvent.click(actionMenu);

      const disabledEditText = await findByLabelText(
        "You don't have permissions to edit this Image. Please contact your account administrator to request the necessary permissions."
      );
      const disabledDeleteText = await findByLabelText(
        "You don't have permissions to delete this Image. Please contact your account administrator to request the necessary permissions."
      );
      const disabledLinodeCreationText = await findByLabelText(
        "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions."
      );

      expect(disabledEditText).toBeVisible();
      expect(disabledDeleteText).toBeVisible();
      expect(disabledLinodeCreationText).toBeVisible();
    });
  });
});
