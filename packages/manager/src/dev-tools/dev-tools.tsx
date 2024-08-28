import Handyman from '@mui/icons-material/Handyman';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { ENABLE_DEV_TOOLS, isProductionBuild } from 'src/constants';
import { ApplicationStore } from 'src/store';

import './dev-tools.css';
import { EnvironmentToggleTool } from './EnvironmentToggleTool';
import { FeatureFlagTool } from './FeatureFlagTool';
import { MockDataTool } from './MockDataTool';
import { Preferences } from './Preferences';
import { isMSWEnabled } from './ServiceWorkerTool';
import { ThemeSelector } from './ThemeSelector';

function install(store: ApplicationStore) {
  function DevTools() {
    return (
      (<div className={isMSWEnabled ? 'mswEnabled' : ''} id="dev-tools">
        <div>
          <Handyman />
        </div>
        <Grid className="tools" container spacing={2}>
          <Grid
            size={{
              sm: 2,
              xs: 4
            }}>
            <FeatureFlagTool />
          </Grid>
          {import.meta.env.DEV && (
            <Grid
              size={{
                md: 3,
                sm: 5,
                xs: 4
              }}>
              <EnvironmentToggleTool />
            </Grid>
          )}
          {!isProductionBuild || ENABLE_DEV_TOOLS ? (
            <Grid
              size={{
                md: 3,
                sm: 5,
                xs: 4
              }}>
              <MockDataTool />
              <ThemeSelector />
              <Preferences />
            </Grid>
          ) : null}
        </Grid>
      </div>)
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
