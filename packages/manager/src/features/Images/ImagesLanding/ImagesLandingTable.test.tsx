import { linodeFactory } from '@linode/utilities';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { ImagesLandingTable } from './ImagesLandingTable';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({ privateImageSharing: false }),
  useLocation: vi.fn(),
  usePermissions: vi.fn().mockReturnValue({ data: { create_image: false } }),
  useQueryWithPermissions: vi.fn().mockReturnValue({}),
  useLinodesPermissionsCheck: vi.fn().mockReturnValue({}),
  useSearch: vi.fn(),
}));

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
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

describe('Images Landing Table', () => {
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

  it("should render 'My custom images' tab with items", async () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: false });

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

    const { getByText, queryByTestId } = renderWithTheme(
      <ImagesLandingTable />,
      {
        initialRoute: '/images',
      }
    );

    const loadingElement = queryByTestId(loadingTestId);

    await waitForElementToBeRemoved(loadingElement);

    // Custom Images table should render
    getByText('My Custom Images');

    // Static text and table column headers
    expect(getByText('Image')).toBeVisible();
    expect(getByText('Replicated in')).toBeVisible();
    expect(getByText('Original Image')).toBeVisible();
    expect(getByText('All Replicas')).toBeVisible();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Image ID')).toBeVisible();
  });

  it("should render 'Recovery images tab' with items", async () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: false });
    queryMocks.useSearch.mockReturnValue({
      subType: 'recovery',
    });

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

    const { getByText, queryByTestId } = renderWithTheme(
      <ImagesLandingTable />,
      {
        initialRoute: '/images/images',
        initialEntries: ['/images/images?subType=recovery'],
      }
    );

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    // Recovery Images table should render
    getByText('Recovery Images');

    // Static text and table column headers
    expect(getByText('Image')).toBeVisible();
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Size')).toBeVisible();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Expires')).toBeVisible();
  });

  it("should render 'Shared with me' tab only if 'privateImageSharing' feature flag enabled", async () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: true });

    const { getByText, queryByTestId } = renderWithTheme(
      <ImagesLandingTable />,
      {
        initialRoute: '/images',
      }
    );

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    expect(getByText('Shared with me')).toBeVisible();
  });

  it("should not render 'Shared with me' tab if 'privateImageSharing' feature flag disabled", async () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: false });

    const { getByText, queryByTestId, queryByText } = renderWithTheme(
      <ImagesLandingTable />,
      {
        initialRoute: '/images',
      }
    );

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    expect(getByText('My custom images')).toBeVisible();
    expect(queryByText('Shared with me')).toBeNull(); // Not visible
    expect(getByText('Recovery images')).toBeVisible();
  });

  it("should render 'My custom images' (manual) empty state", async () => {
    queryMocks.useSearch.mockReturnValue({
      subType: 'custom',
    });

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

    const { findByText } = renderWithTheme(<ImagesLandingTable />, {
      initialRoute: '/images/images',
      initialEntries: ['/images/images?subType=custom'],
    });

    expect(await findByText('No Custom Images to display.')).toBeVisible();
  });

  it("should render 'Recovery images' (automatic) empty state", async () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: false });
    queryMocks.useSearch.mockReturnValue({
      subType: 'recovery',
    });

    server.use(
      http.get('*/images', ({ request }) => {
        return HttpResponse.json(
          makeResourcePage(
            request.headers.get('x-filter')?.includes('manual')
              ? [imageFactory.build({ type: 'manual' })]
              : []
          )
        );
      })
    );

    const { findByText } = renderWithTheme(<ImagesLandingTable />, {
      initialRoute: '/images/images',
      initialEntries: ['/images/images?subType=recovery'],
    });

    expect(await findByText('No Recovery Images to display.')).toBeVisible();
  });

  // @TODO - check if we need this test or not
  // it('should render images landing empty state', async () => {
  //   server.use(
  //     http.get('*/images', () => {
  //       return HttpResponse.json(makeResourcePage([]));
  //     })
  //   );
  //   const { getByText, queryByTestId } = renderWithTheme(
  //     <ImagesLandingTable />,
  //     {
  //       initialRoute: '/images',
  //     }
  //   );
  //   const loadingElement = queryByTestId(loadingTestId);
  //   await waitForElementToBeRemoved(loadingElement);
  //   expect(
  //     getByText((text) => text.includes('Store custom Linux images'))
  //   ).toBeVisible();
  // });

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
      <ImagesLandingTable />,
      { initialRoute: '/images' }
    );

    const actionMenu = await findByLabelText(
      `Action menu for Image ${image.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Edit'));

    expect(router.state.location.pathname).toBe(
      `/images/${encodeURIComponent(image.id)}/edit`
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
      <ImagesLandingTable />,
      { initialRoute: '/images' }
    );

    const actionMenu = await findByLabelText(
      `Action menu for Image ${image.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Rebuild an Existing Linode'));

    expect(router.state.location.pathname).toBe(
      `/images/${encodeURIComponent(image.id)}/rebuild`
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

    const { findByLabelText, getByText, queryByTestId, router } =
      renderWithTheme(<ImagesLandingTable />, { initialRoute: '/images' });

    const loadingElement = queryByTestId(loadingTestId);
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
      <ImagesLandingTable />,
      { initialRoute: '/images' }
    );

    const actionMenu = await findByLabelText(
      `Action menu for Image ${image.label}`
    );
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Delete'));

    expect(router.state.location.pathname).toBe(
      `/images/${encodeURIComponent(image.id)}/delete`
    );
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

    const { findByLabelText } = renderWithTheme(<ImagesLandingTable />, {
      initialRoute: '/images',
    });

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

    const { getByText, queryByTestId } = renderWithTheme(
      <ImagesLandingTable />,
      {
        initialRoute: '/images',
      }
    );

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    const createButton = getByText('Create Image');
    expect(createButton).toBeDisabled();
    expect(createButton).toHaveAttribute(
      'data-qa-tooltip',
      "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
    );
  });

  it('should enable create button if user has create_image permission', async () => {
    queryMocks.usePermissions.mockReturnValue({ data: { create_image: true } });

    const { getByText, queryByTestId } = renderWithTheme(
      <ImagesLandingTable />,
      {
        initialRoute: '/images',
      }
    );

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    const createButton = getByText('Create Image');
    expect(createButton).toBeEnabled();
  });
});
