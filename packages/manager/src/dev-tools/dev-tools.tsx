import './dev-tools.css';

import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ENABLE_DEV_TOOLS, isProductionBuild } from 'src/constants';
import { ApplicationStore } from 'src/store';
import EnvironmentToggleTool from './EnvironmentToggleTool';
import FeatureFlagTool from './FeatureFlagTool';
import MockDataTool from './MockDataTool';

function install(store: ApplicationStore) {
  (window as any).devToolsEnabled = true;

  function DevTools() {
    return (
      <div id="dev-tools">
        <div>🛠</div>
        <Grid container spacing={2} className="tools">
          <Grid xs={4} sm={2}>
            <FeatureFlagTool />
          </Grid>
          {import.meta.env.DEV && (
            <Grid xs={4} sm={5} md={3}>
              <EnvironmentToggleTool />
            </Grid>
          )}
          {!isProductionBuild || ENABLE_DEV_TOOLS ? (
            <Grid xs={4} sm={5} md={3}>
              <MockDataTool />
            </Grid>
          ) : null}
        </Grid>
      </div>
    );
  }

  const devToolsRoot = document.createElement('div');
  document.body.appendChild(devToolsRoot);
  ReactDOM.render(
    <Provider store={store}>
      <DevTools />
    </Provider>,
    devToolsRoot
  );
}

export { install };
