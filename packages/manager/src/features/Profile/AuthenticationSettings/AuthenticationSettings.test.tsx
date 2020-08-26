import { render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  AuthenticationSettings,
  CombinedProps
} from './AuthenticationSettings';

const ALLOWLIST = 'allowlisting-form';

const props: CombinedProps = {
  loading: false,
  authType: 'password',
  ipAllowlisting: true,
  twoFactor: true,
  username: 'username',
  updateProfile: jest.fn()
};

describe('Authentication settings profile tab', () => {
  it('should render', async () => {
    const { findByTestId } = render(
      wrapWithTheme(<AuthenticationSettings {...props} />)
    );
    expect(await findByTestId('authSettings')).toBeInTheDocument();
  });

  it('should not render the allowlisting form when loading', () => {
    const { getByTestId, queryAllByTestId, rerender } = render(
      wrapWithTheme(<AuthenticationSettings {...props} />)
    );
    getByTestId(ALLOWLIST);
    rerender(
      wrapWithTheme(<AuthenticationSettings {...props} loading={true} />)
    );
    expect(queryAllByTestId(ALLOWLIST)).toHaveLength(0);
  });

  it('should not render the allowlisting form if the user does not have this setting enabled', async () => {
    const { findByTestId, queryAllByTestId, rerender } = render(
      wrapWithTheme(<AuthenticationSettings {...props} />)
    );
    await findByTestId(ALLOWLIST);
    rerender(
      wrapWithTheme(
        <AuthenticationSettings {...props} ipAllowlisting={false} />
      )
    );
    expect(queryAllByTestId(ALLOWLIST)).toHaveLength(0);
  });
});
