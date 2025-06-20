import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { HistoryDialog } from './HistoryDialog';

const props = {
  linodeId: 1,
  onClose: vi.fn(),
  open: true,
};

describe('LinodeInterfacesHistoryDialog', () => {
  it('renders the LinodeInterfaceHistoryDialog', () => {
    const { getByText } = renderWithTheme(<HistoryDialog {...props} />);

    expect(getByText('Network Interfaces History')).toBeVisible();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Interface ID')).toBeVisible();
    expect(getByText('Linode ID')).toBeVisible();
    expect(getByText('Event ID')).toBeVisible();
    expect(getByText('Version')).toBeVisible();
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Close')).toBeVisible();
  });

  it('closes the drawer', async () => {
    const { getByText } = renderWithTheme(<HistoryDialog {...props} />);

    const closeButton = getByText('Close');
    await userEvent.click(closeButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
