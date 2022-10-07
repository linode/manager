import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import * as React from 'react';
import { withDocumentTitleProvider } from 'src/components/DocumentTitle';
import { accountSettingsFactory } from 'src/factories';
import { longviewSubscriptionFactory } from 'src/factories/longviewSubscription';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  CombinedProps,
  formatPrice,
  LONGVIEW_FREE_ID,
  LongviewPlans,
} from './LongviewPlans';
import { rest, server } from 'src/mocks/testServer';
import { profileFactory } from 'src/factories/profile';
import { grantsFactory } from 'src/factories/grants';
import { QueryClient } from 'react-query';
import { queryPresets } from 'src/queries/base';

const mockLongviewSubscriptions = longviewSubscriptionFactory.buildList(4);

const queryClient = new QueryClient({
  defaultOptions: { queries: queryPresets.oneTimeFetch },
});

afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});
afterAll(() => server.close());

const props: CombinedProps = {
  subscriptionRequestHook: {
    data: mockLongviewSubscriptions,
    lastUpdated: 0,
    update: jest.fn(),
    transformData: jest.fn(),
    loading: false,
  },
};

const testRow = (
  id: string,
  label: string,
  clients: string,
  dataRetention: string,
  dataResolution: string,
  price: string
) => {
  within(screen.getByTestId(`plan-cell-${id}`)).getByText(label);
  within(screen.getByTestId(`clients-cell-${id}`)).getByText(String(clients));
  within(screen.getByTestId(`data-retention-cell-${id}`)).getByText(
    dataRetention
  );
  within(screen.getByTestId(`data-resolution-cell-${id}`)).getByText(
    dataResolution
  );
  within(screen.getByTestId(`price-cell-${id}`)).getByText(price);
};

server.use(
  rest.get('*/account/settings', (req, res, ctx) => {
    return res(ctx.json(accountSettingsFactory.build({ managed: false })));
  })
);

describe('LongviewPlans', () => {
  it('sets the document title to "Plan Details"', async () => {
    const WrappedComponent = withDocumentTitleProvider(LongviewPlans);

    renderWithTheme(<WrappedComponent {...props} />);

    await waitForElementToBeRemoved(screen.getByTestId('loading'), {
      timeout: 5000,
    });

    expect(document.title).toMatch(/^Plan Details/);
  });

  it('renders all columns for all plan types', async () => {
    renderWithTheme(<LongviewPlans {...props} />);

    testRow(
      LONGVIEW_FREE_ID,
      'Longview Free',
      '10',
      'Limited to 12 hours',
      'Every 5 minutes',
      'FREE'
    );

    mockLongviewSubscriptions.forEach((sub) => {
      testRow(
        sub.id,
        sub.label,
        String(sub.clients_included),
        'Unlimited',
        'Every minute',
        formatPrice(sub.price)
      );
    });
  });

  it('highlights the LV subscription currently on the account', async () => {
    renderWithTheme(<LongviewPlans {...props} />);

    await screen.findByTestId('current-plan-longview-3');
  });

  it('displays a notice if the user does not have permissions to modify', async () => {
    server.use(
      rest.get('*/account/settings', (req, res, ctx) => {
        return res(
          ctx.json(
            accountSettingsFactory.build({
              managed: false,
            })
          )
        );
      })
    );

    // Build a restricted user's profile so we get a permission error
    server.use(
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(
            profileFactory.build({
              restricted: true,
            })
          )
        );
      })
    );

    server.use(
      rest.get('*/grants', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json(
            grantsFactory.build({
              global: {
                account_access: 'read_only',
                longview_subscription: false,
              },
            })
          )
        );
      })
    );

    renderWithTheme(<LongviewPlans {...props} />, {
      queryClient,
    });

    await waitForElementToBeRemoved(screen.getByTestId('loading'), {
      timeout: 5000,
    });

    screen.getByText(/don't have permission/gi);
  });
});
