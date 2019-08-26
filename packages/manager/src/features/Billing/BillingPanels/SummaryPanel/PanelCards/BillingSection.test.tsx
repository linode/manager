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
    expect(queryAllByText('(credit)')).toHaveLength(0);
  });

  it('should append (credit) to the balance if the balance is negative and showNegativeAsCredit is true', () => {
    const { queryAllByText } = renderComponent({
      balance: -10.0,
      showNegativeAsCredit: true
    });
    expect(queryAllByText('-$10.00 (credit)')).toHaveLength(1);
  });

  it('should display a positive credit in parenthesis', () => {
    const { queryAllByText } = renderComponent({ credit: 10.0 });
    expect(queryAllByText('($10.00)')).toHaveLength(1);
    expect(queryAllByText('(credit)')).toHaveLength(0);
  });

  it('should not append (credit) to credit values regardless of the value of showNegativeAsCredit', () => {
    const { queryAllByText } = renderComponent({
      credit: 10.0,
      showNegativeAsCredit: true
    });
    expect(queryAllByText('(credit)')).toHaveLength(0);
  });
});
