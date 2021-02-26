import { screen, within } from '@testing-library/react';
import * as React from 'react';
import { accountSettings } from 'src/__data__/account';
import { withDocumentTitleProvider } from 'src/components/DocumentTitle';
import { longviewSubscriptionFactory } from 'src/factories/longviewSubscription';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  CombinedProps,
  formatPrice,
  LONGVIEW_FREE_ID,
  LongviewPlans,
} from './LongviewPlans';

const mockLongviewSubscriptions = longviewSubscriptionFactory.buildList(4);

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

describe('LongviewPlans', () => {
  it('sets the document title to "Plan Details"', async () => {
    const WrappedComponent = withDocumentTitleProvider(LongviewPlans);
    renderWithTheme(<WrappedComponent {...props} />);
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
    renderWithTheme(
      <LongviewPlans accountSettings={accountSettings} {...props} />
    );

    await screen.findByTestId('current-plan-longview-3');
  });

  it('displays a notice if the user does not have permissions to modify', () => {
    const { getByText } = renderWithTheme(
      <LongviewPlans {...props} mayUserModifyLVSubscription={false} />
    );
    getByText(/don't have permission/gi);
  });
});
