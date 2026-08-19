import React from 'react';

import { Stack } from '../components';
import { useInferencePlatform } from '../InferencePlatformContext';
import { mergeInferenceModel } from '../ModelLibrary/modelLibraryUtils';
import { BenchmarkBannerSection } from './BenchmarkBannerSection';
import styles from './Dashboard.module.css';
import { FeaturedModelsSection } from './FeaturedModelsSection';
import { LearnSection } from './LearnSection';
import { ModelExploreCardsSection } from './ModelExploreCardsSection';
import { PromoCardsSection } from './PromoCardsSection';
import { QuickstartSection } from './QuickstartSection';
import { SpeedrunSection } from './SpeedrunSection';
import { UsageSection } from './UsageSection';

export const Dashboard = () => {
  const { isModelsLoading, models: rawModels } = useInferencePlatform();

  const featuredModels = React.useMemo(() => {
    return rawModels.map(mergeInferenceModel).slice(0, 3);
  }, [rawModels]);

  return (
    <Stack className={styles.dashboard}>
      <ModelExploreCardsSection />
      <UsageSection />
      <FeaturedModelsSection
        isLoading={isModelsLoading}
        models={featuredModels}
      />
      <SpeedrunSection />
      <QuickstartSection />
      <PromoCardsSection />
      <LearnSection />
      <BenchmarkBannerSection />
    </Stack>
  );
};
