import { useInferenceModelDetailQuery } from '@linode/queries';
import { NotFound } from '@linode/ui';
import { useLocation, useParams } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { Box } from '../components/Box/Box';
import { Stack } from '../components/Stack/Stack';
import { INFERENCE_PLATFORM_TABS } from '../inferencePlatformTabs';
import { mergeInferenceModel } from '../ModelLibrary/modelLibraryUtils';
import { CodeSnippetSection } from './CodeSnippetSection/CodeSnippetSection';
import { InferenceParameters } from './InferenceParameters/InferenceParameters';
import { InferencePricing } from './InferencePricing/InferencePricing';
import { ModelDescription } from './ModelDescription/ModelDescription';
import { ModelDetailsHeader } from './ModelDetailsHeader/ModelDetailsHeader';
import { ModelHighlights } from './ModelHighlights/ModelHighlights';
import { ModelSpecs } from './ModelSpecs/ModelSpecs';
import { PromoBanner } from './PromoBanner/PromoBanner';
import { ResourcesBar } from './ResourcesBar/ResourcesBar';

// ResourcesBar and PromoBanner are placeholders with no finalised content/design yet.
const showPlaceholderSections = false;

export const ModelDetails = () => {
  const { modelId } = useParams({ strict: false }) as { modelId?: string };
  const flags = useFlags();

  // useLocation subscribes to route changes so useTabs recomputes the active
  // tab index; the Model Library tab stays active on this nested route.
  useLocation();

  // Spread into a new array each render so useTabs recomputes the active tab
  // index on navigation (its memo keys off the tabs reference).
  const tabs = [...INFERENCE_PLATFORM_TABS];

  const { handleTabChange, tabIndex } = useTabs(tabs);

  // Gate the Model Details page on the 2026 beta features flag. The query
  // below is also gated on this flag so that bookmarked URLs do not fire the
  // beta endpoint (avoiding avoidable 404/authorization errors) before the
  // route renders NotFound.
  const isBetaEnabled = Boolean(flags.inferencePlatform2026Beta);

  // The Model Details page is driven by the per-model detail endpoint
  // (`GET /v4beta/inference/models/:id/detail`), which returns the rich
  // `more_info`, `license`, `limits`, `performance`, etc. fields not
  // available on the list endpoint.
  const { data: apiModel, isLoading } = useInferenceModelDetailQuery(
    modelId ?? '',
    isBetaEnabled && Boolean(modelId)
  );

  // Checked after hooks to preserve consistent hook order across renders.
  if (!isBetaEnabled) {
    return <NotFound />;
  }

  const model = apiModel ? mergeInferenceModel(apiModel) : undefined;

  return (
    <React.Fragment>
      <LandingHeader
        breadcrumbProps={{ pathname: '/inference-platform' }}
        removeCrumbX={1}
        spacingBottom={4}
        title="AI Inference"
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={[...tabs]} />
      </Tabs>
      <Stack
        spacing={16}
        style={{ margin: '20px 20px 0', width: 'calc(100% - 40px)' }}
      >
        {/* 1 — Full-width header */}
        <ModelDetailsHeader model={model} modelId={modelId ?? ''} />

        {/* Two-column body: left main content + right sidebar */}
        <Box
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          }}
        >
          {/* LEFT column */}
          <Stack spacing={16}>
            <ModelDescription isLoading={isLoading} model={model} />
            <CodeSnippetSection modelId={modelId ?? ''} />
            <ModelHighlights model={model} />
            {showPlaceholderSections && <ResourcesBar />}
          </Stack>

          {/* RIGHT sidebar */}
          <Stack spacing={16}>
            <InferencePricing model={model} />
            <ModelSpecs model={model} />
            <InferenceParameters model={model} />
          </Stack>
        </Box>

        {/* 8 — Full-width promo banner */}
        {showPlaceholderSections && <PromoBanner />}
      </Stack>
    </React.Fragment>
  );
};
