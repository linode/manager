import * as React from 'react';
import Grid from 'src/components/core/Grid';

interface EnvironmentOption {
  label: string;
  apiRoot: string;
  loginRoot: string;
  clientID: string;
}

// Parse a node env to collect environment options. Set environment variables as follows:
//
// REACT_APP_DEV_TOOLS_ENV_1_LABEL="Prod"
// REACT_APP_DEV_TOOLS_ENV_1_API_ROOT="https://api.linode.com/v4"
// REACT_APP_DEV_TOOLS_ENV_1_LOGIN_ROOT="https://login.linode.com"
// REACT_APP_DEV_TOOLS_ENV_1_CLIENT_ID=<YOUR_CLIENT_ID>
//
// Repeat for each desired environment, incrementing the "1" to "2", e.g.:
//
// REACT_APP_DEV_TOOLS_ENV_2_LABEL+"Another environment"
export const getOptions = (env: typeof process.env) => {
  const envVariables = Object.keys(env);

  return envVariables.reduce<EnvironmentOption[]>((acc, thisEnvVariable) => {
    const parsed = /REACT_APP_DEV_TOOLS_ENV_(.)_LABEL/.exec(thisEnvVariable);
    if (!parsed) {
      return acc;
    }

    const num = parsed[1];
    const base = `REACT_APP_DEV_TOOLS_ENV_${num}`;

    return [
      ...acc,
      {
        label: env[thisEnvVariable] ?? '',
        apiRoot: env[`${base}_API_ROOT`] ?? '',
        loginRoot: env[`${base}_LOGIN_ROOT`] ?? '',
        clientID: env[`${base}_CLIENT_ID`] ?? ''
      }
    ];
  }, []);
};

const options = getOptions(process.env);

// This component works by setting local storage values that override the API_ROOT, LOGIN_ROOT,
// and CLIENT_ID environment variables, giving client-side control over the environment.
const EnvironmentToggleTool: React.FC<{}> = () => {
  const updateLocalStorage = (option: EnvironmentOption) => {
    window.localStorage['dev-tools-api-root'] = option.apiRoot;
    window.localStorage['dev-tools-login-root'] = option.loginRoot;
    window.localStorage['dev-tools-client-id'] = option.clientID;
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <h4>Environment</h4>
      </Grid>
      <Grid item xs={12}>
        <select
          onBlur={e => {
            const selected = options.find(o => o.label === e.target.value);
            if (selected) {
              updateLocalStorage(selected);
            }
          }}
        >
          {options.map(thisOption => {
            return (
              <option key={thisOption.label} value={thisOption.label}>
                {thisOption.label}
              </option>
            );
          })}
        </select>
        <button style={{ marginLeft: 8 }} onClick={() => location.reload()}>
          Refresh
        </button>
      </Grid>
    </Grid>
  );
};

export default React.memo(EnvironmentToggleTool);
