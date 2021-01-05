import './dev-tools.css';

import React from 'react';
import ReactDOM from 'react-dom';
import FeatureFlagTool from './FeatureFlagTool';
import EnvironmentToggleTool from './EnvironmentToggleTool';
import store from 'src/store';
import { Provider } from 'react-redux';
import MockDataTool from './MockDataTool';
import { isProductionBuild } from 'src/constants';
import Grid from 'src/components/core/Grid';

function install() {
  (window as any).devToolsEnabled = true;

  function DevTools() {
    return (
      <div id="dev-tools">
        <div>🛠</div>
        <Grid container spacing={2} className="tools">
          <Grid item xs={4} sm={2} className="column">
            <FeatureFlagTool />
          </Grid>
          {process.env.NODE_ENV === 'development' && (
            <Grid item xs={4} sm={5} md={3} className="column">
              <EnvironmentToggleTool />
            </Grid>
          )}
          {!isProductionBuild && (
            <Grid item xs={4} sm={5} md={3} className="column">
              <MockDataTool />
            </Grid>
          )}
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
