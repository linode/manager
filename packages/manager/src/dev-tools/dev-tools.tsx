import Handyman from '@mui/icons-material/Handyman';
// import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

// import { ENABLE_DEV_TOOLS, isProductionBuild } from 'src/constants';
import { ApplicationStore } from 'src/store';

import './dev-tools.css';
import { EnvironmentToggleTool } from './EnvironmentToggleTool';
import { FeatureFlagTool } from './FeatureFlagTool';
import { ServiceWorkerTool } from './ServiceWorkerTool';
//import { MockDataTool } from './MockDataTool';
// import { Preferences } from './Preferences';
import { isMSWEnabled } from './ServiceWorkerTool';
// import { ThemeSelector } from './ThemeSelector';

function install(store: ApplicationStore) {
  function DevTools() {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    return (
      <div
        className={`dev-tools ${isMSWEnabled && 'dev-tools--msw'} ${
          isOpen && 'dev-tools--open'
        }`}
      >
        <div className="dev-tools__toggle">
          <button onClick={() => setIsOpen(!isOpen)}>
            <Handyman />
          </button>
        </div>
        <div className="dev-tools__body">
          <div className="dev-tools__content">
            <div className="dev-tools__status-bar">
              <div>
                <EnvironmentToggleTool />
              </div>
              <div className="dev-tools__segmented-button">
                <button>React Query</button>
                <button
                  onClick={() =>
                    window.location.assign(
                      '/profile/settings?preferenceEditor=true'
                    )
                  }
                >
                  Preferences
                </button>
              </div>
            </div>
            <div className="dev-tools__main">
              <div className="dev-tools__main__column">
                <FeatureFlagTool />
              </div>
              <div className="dev-tools__main__column">
                <ServiceWorkerTool />
              </div>
            </div>
          </div>
        </div>
      </div>
      // <div className={isMSWEnabled ? 'mswEnabled' : ''} id="dev-tools">
      //   <div>
      //     <Handyman />
      //   </div>
      //   <Grid className="tools" container spacing={2}>
      //     <Grid sm={2} xs={4}>
      //       <FeatureFlagTool />
      //     </Grid>
      //     {import.meta.env.DEV && (
      //       <Grid md={3} sm={5} xs={4}>
      //         <EnvironmentToggleTool />
      //       </Grid>
      //     )}
      //     {!isProductionBuild || ENABLE_DEV_TOOLS ? (
      //       <Grid md={3} sm={5} xs={4}>
      //         <MockDataTool />
      //         <ThemeSelector />
      //         <Preferences />
      //       </Grid>
      //     ) : null}
      //   </Grid>
      // </div>
    );
  }

  const devToolsRoot = (() => {
    const existingRoot = document.getElementById('dev-tools-root');
    if (existingRoot) {
      return existingRoot;
    }
    const newRoot = document.createElement('div');
    newRoot.id = 'dev-tools-root';
    document.body.appendChild(newRoot);
    return newRoot;
  })();

  const root = createRoot(devToolsRoot);
  root.render(
    <Provider store={store}>
      <DevTools />
    </Provider>
  );
}

export { install };
