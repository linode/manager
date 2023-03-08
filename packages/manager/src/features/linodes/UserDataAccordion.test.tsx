import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import UserDataAccordion from 'src/features/linodes/UserDataAccordion';

describe('UserDataAccordion', () => {
  it('should not have a notice when a renderNotice prop is not passed in', () => {
    const { getByTestId } = renderWithTheme(
      <UserDataAccordion userData={''} onChange={() => null} />
    );

    expect(getByTestId('render-notice')).not.toBeInTheDocument();
  });
});
