import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { ipAddressFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditIPRDNSDrawer } from './EditIPRDNSDrawer';

const props = {
  ip: ipAddressFactory.build({ rdns: '' }),
  onClose: vi.fn(),
  open: true,
};

describe('EditIPRDNSDrawer', () => {
  it('renders the drawer correctly', () => {
    const { getAllByRole, getByText } = renderWithTheme(
      <EditIPRDNSDrawer {...props} />
    );

    // confirm drawer title and form fields render
    expect(getByText('Edit Reverse DNS')).toBeVisible();
    expect(getByText('Leave this field blank to reset RDNS')).toBeVisible();
    expect(getByText('Enter a domain name')).toBeVisible();

    // confirm buttons render
    expect(getAllByRole('button')).toHaveLength(3);
    expect(getByText('Cancel')).toBeVisible();
    expect(getByText('Save')).toBeVisible();
  });

  it('closes the drawer', () => {
    const { getByText } = renderWithTheme(<EditIPRDNSDrawer {...props} />);

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
