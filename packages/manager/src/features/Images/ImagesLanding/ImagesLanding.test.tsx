import { linodeFactory } from '@linode/utilities';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import ImagesLanding from './ImagesLanding';

const queryMocks = vi.hoisted(() => ({
  usePermissions: vi.fn().mockReturnValue({ data: { create_image: false } }),
  useQueryWithPermissions: vi.fn().mockReturnValue({}),
  useIsResourceRestricted: vi.fn().mockReturnValue(false),
  useLinodesPermissionsCheck: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));

vi.mock('src/hooks/useIsResourceRestricted', () => ({
  useIsResourceRestricted: queryMocks.useIsResourceRestricted,
}));

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
  it('should render images landing table with items', async () => {
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

    const { getAllByText, queryByTestId } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    const loadingElement = queryByTestId(loadingTestId);

    await waitForElementToBeRemoved(loadingElement);

    // Two tables should render
    getAllByText('Custom Images');
    getAllByText('Recovery Images');

    // Static text and table column headers
    expect(getAllByText('Image').length).toBe(2);
    expect(getAllByText('Status').length).toBe(2);
    expect(getAllByText('Replicated in').length).toBe(1);
    expect(getAllByText('Original Image').length).toBe(1);
    expect(getAllByText('All Replicas').length).toBe(1);
    expect(getAllByText('Created').length).toBe(2);
    expect(getAllByText('Image ID').length).toBe(1);
  });

  it('should render custom images empty state', async () => {
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

    const { findByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(await findByText('No Custom Images to display.')).toBeVisible();
  });

  it('should render automatic images empty state', async () => {
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

    const { findByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(await findByText('No Recovery Images to display.')).toBeVisible();
  });

  it('should render images landing empty state', async () => {
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    expect(
      getByText((text) => text.includes('Store custom Linux images'))
    ).toBeVisible();
  });

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
      <ImagesLanding />,
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
      <ImagesLanding />,
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
    queryMocks.usePermissions.mockReturnValue({
      data: { create_image: true },
    });
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
      renderWithTheme(<ImagesLanding />, { initialRoute: '/images' });

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
      <ImagesLanding />,
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

  it('disables the create button if the user does not have permission to create images', async () => {
    queryMocks.usePermissions.mockReturnValue({
      data: { create_image: false },
    });
    const images = imageFactory.buildList(3);

    server.use(
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    const loadingElement = queryByTestId(loadingTestId);
    await waitForElementToBeRemoved(loadingElement);

    const createImageButton = getByText('Create Image').closest('button');

    expect(createImageButton).toBeDisabled();
    expect(createImageButton).toHaveAttribute(
      'data-qa-tooltip',
      "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
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
    queryMocks.useIsResourceRestricted.mockReturnValue(true);
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

    const { findByLabelText } = renderWithTheme(<ImagesLanding />, {
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
    const disabledLinodeRebuildingText = await findByLabelText(
      "You don't have permissions to rebuild Linodes. Please contact your account administrator to request the necessary permissions."
    );

    expect(disabledEditText).toBeVisible();
    expect(disabledDeleteText).toBeVisible();
    expect(disabledLinodeCreationText).toBeVisible();
    expect(disabledLinodeRebuildingText).toBeVisible();
  });
});
