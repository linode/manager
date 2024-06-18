import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import ImagesLanding from './ImagesLanding';

const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
};

// Mock useHistory
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
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

    const { getAllByText, getByTestId } = renderWithTheme(<ImagesLanding />);

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Two tables should render
    getAllByText('Custom Images');
    getAllByText('Recovery Images');

    // Static text and table column headers
    expect(getAllByText('Image').length).toBe(2);
    expect(getAllByText('Status').length).toBe(2);
    expect(getAllByText('Region(s)').length).toBe(1);
    expect(getAllByText('Compatibility').length).toBe(1);
    expect(getAllByText('Size').length).toBe(2);
    expect(getAllByText('Total Size').length).toBe(1);
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

    const { getByTestId, getByText } = renderWithTheme(<ImagesLanding />);

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
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

    const { getByTestId, getByText } = renderWithTheme(<ImagesLanding />);

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    expect(getByText('No Recovery Images to display.')).toBeInTheDocument();
  });

  it('should render images landing empty state', async () => {
    server.use(
      http.get('*/images', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<ImagesLanding />);

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    expect(
      getByText((text) => text.includes('Store your own custom Linux images'))
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

    const { getAllByLabelText, getByTestId, getByText } = renderWithTheme(
      <ImagesLanding />
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Open action menu
    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];
    await userEvent.click(actionMenu);

    await userEvent.click(getByText('Edit'));

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

    const { getAllByLabelText, getByTestId, getByText } = renderWithTheme(
      <ImagesLanding />
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Open action menu
    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];
    await userEvent.click(actionMenu);

    await userEvent.click(getByText('Rebuild an Existing Linode'));

    getByText('Restore from Image');
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

    const { getAllByLabelText, getByTestId, getByText } = renderWithTheme(
      <ImagesLanding />
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Open action menu
    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];
    await userEvent.click(actionMenu);

    await userEvent.click(getByText('Deploy to New Linode'));
    expect(mockHistory.push).toBeCalledWith({
      pathname: '/linodes/create/',
      search: `?type=Images&imageID=${images[0].id}`,
      state: { selectedImageId: images[0].id },
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

    const { getAllByLabelText, getByTestId, getByText } = renderWithTheme(
      <ImagesLanding />
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Open action menu
    const actionMenu = getAllByLabelText(
      `Action menu for Image ${images[0].label}`
    )[0];
    await userEvent.click(actionMenu);

    await userEvent.click(getByText('Delete'));

    getByText(`Delete Image ${images[0].label}`);
  });
});
