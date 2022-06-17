import { render } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';
import { profileFactory } from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { queryPresets } from 'src/queries/base';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { AuthenticationSettings } from './AuthenticationSettings';

jest.mock('libphonenumber-js', () => ({
  parsePhoneNumber: () => ({
    formatInternational: () => '',
  }),
}));

const ALLOWLIST = 'allowlisting-form';

const queryClient = new QueryClient({
  defaultOptions: { queries: queryPresets.oneTimeFetch },
});

afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});
afterAll(() => server.close());

describe('Authentication settings profile tab', () => {
  it('should not render the allowlisting form when loading', () => {
    const { queryAllByTestId } = render(
      wrapWithTheme(<AuthenticationSettings />)
    );
    expect(queryAllByTestId(ALLOWLIST)).toHaveLength(0);
  });

  it('should render', async () => {
    const { findByTestId } = render(wrapWithTheme(<AuthenticationSettings />));
    expect(await findByTestId('authSettings')).toBeInTheDocument();
  });

  it('should not render the allowlisting form if the user does not have this setting enabled', async () => {
    server.use(
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(
            profileFactory.build({
              ip_whitelist_enabled: false,
            })
          )
        );
      })
    );

    const { queryAllByTestId } = render(
      wrapWithTheme(<AuthenticationSettings />)
    );
    expect(queryAllByTestId(ALLOWLIST)).toHaveLength(0);
  });
});
