import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import UserDataAccordion from 'src/features/linodes/UserDataAccordion';

describe('UserDataAccordion', () => {
  it('should have a notice recommending new user data be used when the renderNotice prop is passed in', () => {
    const { getByText } = renderWithTheme(
      <UserDataAccordion userData={''} onChange={() => null} renderNotice />
    );

    expect(
      getByText(
        'Adding new user data is recommended as part of the rebuild process.'
      )
    ).toBeInTheDocument();
  });

  it('should NOT have a notice recommending new user data be used when the renderNotice prop is not passed in', () => {
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
