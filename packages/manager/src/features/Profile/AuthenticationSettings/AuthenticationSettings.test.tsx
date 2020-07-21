import { cleanup, render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  AuthenticationSettings,
  CombinedProps
} from './AuthenticationSettings';

afterEach(cleanup);

const WHITELIST = 'whitelisting-form';

const props: CombinedProps = {
  loading: false,
  authType: 'password',
  ipWhitelisting: true,
  twoFactor: true,
  username: 'username',
  updateProfile: jest.fn()
};

describe('Authentication settings profile tab', () => {
  it('should render', () => {
    const { getByTestId } = render(
      wrapWithTheme(<AuthenticationSettings {...props} />)
    );
    expect(getByTestId('authSettings'));
  });

  it('should not render the whitelisting form when loading', () => {
    const { getByTestId, queryAllByTestId, rerender } = render(
      wrapWithTheme(<AuthenticationSettings {...props} />)
    );
    getByTestId(WHITELIST);
    rerender(
      wrapWithTheme(<AuthenticationSettings {...props} loading={true} />)
    );
    expect(queryAllByTestId(WHITELIST)).toHaveLength(0);
  });

  it('should not render the whitelisting form if the user does not have this setting enabled', () => {
    const { getByTestId, queryAllByTestId, rerender } = render(
      wrapWithTheme(<AuthenticationSettings {...props} />)
    );
    getByTestId(WHITELIST);
    rerender(
      wrapWithTheme(
        <AuthenticationSettings {...props} ipWhitelisting={false} />
      )
    );
    expect(queryAllByTestId(WHITELIST)).toHaveLength(0);
  });
});
