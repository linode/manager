import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import {
  SSHAccessActionMenu,
  SSHAccessActionMenuProps,
} from './SSHAccessActionMenu';

const mockOpenDrawer = vi.fn();

const props: SSHAccessActionMenuProps = {
  isEnabled: true,
  linodeId: 1,
  linodeLabel: 'label',
  openDrawer: mockOpenDrawer,
};

describe('SSH Access Action Menu', () => {
  it('should include basic actions', async () => {
    const { getByText } = renderWithTheme(<SSHAccessActionMenu {...props} />);

    expect(getByText('Edit')).toBeVisible();
    expect(getByText('Disable')).toBeVisible();
  });

  it('should include Enable if access to the Linode is disabled', () => {
    const { queryByText } = renderWithTheme(
      <SSHAccessActionMenu {...props} isEnabled={false} />
    );
    expect(queryByText('Enable')).toBeInTheDocument();
    expect(queryByText('Disable')).not.toBeInTheDocument();
  });

  it('should include Disable if access to the Linode is enabled', () => {
    const { queryByText } = renderWithTheme(
      wrapWithTheme(<SSHAccessActionMenu {...props} isEnabled={true} />)
    );
    expect(queryByText('Disable')).toBeInTheDocument();
    expect(queryByText('Enable')).not.toBeInTheDocument();
  });

  it('should open the drawer when "Edit" option is clicked', () => {
    const { getByText } = renderWithTheme(
      wrapWithTheme(<SSHAccessActionMenu {...props} />)
    );
    fireEvent.click(getByText('Edit'));
    expect(mockOpenDrawer).toHaveBeenCalledWith(1);
  });
});
