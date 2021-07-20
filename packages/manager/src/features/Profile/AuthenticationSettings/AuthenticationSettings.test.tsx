import { render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { AuthenticationSettings } from './AuthenticationSettings';

const ALLOWLIST = 'allowlisting-form';

describe('Authentication settings profile tab', () => {
  it('should render', async () => {
    const { findByTestId } = render(wrapWithTheme(<AuthenticationSettings />));
    expect(await findByTestId('authSettings')).toBeInTheDocument();
  });

  it('should not render the allowlisting form when loading', () => {
    const { getByTestId, queryAllByTestId, rerender } = render(
      wrapWithTheme(<AuthenticationSettings />)
    );
    getByTestId(ALLOWLIST);
    rerender(wrapWithTheme(<AuthenticationSettings />));
    expect(queryAllByTestId(ALLOWLIST)).toHaveLength(0);
  });

  it('should not render the allowlisting form if the user does not have this setting enabled', async () => {
    const { findByTestId, queryAllByTestId, rerender } = render(
      wrapWithTheme(<AuthenticationSettings />)
    );
    await findByTestId(ALLOWLIST);
    rerender(wrapWithTheme(<AuthenticationSettings />));
    expect(queryAllByTestId(ALLOWLIST)).toHaveLength(0);
  });
});
