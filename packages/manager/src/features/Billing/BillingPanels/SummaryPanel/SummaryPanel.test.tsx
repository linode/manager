import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { activePromotions } from 'src/__data__/account';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { CombinedProps, SummaryPanel } from './SummaryPanel';

describe('SummaryPanel', () => {
  const baseProps: CombinedProps = {
    accountLoading: false,
    lastUpdated: 10,
    username: 'helloworld',
    profileError: undefined,
    profileLoading: false,
    isRestricted: false,
    data: {
      company: '',
      first_name: '',
      last_name: '',
      email: '',
      address_1: '',
      address_2: '',
      phone: '',
      city: '',
      state: '',
      zip: '',
      credit_card: { expiry: '02/2012', last_four: '1234' },
      tax_id: '',
      country: '',
      balance: 0,
      balance_uninvoiced: 0,
      active_since: '2018-05-17T18:22:50',
      active_promotions: activePromotions
      // [BETA]
      // @todo: Uncomment this when it becomes generally available
      // capabilities: ['Linodes', 'NodeBalancers', 'Block Storage']
    }
  };

  afterEach(cleanup);

  it('should render "Expired" text next to the CC expiration if has an old date', () => {
    const expired = render(wrapWithTheme(<SummaryPanel {...baseProps} />));
    expect(expired.getByText(/Expired/));
  });

  it('should not render "Expired" text next to the CC expiration if has an future date', () => {
    const valid = render(
      wrapWithTheme(
        <SummaryPanel
          {...baseProps}
          data={{
            ...baseProps.data!,
            credit_card: {
              ...baseProps.data!.credit_card,
              expiry: '02/4000'
            }
          }}
        />
      )
    );

    expect(valid.queryByText(/Expired/)).toBeFalsy();
  });
});
