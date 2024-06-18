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
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
// import { ThemeSelector } from './ThemeSelector';

export type DevToolsView = 'mocks' | 'react-query';

const reactQueryDevtoolsStyle = {
  border: '1px solid rgba(255, 255, 255, 0.25)',
  width: '100%',
  height: '100%',
};

function install(store: ApplicationStore, queryClient: QueryClient) {
  function DevTools() {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [view, setView] = React.useState<DevToolsView>('mocks');
    //const [isReactQueryOpen, setReactQueryOpen] = React.useState<boolean>(false);

    const handleOpenReactQuery = () => {
      setView('react-query');
    };

    const handleOpenMocks = () => {
      setView('mocks');
    };

    const handleGoToPreferences = () => {
      window.location.assign('/profile/settings?preferenceEditor=true');
    };

    return (
      <>
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
                  <button
                    className={`toggle-button ${
                      view === 'mocks' && 'toggle-button--on'
                    }`}
                    onClick={handleOpenMocks}
                  >
                    Mocks
                  </button>
                  <button
                    className={`toggle-button ${
                      view === 'react-query' && 'toggle-button--on'
                    }`}
                    onClick={handleOpenReactQuery}
                  >
                    React Query
                  </button>
                </div>
                <div>
                  <button onClick={handleGoToPreferences}>
                    Go to Preferences
                  </button>
                </div>
              </div>
              <div className="dev-tools__main">
                {view === 'mocks' && (
                  <>
                    <div className="dev-tools__main__column">
                      <FeatureFlagTool />
                    </div>
                    <div className="dev-tools__main__column">
                      <ServiceWorkerTool />
                    </div>
                  </>
                )}
                {view === 'react-query' && (
                  <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtoolsPanel
                      setIsOpen={() => {}}
                      onDragStart={() => {}}
                      style={reactQueryDevtoolsStyle}
                    />
                  </QueryClientProvider>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
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
