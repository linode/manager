import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditRangeRDNSDrawer } from './EditRangeRDNSDrawer';

const props = {
  linodeId: 1,
  onClose: vi.fn(),
  open: true,
  range: undefined,
};

describe('EditRangeRDNSDrawer', () => {
  it('renders the drawer correctly', () => {
    const { getAllByRole, getByText } = renderWithTheme(
      <EditRangeRDNSDrawer {...props} />
    );

    // confirm drawer title and fields render
    expect(getByText('Edit Reverse DNS')).toBeVisible();
    expect(getByText('Enter an IPv6 address')).toBeVisible();
    expect(getByText('Enter a domain name')).toBeVisible();
    expect(getByText('Leave this field blank to reset RDNS')).toBeVisible();

    // confirm buttons render
    expect(getAllByRole('button')).toHaveLength(3);
    expect(getByText('Close')).toBeVisible();
    expect(getByText('Save')).toBeVisible();
  });

  it('closes the drawer', () => {
    const { getByText } = renderWithTheme(<EditRangeRDNSDrawer {...props} />);

    const cancelButton = getByText('Close');
    fireEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
