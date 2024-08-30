import React from 'react';

import { accountUserFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDetailsPanel } from './UserDetailsPanel';

describe('UserDetailsPanel', () => {
  it('shows username and email', async () => {
    const user = accountUserFactory.build();

    const { findByText } = renderWithTheme(<UserDetailsPanel user={user} />);

    await findByText(user.username);
    await findByText(user.email);
  });
});
