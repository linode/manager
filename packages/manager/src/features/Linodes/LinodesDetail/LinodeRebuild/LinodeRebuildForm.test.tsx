import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeRebuildForm } from './LinodeRebuildForm';

describe('LinodeRebuildForm', () => {
  it('renders a notice reccomending users add user data when the Linode already uses user data', () => {
    const linode = linodeFactory.build({ has_user_data: true });

    const { getByText } = renderWithTheme(
      <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
    );

    expect(
      getByText(
        'Adding new user data is recommended as part of the rebuild process.'
      )
    ).toBeVisible();
  });

  it('disables the "reuse existing user data" checkbox if the Linode does not have existing user data', async () => {
    const linode = linodeFactory.build({ has_user_data: false });

    const { getByText, getByLabelText, queryByText } = renderWithTheme(
      <LinodeRebuildForm linode={linode} onSuccess={vi.fn()} />
    );

    // Open the "Add User Data" accordion
    await userEvent.click(getByText('Add User Data'));

    // Verify the reccomendation is not present because the Linode does not use metadata currently
    expect(
      queryByText(
        'Adding new user data is recommended as part of the rebuild process.'
      )
    ).toBeNull();

    const checkbox = getByLabelText(
      `Reuse user data previously provided for ${linode.label}`
    );

    expect(checkbox).toBeDisabled();

    expect(
      getByLabelText('This Linode does not have existing user data.')
    ).toBeVisible();
  });
});
