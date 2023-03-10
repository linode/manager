import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import UserDataAccordion from 'src/features/linodes/UserDataAccordion';

describe('UserDataAccordion', () => {
  it('should NOT have a notice when a renderNotice prop is not passed in', () => {
    const { queryByTestId } = renderWithTheme(
      <UserDataAccordion userData={''} onChange={() => null} />
    );

    expect(queryByTestId('render-notice')).toBeNull();
  });
});
