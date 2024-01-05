import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SwitchAccountDrawer } from './SwitchAccountDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
  username: 'mock-user',
};

describe('SwitchAccountDrawer', () => {
  it('should have a title', () => {
    const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
    expect(getByText('Switch Account')).toBeInTheDocument();
  });

  it('should display helper text about the accounts', () => {
    const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
    expect(
      getByText(
        'Select an account to view and manage its settings and configurations',
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it('should include a link to switch back to the parent account if the active user is a proxy user', () => {
    // const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
  });

  it('should display a list of child accounts', () => {
    // const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
  });

  it('should display a notice if there are zero child accounts', () => {
    // const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
  });

  it('should display an error if child accounts could not be fetched', () => {
    // const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
  });

  it('should close when the close icon is clicked', () => {
    // const { getByText } = renderWithTheme(<SwitchAccountDrawer {...props} />);
  });
});
