import { fireEvent } from '@testing-library/react';
import React from 'react';

import { accountUserFactory, profileFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DeleteUserPanel } from './DeleteUserPanel';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile/profile', async () => {
  const actual = await vi.importActual('src/queries/profile/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('DeleteUserPanel', () => {
  it('should disable the delete button for proxy user', () => {
    const user = accountUserFactory.build({
      user_type: 'proxy',
      username: 'current_user',
    });

    const { getByTestId } = renderWithTheme(<DeleteUserPanel user={user} />);

    const deleteButton = getByTestId('button');
    expect(deleteButton).toBeDisabled();
  });

  it('should disable the delete button for the current user', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    const user = accountUserFactory.build({
      user_type: 'default',
      username: 'current_user',
    });

    const { getByTestId } = renderWithTheme(<DeleteUserPanel user={user} />);

    const deleteButton = getByTestId('button');
    expect(deleteButton).toBeDisabled();
  });

  it('should enable the delete button for deletable users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    const user = accountUserFactory.build({
      user_type: 'default',
      username: 'user',
    });

    const { getByTestId } = renderWithTheme(<DeleteUserPanel user={user} />);

    const deleteButton = getByTestId('button');
    expect(deleteButton).toBeEnabled();
  });

  it('should open the delete confirmation dialog when the delete button is clicked', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'current_user' }),
    });

    const user = accountUserFactory.build({
      user_type: 'default',
      username: 'user',
    });

    const { getByTestId, getByText } = renderWithTheme(
      <DeleteUserPanel user={user} />
    );

    const deleteButton = getByTestId('button');
    fireEvent.click(deleteButton);

    expect(
      getByText('The user will be deleted permanently.')
    ).toBeInTheDocument();
  });
});
