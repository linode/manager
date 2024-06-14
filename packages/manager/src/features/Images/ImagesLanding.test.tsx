import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import ImagesLanding from './ImagesLanding';

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';

describe('Images Landing Table', () => {
  it('should render images landing table with items', async () => {
    server.resetHandlers();
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
    expect(getAllByText('Image Id').length).toBe(1);
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
});
