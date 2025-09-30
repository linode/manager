import { CloseIcon } from '@linode/ui';
import Handyman from '@mui/icons-material/Handyman';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

import { Draggable } from './components/Draggable';
import { DesignTokensTool } from './DesignTokensTool';
import './dev-tools.css';
import { EnvironmentToggleTool } from './EnvironmentToggleTool';
import { FeatureFlagTool } from './FeatureFlagTool';
import { ServiceWorkerTool } from './ServiceWorkerTool';
import { isMSWEnabled } from './utils';

import type { QueryClient } from '@tanstack/react-query';

export type DevToolsView = 'design-tokens' | 'mocks' | 'react-query';

const reactQueryDevtoolsStyle = {
  border: '1px solid rgba(255, 255, 255, 0.25)',
  height: '100%',
  width: '100%',
};

interface Props {
  queryClient: QueryClient;
}

export const DevTools = (props: Props) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isDraggable, setIsDraggable] = React.useState<boolean>(false);
  const [view, setView] = React.useState<DevToolsView>('mocks');
  const devToolsMainRef = React.useRef<HTMLDivElement>(null);

  const handleOpenReactQuery = () => {
    setView('react-query');
  };

  const handleOpenMocks = () => {
    setView('mocks');
  };

  const handleOpenDesignTokens = () => {
    setView('design-tokens');
  };

  const handleDraggableToggle = () => {
    setIsDraggable(!isDraggable);
    if (isDraggable) {
      setIsOpen(false);
    }
  };

  const handleGoToPreferences = () => {
    window.location.assign('/profile/settings?preferenceEditor=true');
  };

  React.useEffect(() => {
    // Prevent scrolling of the window when scrolling start/end of the dev tools
    // Particularly useful when in draggable mode
    if (!isDraggable) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      if (!devToolsMainRef.current?.contains(e.target as Node)) {
        return;
      }

      const target = devToolsMainRef.current;
      const isAtTop = target.scrollTop === 0;
      const isAtBottom =
        target.scrollHeight - target.clientHeight <= target.scrollTop + 1;

      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <Draggable draggable={isDraggable}>
      <div
        className={`dev-tools ${isMSWEnabled ? 'dev-tools--msw' : ''} ${
          isOpen ? 'dev-tools--open' : ''
        } ${isOpen && isDraggable ? 'isDraggable' : ''}
        `.trim()}
      >
        {!isDraggable && (
          <div className="dev-tools__toggle">
            <button
              className="dev-tools-button"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Handyman />
            </button>
          </div>
        )}
        {isOpen && (
          <div className="dev-tools__draggable-toggle">
            <button
              className="dev-tools-button"
              onClick={handleDraggableToggle}
              title="Toggle draggable"
            >
              {isDraggable ? <CloseIcon /> : <OpenInNewIcon />}
            </button>
          </div>
        )}
        <div className="dev-tools__body">
          <div className="dev-tools__content">
            <div className="dev-tools__status-bar">
              <div>
                <EnvironmentToggleTool />
              </div>
              <div className="dev-tools__segmented-button">
                <button
                  className={`toggle-button dev-tools-button ${
                    view === 'mocks' && 'toggle-button--on'
                  }`}
                  onClick={handleOpenMocks}
                >
                  Mocks
                </button>
                <button
                  className={`toggle-button dev-tools-button ${
                    view === 'react-query' && 'toggle-button--on'
                  }`}
                  onClick={handleOpenReactQuery}
                >
                  React Query
                </button>
                <button
                  className={`toggle-button dev-tools-button ${
                    view === 'design-tokens' && 'toggle-button--on'
                  }`}
                  onClick={handleOpenDesignTokens}
                >
                  Design Tokens
                </button>
              </div>
              <div>
                <button
                  className="dev-tools-button"
                  onClick={handleGoToPreferences}
                >
                  Go to Preferences
                </button>
              </div>
            </div>
            <div className="dev-tools__main" ref={devToolsMainRef}>
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
                <StyledReactQueryDevtoolsContainer
                  style={reactQueryDevtoolsStyle}
                >
                  <QueryClientProvider client={props.queryClient}>
                    <ReactQueryDevtools initialIsOpen={true} />
                  </QueryClientProvider>
                </StyledReactQueryDevtoolsContainer>
              )}
              {view === 'design-tokens' && <DesignTokensTool />}
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

const StyledReactQueryDevtoolsContainer = styled('div')({
  border: '1px solid rgba(255, 255, 255, 0.25)',
  height: '100%',
  width: '100%',
});
