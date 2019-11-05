import { cleanup, waitForDomChange } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { baseRequest } from 'linode-js-sdk/lib/request';
import * as React from 'react';
import { withDocumentTitleProvider } from 'src/components/DocumentTitle';
import { longviewSubscriptionFactory } from 'src/factories/longviewSubscription';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, LongviewPlans } from './LongviewPlans';

const mockApi = new MockAdapter(baseRequest);

mockApi.onGet('/longview/subscriptions').reply(200, {
  data: longviewSubscriptionFactory.buildList(4)
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
});
