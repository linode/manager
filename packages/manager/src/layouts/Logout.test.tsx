import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Logout } from './Logout';

describe('Logout', () => {
  it('dispatches logout action on componentDidMount', () => {
    const props = {
      dispatchLogout: vi.fn(),
      token: '',
    };

    renderWithTheme(<Logout {...props} />);

    expect(props.dispatchLogout).toHaveBeenCalled();
  });
});
