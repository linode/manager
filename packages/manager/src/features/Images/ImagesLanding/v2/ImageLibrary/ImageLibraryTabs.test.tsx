import { linodeFactory } from '@linode/utilities';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { ImageLibraryTabs } from './ImageLibraryTabs';

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

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';

describe('ImageLibraryTabs', () => {
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
    it("should render 'Owned by me' tab", async () => {
      const { getByText } = renderWithTheme(<ImageLibraryTabs />, {
        initialRoute: '/images/image-library/owned-by-me',
      });

      expect(getByText('Owned by me')).toBeVisible();
    });

    // Test Image action navigations for CUSTOM IMAGES (Owned by me)
    it('should allow opening the Edit Image drawer', async () => {
      const image = imageFactory.build();

      server.use(
        http.get('*/images', ({ request }) => {
          const filter = request.headers.get('x-filter');

          if (filter?.includes('manual')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { getByText, findByLabelText, router } = renderWithTheme(
        <ImageLibraryTabs />,
        {
          initialRoute: '/images/image-library/owned-by-me/',
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Edit'));

      expect(router.state.location.pathname).toBe(
        `/images/image-library/owned-by-me/${encodeURIComponent(image.id)}/edit`
      );
    });

    it('should allow opening the Restore Image drawer', async () => {
      const image = imageFactory.build();

      server.use(
        http.get('*/images', ({ request }) => {
          const filter = request.headers.get('x-filter');

          if (filter?.includes('manual')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { router, getByText, findByLabelText } = renderWithTheme(
        <ImageLibraryTabs />,
        {
          initialRoute: '/images/image-library/owned-by-me/',
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Rebuild an Existing Linode'));

      expect(router.state.location.pathname).toBe(
        `/images/image-library/owned-by-me/${encodeURIComponent(image.id)}/rebuild`
      );
    });

    it('should allow deploying to a new Linode', async () => {
      const image = imageFactory.build();
      queryMocks.useLinodesPermissionsCheck.mockReturnValue({
        availableLinodes: [linodeFactory.build()],
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

      const { findByLabelText, getByText, queryAllByTestId, router } =
        renderWithTheme(<ImageLibraryTabs />, {
          initialRoute: '/images/image-library/owned-by-me/',
        });

      const loadingElement = queryAllByTestId(loadingTestId);
      await waitForElementToBeRemoved(loadingElement);

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Deploy to New Linode'));

      expect(router.state.location.pathname).toBe('/linodes/create/images');

      expect(router.state.location.search).toStrictEqual({
        imageID: image.id,
      });
    });

    it('should allow deleting an image', async () => {
      const image = imageFactory.build();

      server.use(
        http.get('*/images', ({ request }) => {
          const filter = request.headers.get('x-filter');

          if (filter?.includes('manual')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { router, findByLabelText, getByText } = renderWithTheme(
        <ImageLibraryTabs />,
        {
          initialRoute: '/images/image-library/owned-by-me/',
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Delete'));

      expect(router.state.location.pathname).toBe(
        `/images/image-library/owned-by-me/${encodeURIComponent(image.id)}/delete`
      );
    });
  });

  it('should render Owned (custom), Shared and Recovery tabs under Images Library Tab', async () => {
    const { getByText } = renderWithTheme(<ImageLibraryTabs />, {
      initialRoute: '/images/image-library',
    });

    expect(getByText('Owned by me', { selector: 'button' })).toBeVisible();
    expect(getByText('Shared with me', { selector: 'button' })).toBeVisible();
    expect(getByText('Recovery images', { selector: 'button' })).toBeVisible();
  });
});
