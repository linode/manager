import * as React from 'react';
import Grid from 'src/components/core/Grid';

interface EnvironmentOption {
  label: string;
  apiRoot: string;
  loginRoot: string;
  clientID: string;
}

// Set these environment variables in your .env file to toggle environments with dev tools.
const options: EnvironmentOption[] = [
  {
    label: process.env.REACT_APP_DEV_TOOLS_ENV_LABEL_1 ?? 'Env 1',
    apiRoot: process.env.REACT_APP_DEV_TOOLS_API_ROOT_1 ?? '',
    loginRoot: process.env.REACT_APP_DEV_TOOLS_LOGIN_ROOT_1 ?? '',
    clientID: process.env.REACT_APP_DEV_TOOLS_CLIENT_ID_1 ?? ''
  },
  {
    label: process.env.REACT_APP_DEV_TOOLS_ENV_LABEL_2 ?? 'Env 2',
    apiRoot: process.env.REACT_APP_DEV_TOOLS_API_ROOT_2 ?? '',
    loginRoot: process.env.REACT_APP_DEV_TOOLS_LOGIN_ROOT_2 ?? '',
    clientID: process.env.REACT_APP_DEV_TOOLS_CLIENT_ID_2 ?? ''
  }
];

const EnvironmentToggleTool: React.FC<{}> = () => {
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

const updateLocalStorage = (option: EnvironmentOption) => {
  window.localStorage['dev-tools-api-root'] = option.apiRoot;
  window.localStorage['dev-tools-login-root'] = option.loginRoot;
  window.localStorage['dev-tools-client-id'] = option.clientID;
};
