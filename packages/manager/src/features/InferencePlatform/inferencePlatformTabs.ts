import type { Tab } from 'src/hooks/useTabs';

/**
 * Shared top-level Inference Platform tabs.
 *
 * Consumed by both `InferencePlatform` and the nested `ModelDetails` route so
 * the two tab bars stay in sync. Required for navigation — `useTabs` derives
 * the active index from these entries.
 */
export const INFERENCE_PLATFORM_TABS: Tab[] = [
  { title: 'Dashboard', to: '/inference-platform/dashboard' },
  { title: 'Model Library', to: '/inference-platform/model-library' },
  { title: 'Model Playground', to: '/inference-platform/model-playground' },
  {
    title: 'API Key Management',
    to: '/inference-platform/api-key-management',
  },
  { title: 'Usage', to: '/inference-platform/usage' },
];
