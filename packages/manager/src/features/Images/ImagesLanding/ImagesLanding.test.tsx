import { grantsFactory, profileFactory } from '@linode/utilities';
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import ImagesLanding from './ImagesLanding';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({ action: undefined, imageId: undefined }),
  useSearch: vi.fn().mockReturnValue({ query: undefined }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useHistory: vi.fn(() => mockHistory),
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

    const { getAllByText, queryByTestId } = await renderWithThemeAndRouter(
      <ImagesLanding />
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

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

    const { getByText, queryByTestId } = await renderWithThemeAndRouter(
      <ImagesLanding />
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    expect(getByText('No Custom Images to display.')).toBeInTheDocument();
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

    const { getByText, queryByTestId } = await renderWithThemeAndRouter(
      <ImagesLanding />
    );
    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    expect(getByText('No Recovery Images to display.')).toBeInTheDocument();
  });

  it('should render images landing empty state', async () => {
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, queryByTestId } = await renderWithThemeAndRouter(
      <ImagesLanding />
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    expect(
      getByText((text) => text.includes('Store custom Linux images'))
    ).toBeInTheDocument();
  });

  it('should allow opening the Edit Image drawer', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const {
      getAllByLabelText,
      getByTestId,
      getByText,
      queryByTestId,
      rerender,
    } = await renderWithThemeAndRouter(<ImagesLanding />);

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Edit'));

    queryMocks.useParams.mockReturnValue({ action: 'edit' });

    rerender(<ImagesLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText('Edit Image');
  });

  it('should allow opening the Restore Image drawer', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const {
      getAllByLabelText,
      getByTestId,
      getByText,
      queryByTestId,
      rerender,
    } = await renderWithThemeAndRouter(<ImagesLanding />);

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Rebuild an Existing Linode'));

    queryMocks.useParams.mockReturnValue({ action: 'rebuild' });

    rerender(<ImagesLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    await waitFor(() => {
      getByText('Rebuild an Existing Linode from an Image');
    });
  });

  it('should allow deploying to a new Linode', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { getAllByLabelText, getByText, queryByTestId } =
      await renderWithThemeAndRouter(<ImagesLanding />);

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Deploy to New Linode'));

    expect(mockHistory.push).toBeCalledWith({
      pathname: '/linodes/create/',
      search: `?type=Images&imageID=${images[0].id}`,
    });
  });

  it('should allow deleting an image', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const {
      getAllByLabelText,
      getByTestId,
      getByText,
      queryByTestId,
      rerender,
    } = await renderWithThemeAndRouter(<ImagesLanding />);

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];
    await userEvent.click(actionMenu);
    await userEvent.click(getByText('Delete'));

    queryMocks.useParams.mockReturnValue({ action: 'delete' });

    rerender(<ImagesLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    await waitFor(() => {
      getByText('Are you sure you want to delete this Image?');
    });
  });

  it('disables the create button if the user does not have permission to create images', async () => {
    const images = imageFactory.buildList(3, {
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });
    server.use(
      http.get('*/v4/profile', () => {
        const profile = profileFactory.build({ restricted: true });
        return HttpResponse.json(profile);
      }),
      http.get('*/v4/profile/grants', () => {
        const grants = grantsFactory.build({ global: { add_images: false } });
        return HttpResponse.json(grants);
      }),
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { getByText, queryByTestId } = await renderWithThemeAndRouter(
      <ImagesLanding />
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    const createImageButton = getByText('Create Image').closest('button');

    expect(createImageButton).toBeDisabled();
    expect(createImageButton).toHaveAttribute(
      'data-qa-tooltip',
      "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
    );
  });

  it('disables the action menu buttons if user does not have permissions to edit images', async () => {
    const images = imageFactory.buildList(1, {
      id: 'private/99999',
      label: 'vi-test-image',
      regions: [
        { region: 'us-east', status: 'available' },
        { region: 'us-southeast', status: 'pending' },
      ],
    });

    server.use(
      http.get('*/v4/profile', () => {
        const profile = profileFactory.build({ restricted: true });
        return HttpResponse.json(profile);
      }),
      http.get('*/v4/profile/grants', () => {
        const grants = grantsFactory.build({
          global: {
            add_linodes: false,
          },
          image: [
            {
              id: 99999,
              label: 'vi-test-image',
              permissions: 'read_only',
            },
          ],
        });
        return HttpResponse.json(grants);
      }),
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage(images));
      })
    );

    const { findAllByLabelText, getAllByLabelText, queryByTestId } =
      await renderWithThemeAndRouter(<ImagesLanding />);

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];

    await userEvent.click(actionMenu);

    const disabledEditText = await findAllByLabelText(
      "You don't have permissions to edit this Image. Please contact your account administrator to request the necessary permissions."
    );
    const disabledDeleteText = await findAllByLabelText(
      "You don't have permissions to delete this Image. Please contact your account administrator to request the necessary permissions."
    );
    const disabledLinodeCreationText = await findAllByLabelText(
      "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions."
    );
    const disabledLinodeRebuildingText = await findAllByLabelText(
      "You don't have permissions to rebuild Linodes. Please contact your account administrator to request the necessary permissions."
    );

    expect(disabledEditText.length).toBe(2);
    expect(disabledDeleteText.length).toBe(1);
    expect(disabledLinodeCreationText.length).toBe(1);
    expect(disabledLinodeRebuildingText.length).toBe(1);
  });
});
