import './dev-tools.css';

import React from 'react';
import ReactDOM from 'react-dom';
import FeatureFlagTool from './FeatureFlagTool';
import store from 'src/store';
import { Provider } from 'react-redux';

function install() {
  (window as any).devToolsEnabled = true;
  // Load local dev tools, untracked by Git.
  const requireDevToolsLocal = require.context('./', false, /\.local\.tsx/);
  const local = requireDevToolsLocal.keys()[0];
  let LocalDevTools: any;
  if (local) {
    LocalDevTools = requireDevToolsLocal(local).default;
  }
  LocalDevTools = LocalDevTools || (() => null);

  function DevTools() {
    return (
      <div id="dev-tools">
        <div>🛠</div>
        <div className="tools">
          <LocalDevTools />
          <FeatureFlagTool />
        </div>
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
