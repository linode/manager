import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddNodebalancerDrawer } from './AddNodebalancerDrawer';

const helperText = 'helper text';
const onClose = vi.fn();

const props = {
  helperText,
  onClose,
  open: true,
};

describe('AddNodeBalancerDrawer', () => {
  it(`should contain helper text`, () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText(helperText)).toBeInTheDocument();
  });

  it(`should contain a NodeBalancers label`, () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText('NodeBalancers')).toBeInTheDocument();
  });

  it(`should contain a Nodebalancer input dropdown`, () => {
    const { getByTestId } = renderWithTheme(
      <AddNodebalancerDrawer {...props} />
    );
    expect(getByTestId('add-nodebalancer-autocomplete')).toBeInTheDocument();
  });

  it(`should contain an Add button`, () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText('Add')).toBeInTheDocument();
  });
});
