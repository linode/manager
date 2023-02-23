import './dev-tools.css';

import React from 'react';
import FeatureFlagTool from './FeatureFlagTool';
import EnvironmentToggleTool from './EnvironmentToggleTool';
import store from 'src/store';
import { Provider } from 'react-redux';
import MockDataTool from './MockDataTool';
import { ENABLE_DEV_TOOLS, isProductionBuild } from 'src/constants';
import Grid from 'src/components/core/Grid';
import { createRoot } from 'react-dom/client';

function install() {
  (window as any).devToolsEnabled = true;

  function DevTools() {
    return (
      <div id="dev-tools">
        <div>🛠</div>
        <Grid container spacing={2} className="tools">
          <Grid item xs={4} sm={2}>
            <FeatureFlagTool />
          </Grid>
          {process.env.NODE_ENV === 'development' && (
            <Grid item xs={4} sm={5} md={3}>
              <EnvironmentToggleTool />
            </Grid>
          )}
          {!isProductionBuild || ENABLE_DEV_TOOLS ? (
            <Grid item xs={4} sm={5} md={3}>
              <MockDataTool />
            </Grid>
          ) : null}
        </Grid>
      </div>
    );
  }

  const devToolsRoot = document.createElement('div');
  document.body.appendChild(devToolsRoot);

  const root = createRoot(devToolsRoot);

  root.render(
    <Provider store={store}>
      <DevTools />
    </Provider>
  );
}

export { install };
