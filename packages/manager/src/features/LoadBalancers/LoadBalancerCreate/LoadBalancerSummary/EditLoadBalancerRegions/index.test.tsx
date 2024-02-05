import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditLoadBalancerRegions } from './index';

describe('EditLoadBalancerRegions', () => {
  it('renders without crashing', () => {
    const { getByText } = renderWithTheme(<EditLoadBalancerRegions />);

    expect(getByText('Regions')).toBeInTheDocument();
  });

  it('toggles edit drawer visibility on button click', () => {
    const { getByRole, getByText, queryByRole } = renderWithTheme(
      <EditLoadBalancerRegions />
    );

    const editButton = getByText('Edit');
    fireEvent.click(editButton);

    // Check if drawer opens
    expect(queryByRole('dialog')).toBeInTheDocument();

    // Check drawer heading.
    expect(getByRole('heading', { name: 'Edit Regions' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Regions' })).toBeInTheDocument();

    fireEvent.click(getByRole('button', { name: 'Cancel' }));

    // Check if drawer closes
    expect(queryByRole('dialog')).toBeNull();
  });
});
