import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import * as React from 'react';

import { withDocumentTitleProvider } from 'src/components/DocumentTitle';
import { accountSettingsFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { longviewSubscriptionFactory } from 'src/factories/longviewSubscription';
import { profileFactory } from 'src/factories/profile';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  LongviewPlansProps,
  LONGVIEW_FREE_ID,
  LongviewPlans,
  formatPrice,
} from './LongviewPlans';

const mockLongviewSubscriptions = longviewSubscriptionFactory.buildList(4);

const props: LongviewPlansProps = {
  subscriptionRequestHook: {
    data: mockLongviewSubscriptions,
    lastUpdated: 0,
    loading: false,
    transformData: vi.fn(),
    update: vi.fn(),
  },
};

const testRow = async (
  id: string,
  label: string,
  clients: string,
  dataRetention: string,
  dataResolution: string,
  price: string
) => {
  within(await screen.findByTestId(`plan-cell-${id}`)).getByText(label);
  within(await screen.findByTestId(`clients-cell-${id}`)).getByText(
    String(clients)
  );
  within(await screen.findByTestId(`data-retention-cell-${id}`)).getByText(
    dataRetention
  );
  within(await screen.findByTestId(`data-resolution-cell-${id}`)).getByText(
    dataResolution
  );
  within(await screen.findByTestId(`price-cell-${id}`)).getByText(price);
};

describe('LongviewPlans', () => {
  beforeEach(() => {
    server.use(
      rest.get('*/account/settings', (req, res, ctx) => {
        return res(ctx.json(accountSettingsFactory.build({ managed: false })));
      })
    );
  });

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

    await testRow(
      LONGVIEW_FREE_ID,
      'Longview Free',
      '10',
      'Limited to 12 hours',
      'Every 5 minutes',
      'FREE'
    );

    // We can't execute `testRow()` concurrently because it leads to concurrent
    // calls to `act()`, which can lead to undefined behavior.
    for (let i = 0; i < mockLongviewSubscriptions.length; i += 1) {
      const sub = mockLongviewSubscriptions[i];
      // eslint-disable-next-line no-await-in-loop
      await testRow(
        sub.id,
        sub.label,
        String(sub.clients_included),
        'Unlimited',
        'Every minute',
        formatPrice(sub.price)
      );
    }
  });

  it('highlights the LV subscription currently on the account', async () => {
    const { findByTestId } = renderWithTheme(<LongviewPlans {...props} />);

    expect(await findByTestId('current-plan-longview-3'));
  });

  it('displays a notice if the user does not have permissions to modify', async () => {
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

    renderWithTheme(<LongviewPlans {...props} />);

    await waitForElementToBeRemoved(screen.getByTestId('loading'), {
      timeout: 5000,
    });

    screen.getByText(/don't have permission/gi);
  });

  it('displays a message id the account is managed', async () => {
    server.use(
      rest.get('*/account/settings', (req, res, ctx) => {
        return res(ctx.json(accountSettingsFactory.build({ managed: true })));
      })
    );

    const { findByText } = renderWithTheme(<LongviewPlans {...props} />);

    expect(
      await findByText((str) =>
        str.includes('Longview Pro is included with Linode Managed.')
      )
    );
  });
});
