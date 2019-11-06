import {
  cleanup,
  waitForDomChange,
  waitForElementToBeRemoved,
  within
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { baseRequest } from 'linode-js-sdk/lib/request';
import * as React from 'react';
import { accountSettings } from 'src/__data__/account';
import { withDocumentTitleProvider } from 'src/components/DocumentTitle';
import { longviewSubscriptionFactory } from 'src/factories/longviewSubscription';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  CombinedProps,
  formatPrice,
  LONGVIEW_FREE_ID,
  LongviewPlans
} from './LongviewPlans';

const mockApi = new MockAdapter(baseRequest);

const mockLongviewSubscriptions = longviewSubscriptionFactory.buildList(4);

mockApi.onGet('/longview/subscriptions').reply(200, {
  data: mockLongviewSubscriptions
});

afterEach(cleanup);

const props: CombinedProps = {
  accountSettingsError: {},
  accountSettingsLastUpdated: 0,
  accountSettingsLoading: false,
  requestAccountSettings: jest.fn(),
  updateAccountSettings: jest.fn(),
  updateAccountSettingsInStore: jest.fn()
};

describe('LongviewPlans', () => {
  it('sets the document title to "Plan Details"', async () => {
    const WrappedComponent = withDocumentTitleProvider(LongviewPlans);
    renderWithTheme(<WrappedComponent {...props} />);
    await waitForDomChange();
    expect(document.title).toMatch(/^Plan Details/);
  });

  it('renders all columns for all plan types', async () => {
    const { getByTestId } = renderWithTheme(<LongviewPlans {...props} />);

    const testRow = (
      id: string,
      label: string,
      clients: string,
      dataRetention: string,
      dataResolution: string,
      price: string
    ) => {
      within(getByTestId(`plan-cell-${id}`)).getByText(label);
      within(getByTestId(`clients-cell-${id}`)).getByText(String(clients));
      within(getByTestId(`data-retention-cell-${id}`)).getByText(dataRetention);
      within(getByTestId(`data-resolution-cell-${id}`)).getByText(
        dataResolution
      );
      within(getByTestId(`price-cell-${id}`)).getByText(price);
    };

    // Wait for data to resolve
    await waitForElementToBeRemoved(() => getByTestId('table-row-loading'));

    testRow(
      LONGVIEW_FREE_ID,
      'Longview Free',
      '10',
      'Limited to 12 hours',
      'Every 5 minutes',
      'FREE'
    );

    mockLongviewSubscriptions.forEach(sub => {
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
    const currentLVSub = 'longview-3';

    const { getByTestId } = renderWithTheme(
      <LongviewPlans
        accountSettings={{
          ...accountSettings,
          longview_subscription: currentLVSub
        }}
        {...props}
      />
    );
    // Wait for data to resolve
    await waitForElementToBeRemoved(() => getByTestId('table-row-loading'));

    within(getByTestId(`lv-sub-table-row-${currentLVSub}`)).getByText(
      'Current Plan'
    );
  });
});
