import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { ENABLE_DEV_TOOLS, isProductionBuild } from 'src/constants';
import { ApplicationStore } from 'src/store';

import { EnvironmentToggleTool } from './EnvironmentToggleTool';
import { FeatureFlagTool } from './FeatureFlagTool';
import { MockDataTool } from './MockDataTool';
import './dev-tools.css';

function install(store: ApplicationStore) {
  function DevTools() {
    return (
      <div id="dev-tools">
        <div>🛠</div>
        <Grid className="tools" container spacing={2}>
          <Grid sm={2} xs={4}>
            <FeatureFlagTool />
          </Grid>
          {import.meta.env.DEV && (
            <Grid md={3} sm={5} xs={4}>
              <EnvironmentToggleTool />
            </Grid>
          )}
          {!isProductionBuild || ENABLE_DEV_TOOLS ? (
            <Grid md={3} sm={5} xs={4}>
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
