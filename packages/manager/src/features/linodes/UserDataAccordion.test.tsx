import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import UserDataAccordion from 'src/features/linodes/UserDataAccordion';

describe('UserDataAccordion', () => {
  it('should have a notice recommending new user data be used when a Linode is being rebuilt', () => {
    const { getByText } = renderWithTheme(
      <UserDataAccordion
        userData={''}
        onChange={() => null}
        flowSource="rebuild"
      />
    );

    expect(
      getByText(
        'Adding new user data is recommended as part of the rebuild process.'
      )
    ).toBeInTheDocument();
  });

  it('should NOT have a notice recommending new user data be used if a Linode is not being rebuilt', () => {
    const { queryByText } = renderWithTheme(
      <UserDataAccordion userData={''} onChange={() => null} />
    );

    expect(
      queryByText(
        'Adding new user data is recommended as part of the rebuild process.'
      )
    ).not.toBeInTheDocument();
  });
});
