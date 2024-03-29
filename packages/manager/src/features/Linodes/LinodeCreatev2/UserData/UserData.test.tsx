import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { UserData } from './UserData';

describe('Linode Create v2 UserData', () => {
  it('should display a warning message if the user data is not in an accepted format', () => {
    const inputValue = '#test-string';
    const { getByLabelText, getByText } = renderWithThemeAndHookFormContext({
      component: <UserData />,
    });

    const input = getByLabelText('User Data');
    fireEvent.change(input, { target: { value: inputValue } });
    fireEvent.blur(input); // triggers format check

    expect(
      getByText('The user data may be formatted incorrectly.')
    ).toBeInTheDocument();
  });

  it('should display a warning in the header for cloning', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <UserData />,
      options: {
        MemoryRouter: {
          initialEntries: [{ pathname: '/linodes/create?type=Clone+Linode' }],
        },
      },
    });

    expect(
      getByText(
        'Existing user data is not cloned. You may add new user data now.'
      )
    ).toBeVisible();
  });

  it('should display a warning in the header for creating from a Linode backup', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <UserData />,
      options: {
        MemoryRouter: {
          initialEntries: [{ pathname: '/linodes/create?type=Backups' }],
        },
      },
    });

    expect(
      getByText(
        'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.'
      )
    ).toBeVisible();
  });
});
