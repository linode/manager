import './dev-tools.css';

import React from 'react';
import ReactDOM from 'react-dom';
import FeatureFlagTool from './FeatureFlagTool';
import EnvironmentToggleTool from './EnvironmentToggleTool';
import { Provider } from 'react-redux';
import MockDataTool from './MockDataTool';
import { ENABLE_DEV_TOOLS, isProductionBuild } from 'src/constants';
import Grid from '@mui/material/Unstable_Grid2';
import { ApplicationStore } from 'src/store';

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
