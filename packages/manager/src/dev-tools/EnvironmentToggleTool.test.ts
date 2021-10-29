import { getOptions } from './EnvironmentToggleTool';

describe('getOptions', () => {
  /* eslint-disable sonarjs/no-duplicate-string */
  const baseEnv = {
    VITE_DEV_TOOLS_ENV_1_LABEL: 'Prod',
    VITE_DEV_TOOLS_ENV_1_API_ROOT: 'https://api.linode.com/v4',
    VITE_DEV_TOOLS_ENV_1_LOGIN_ROOT: 'https://login.linode.com/v4',
    VITE_DEV_TOOLS_ENV_1_CLIENT_ID: 'CLIENT_ID_1',
  };

  it('generates options from a single set of env variables', () => {
    expect(getOptions(baseEnv)).toEqual([
      {
        label: 'Prod',
        apiRoot: 'https://api.linode.com/v4',
        loginRoot: 'https://login.linode.com/v4',
        clientID: 'CLIENT_ID_1',
      },
    ]);
  });

  it('works with multiple sets', () => {
    const multiEnv = {
      ...baseEnv,
      VITE_DEV_TOOLS_ENV_2_LABEL: 'Local',
      VITE_DEV_TOOLS_ENV_2_API_ROOT: 'http://localhost:5000',
      VITE_DEV_TOOLS_ENV_2_LOGIN_ROOT: 'http://localhost:6000',
      VITE_DEV_TOOLS_ENV_2_CLIENT_ID: 'CLIENT_ID_2',
    };
    expect(getOptions(multiEnv)).toEqual([
      {
        label: 'Prod',
        apiRoot: 'https://api.linode.com/v4',
        loginRoot: 'https://login.linode.com/v4',
        clientID: 'CLIENT_ID_1',
      },
      {
        label: 'Local',
        apiRoot: 'http://localhost:5000',
        loginRoot: 'http://localhost:6000',
        clientID: 'CLIENT_ID_2',
      },
    ]);
  });
});
