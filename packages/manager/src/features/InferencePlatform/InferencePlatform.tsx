import { useLocation } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { Tab, useTabs } from 'src/hooks/useTabs';

import { InferencePlatformProvider } from './InferencePlatformProvider';

const InferenceHub = React.lazy(() =>
  import('./InferenceHub/InferenceHub').then((m) => ({
    default: m.InferenceHub,
  }))
);

const ModelPlayground = React.lazy(() =>
  import('./ModelPlayground/ModelPlayground').then((m) => ({
    default: m.ModelPlayground,
  }))
);

const ApiKeyManagement = React.lazy(() =>
  import('./ApiKeyManagement/ApiKeyManagement').then((m) => ({
    default: m.ApiKeyManagement,
  }))
);

const ModelLibrary = React.lazy(() =>
  import('./ModelLibrary/ModelLibrary').then((m) => ({
    default: m.ModelLibrary,
  }))
);

const Usage = React.lazy(() =>
  import('./Usage/Usage').then((m) => ({
    default: m.Usage,
  }))
);

export const InferencePlatform = () => {
  // useLocation subscribes to route changes, ensuring the component re-renders
  // on navigation so useTabs can recompute the active tab index.
  useLocation();

  const tabs: Tab[] = [
    { title: 'Inference Hub', to: '/inference-platform/inference-hub' },
    { title: 'Model Playground', to: '/inference-platform/model-playground' },
    { title: 'Model Library', to: '/inference-platform/model-library' },
    {
      title: 'API Key Management',
      to: '/inference-platform/api-key-management',
    },
    { title: 'Usage', to: '/inference-platform/usage' },
  ];

  const { handleTabChange, tabIndex } = useTabs(tabs);

  return (
    <InferencePlatformProvider>
      <React.Fragment>
        <DocumentTitleSegment segment="Inference Platform" />
        <LandingHeader
          breadcrumbProps={{ pathname: '/inference-platform' }}
          removeCrumbX={1}
          title="Inference Platform"
        />
        <Tabs index={tabIndex} onChange={handleTabChange}>
          <TanStackTabLinkList tabs={[...tabs]} />
          <React.Suspense fallback={<SuspenseLoader />}>
            <TabPanels>
              <SafeTabPanel index={0}>
                <InferenceHub />
              </SafeTabPanel>
              <SafeTabPanel index={1}>
                <ModelPlayground />
              </SafeTabPanel>
              <SafeTabPanel index={2}>
                <ModelLibrary />
              </SafeTabPanel>
              <SafeTabPanel index={3}>
                <ApiKeyManagement />
              </SafeTabPanel>
              <SafeTabPanel index={4}>
                <Usage />
              </SafeTabPanel>
            </TabPanels>
          </React.Suspense>
        </Tabs>
      </React.Fragment>
    </InferencePlatformProvider>
  );
};
