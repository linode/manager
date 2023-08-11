import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { serviceTargetFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import ServiceTargetLanding from './ServiceTargetLanding';
import { ServiceTargetRow } from './ServiceTargetRow';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const props = {
  onDelete: jest.fn(),
};

const ERROR_STATE_TEST_ID = 'error-state';
const LOADING_TEST_ID = 'circle-progress';

describe('Service Target Landing Page', () => {
  it('should render service target landing with empty state', async () => {
    server.use(
      rest.get('*/aglb/service-targets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const { getByTestId, getByRole } = renderWithTheme(
      <ServiceTargetLanding />,
      {
        queryClient,
      }
    );

    await waitForElementToBeRemoved(getByTestId(LOADING_TEST_ID));

    // Check that empty table exists in document
    expect(getByRole('table')).toBeInTheDocument();
  });

  // TODO - AGLB: revisit this in M3-6882 when finishing tests, it's timing out
  it.skip('should render service target landing with error state if there is an error fetching service targets', async () => {
    // Mock an API error response
    server.use(
      rest.get('*/aglb/service-targets', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({}));
      })
    );

    const { getByTestId } = renderWithTheme(<ServiceTargetLanding />, {
      queryClient,
    });

    await waitForElementToBeRemoved(getByTestId(LOADING_TEST_ID));
    expect(getByTestId(ERROR_STATE_TEST_ID)).toBeInTheDocument();
  });
});

describe('Service Target Table', () => {
  it('should render service target landing table with items', async () => {
    server.use(
      rest.get('*/aglb/service-targets', (req, res, ctx) => {
        const serviceTargets = serviceTargetFactory.buildList(1, {
          label: 'my-service-target',
        });
        return res(ctx.json(makeResourcePage(serviceTargets)));
      })
    );

    const {
      getAllByText,
      getByTestId,
      queryAllByText,
    } = renderWithTheme(<ServiceTargetLanding />, { queryClient });

    // Loading state should render
    expect(getByTestId(LOADING_TEST_ID)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(LOADING_TEST_ID));

    // Check for all table column headers
    getAllByText('Label');
    // getAllByText('Endpoints'); //TODO: ALGB - follow up in M3-6882, uncomment if included in Beta
    getAllByText('Load Balancing Algorithm');
    getAllByText('Health Checks');

    // Check to see if the mocked API data rendered in the table
    queryAllByText('my-service-target');
  });
});

describe('Service Target Table Row', () => {
  it('should render a service target row', () => {
    const serviceTarget = serviceTargetFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<ServiceTargetRow {...props} {...serviceTarget} />),
      { queryClient }
    );

    // Check to see if the row rendered data
    getByText(serviceTarget.label);
    getByText('round robin');
    // TODO: AGLB -follow up in M3-6882
  });
});
