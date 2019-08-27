import { cleanup, render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import BillingSection from './BillingSection';

const renderComponent = (props: any) => {
  return render(wrapWithTheme(<BillingSection {...props} />));
};

afterEach(cleanup);

describe('BillingSection component', () => {
  it('should display a header when given', () => {
    const { queryAllByText } = renderComponent({
      balance: 10.0,
      header: 'This Section'
    });
    expect(queryAllByText('This Section')).toHaveLength(1);
  });

  it('should render balance due as a positive number', () => {
    const { queryAllByText } = renderComponent({ balance: 10.0 });
    expect(queryAllByText('$10.00')).toHaveLength(1);
  });

  it('should show a negative balance as a credit (parenthesized positive number) if the balance is negative', () => {
    const { queryAllByText } = renderComponent({
      balance: -10.0,
      showNegativeAsCredit: true
    });
    expect(queryAllByText('($10.00)')).toHaveLength(1);
  });

  it('should display a positive credit in parentheses', () => {
    const { queryAllByText } = renderComponent({ credit: 10.0 });
    expect(queryAllByText('($10.00)')).toHaveLength(1);
  });
});
