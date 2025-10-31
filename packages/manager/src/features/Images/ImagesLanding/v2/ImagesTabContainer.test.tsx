import { linodeFactory } from '@linode/utilities';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { ImagesTabContainer } from './ImagesTabContainer';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  usePermissions: vi.fn().mockReturnValue({ data: { create_image: false } }),
  useQueryWithPermissions: vi.fn().mockReturnValue({}),
  useLinodesPermissionsCheck: vi.fn().mockReturnValue({}),
  useSearch: vi.fn(),
}));

// Mock ImagesCustom component so it doesn't lazy load in tests
vi.mock('./ImagesCustom', () => ({
  ImagesCustom: () => <div>ImagesCustom Component</div>,
}));

// Mock ImagesRecovery component so it doesn't lazy load in tests
vi.mock('./ImagesRecovery', () => ({
  ImagesRecovery: () => <div>ImagesCustom Component</div>,
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

describe('ImagesTabContainer component', () => {
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
      pathname: '/images/images',
    });
    queryMocks.useSearch.mockReturnValue({});
  });

  describe('For Custom Images', () => {
    beforeEach(() => {
      queryMocks.useSearch.mockReturnValue({
        subType: 'custom',
      });
    });

    it("should render 'My custom images' tab", async () => {
      const { getByText } = renderWithTheme(<ImagesTabContainer />, {
        initialRoute: '/images/images',
        initialEntries: ['/images/images?subType=custom'],
      });

      expect(getByText('My custom images')).toBeVisible();
    });

    // Test Image action navigations for CUSTOM IMAGES
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
        <ImagesTabContainer />,
        {
          initialRoute: '/images/images',
          initialEntries: ['/images/images?subType=custom'],
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Edit'));

      expect(router.state.location.pathname).toBe(
        `/images/images/${encodeURIComponent(image.id)}/edit`
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
        <ImagesTabContainer />,
        {
          initialRoute: '/images/images',
          initialEntries: ['/images/images?subType=custom'],
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Rebuild an Existing Linode'));

      expect(router.state.location.pathname).toBe(
        `/images/images/${encodeURIComponent(image.id)}/rebuild`
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
        renderWithTheme(<ImagesTabContainer />, {
          initialRoute: '/images/images',
          initialEntries: ['/images/images?subType=custom'],
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
        <ImagesTabContainer />,
        {
          initialRoute: '/images/images',
          initialEntries: ['/images/images?subType=custom'],
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Delete'));

      expect(router.state.location.pathname).toBe(
        `/images/images/${encodeURIComponent(image.id)}/delete`
      );
    });
  });

  describe('For Recovery Images', () => {
    beforeEach(() => {
      queryMocks.useSearch.mockReturnValue({
        subType: 'recovery',
      });
    });

    it("should render 'Recovery images' tab", async () => {
      const { getByText } = renderWithTheme(<ImagesTabContainer />, {
        initialRoute: '/images',
      });

      expect(getByText('Recovery images')).toBeVisible();
    });

    // Test Images Action navigations for RECOVERY IMAGES
    it('should allow opening the Edit Image drawer', async () => {
      const image = imageFactory.build();

      server.use(
        http.get('*/images', ({ request }) => {
          const filter = request.headers.get('x-filter');

          if (filter?.includes('automatic')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { getByText, findByLabelText, router } = renderWithTheme(
        <ImagesTabContainer />,
        {
          initialRoute: '/images/images',
          initialEntries: ['/images/images?subType=recovery'],
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Edit'));

      expect(router.state.location.pathname).toBe(
        `/images/images/${encodeURIComponent(image.id)}/edit`
      );
    });

    it('should allow opening the Restore Image drawer', async () => {
      const image = imageFactory.build();

      server.use(
        http.get('*/images', ({ request }) => {
          const filter = request.headers.get('x-filter');

          if (filter?.includes('automatic')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { router, getByText, findByLabelText } = renderWithTheme(
        <ImagesTabContainer />,
        {
          initialRoute: '/images/images',
          initialEntries: ['/images/images?subType=recovery'],
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Rebuild an Existing Linode'));

      expect(router.state.location.pathname).toBe(
        `/images/images/${encodeURIComponent(image.id)}/rebuild`
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

          if (filter?.includes('automatic')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { findByLabelText, getByText, queryAllByTestId, router } =
        renderWithTheme(<ImagesTabContainer />, {
          initialRoute: '/images/images',
          initialEntries: ['/images/images?subType=recovery'],
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

          if (filter?.includes('automatic')) {
            return HttpResponse.json(makeResourcePage([image]));
          }
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { router, findByLabelText, getByText } = renderWithTheme(
        <ImagesTabContainer />,
        {
          initialRoute: '/images/images',
          initialEntries: ['/images/images?subType=recovery'],
        }
      );

      const actionMenu = await findByLabelText(
        `Action menu for Image ${image.label}`
      );
      await userEvent.click(actionMenu);
      await userEvent.click(getByText('Delete'));

      expect(router.state.location.pathname).toBe(
        `/images/images/${encodeURIComponent(image.id)}/delete`
      );
    });
  });

  it('should not render Custom, Shared and Reovery tabs under Images Tab', async () => {
    const { getByText, queryByText } = renderWithTheme(<ImagesTabContainer />, {
      initialRoute: '/images',
    });

    expect(getByText('My custom images')).toBeVisible();
    expect(queryByText('Shared with me')).toBeVisible();
    expect(getByText('Recovery images')).toBeVisible();
  });
});
