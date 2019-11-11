import { cleanup, waitForDomChange, within } from '@testing-library/react';
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

const mockLongviewSubscriptions = longviewSubscriptionFactory.buildList(4);

afterEach(cleanup);

const props: CombinedProps = {
  accountSettingsError: {},
  accountSettingsLastUpdated: 0,
  accountSettingsLoading: false,
  requestAccountSettings: jest.fn(),
  updateAccountSettings: jest.fn(),
  updateAccountSettingsInStore: jest.fn(),
  mayUserModifyLVSubscription: true,
  mayUserViewAccountSettings: true,
  subscriptionRequestHook: {
    data: mockLongviewSubscriptions,
    lastUpdated: 0,
    update: jest.fn(),
    transformData: jest.fn(),
    loading: false
  }
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

    within(getByTestId(`lv-sub-table-row-${currentLVSub}`)).getByText(
      'Current Plan'
    );
  });

  it('displays a notice if the user does not have permissions to modify', () => {
    const { getByText } = renderWithTheme(
      <LongviewPlans {...props} mayUserModifyLVSubscription={false} />
    );
    getByText(/don't have permission/gi);
  });
});
