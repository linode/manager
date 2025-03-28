import Grid from '@mui/material/Grid';
import * as React from 'react';

import { storage } from 'src/utilities/storage';

import { DevToolSelect } from './components/DevToolSelect';

interface EnvironmentOption {
  apiRoot: string;
  clientID: string;
  label: string;
  loginRoot: string;
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
export const getOptions = (env: Partial<ImportMetaEnv>) => {
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
        apiRoot: (env as any)[`${base}_API_ROOT`] ?? '',
        clientID: (env as any)[`${base}_CLIENT_ID`] ?? '',
        label: (env as any)[thisEnvVariable] ?? '',
        loginRoot: (env as any)[`${base}_LOGIN_ROOT`] ?? '',
      },
    ];
  }, []);
};

const options = getOptions(import.meta.env);

// This component works by setting local storage values that override the API_ROOT, LOGIN_ROOT,
// and CLIENT_ID environment variables, giving client-side control over the environment.
export const EnvironmentToggleTool = () => {
  const [selectedOption, setSelectedOption] = React.useState(0);

  const localStorageEnv = storage.devToolsEnv.get();
  const currentEnvLabel = localStorageEnv?.label;
  const selectedOptionLabel = options[selectedOption]?.label;

  return (
    <Grid container>
      <Grid
        size={12}
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
        }}
      >
        <DevToolSelect
          onChange={(e) => {
            const selectedIndex = options.findIndex(
              (o) => o.label === e.target.value
            );
            setSelectedOption(Math.max(selectedIndex, 0));
          }}
          defaultValue={currentEnvLabel}
          style={{ marginRight: 8, maxWidth: '100%' }}
        >
          <option disabled value="">
            Select an environment
          </option>
          {options.map((thisOption) => {
            const { label } = thisOption;
            return (
              <option key={label} value={label}>
                {label}
              </option>
            );
          })}
        </DevToolSelect>
        <button
          onClick={() => {
            const selected = options[selectedOption];
            if (selected) {
              storage.devToolsEnv.set(selected);
              window.location.reload();
            }
          }}
          className="dev-tools-button green"
          disabled={selectedOptionLabel === currentEnvLabel}
        >
          Refresh
        </button>
      </Grid>
    </Grid>
  );
};
