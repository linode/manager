import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddLinodeDrawer } from './AddLinodeDrawer';

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

describe('AddLinodeDrawer', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({ id: '1' });
  });

  it('should contain helper text', () => {
    const { getByText } = renderWithTheme(<AddLinodeDrawer {...props} />);
    expect(getByText(helperText)).toBeInTheDocument();
  });

  it('should contain a Linodes label', () => {
    const { getByText } = renderWithTheme(<AddLinodeDrawer {...props} />);
    expect(getByText('Linodes')).toBeInTheDocument();
  });

  it('should contain a Linodes input dropdown', () => {
    const { getByTestId } = renderWithTheme(<AddLinodeDrawer {...props} />);
    expect(getByTestId('add-linode-autocomplete')).toBeInTheDocument();
  });

  it('should contain an Add button', () => {
    const { getByText } = renderWithTheme(<AddLinodeDrawer {...props} />);
    expect(getByText('Add')).toBeInTheDocument();
  });
});
