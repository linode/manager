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

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('AddNodeBalancerDrawer', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({ id: '1' });
  });

  it('should contain helper text', () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText(helperText)).toBeInTheDocument();
  });

  it('should contain a NodeBalancers label', () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText('NodeBalancers')).toBeInTheDocument();
  });

  it('should contain a Nodebalancer input dropdown', () => {
    const { getByTestId } = renderWithTheme(
      <AddNodebalancerDrawer {...props} />
    );
    expect(getByTestId('add-nodebalancer-autocomplete')).toBeInTheDocument();
  });

  it('should contain an Add button', () => {
    const { getByText } = renderWithTheme(<AddNodebalancerDrawer {...props} />);
    expect(getByText('Add')).toBeInTheDocument();
  });
});
