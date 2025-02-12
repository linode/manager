import { Stack } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { BetaDetailsList } from 'src/features/Betas/BetaDetailsList';
import { useAccountBetasQuery } from 'src/queries/account/betas';
import { useBetasQuery } from 'src/queries/betas';
import { categorizeBetasByStatus } from 'src/utilities/betaUtils';

import type { AccountBeta, Beta } from '@linode/api-v4';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

export const BetasLanding = () => {
  const {
    data: accountBetasRequest,
    error: accountBetasErrors,
    isLoading: areAccountBetasLoading,
  } = useAccountBetasQuery();
  const {
    data: betasRequest,
    error: betasErrors,
    isLoading: areBetasLoading,
  } = useBetasQuery();

  const accountBetas = accountBetasRequest?.data ?? [];
  const betas = betasRequest?.data ?? [];

  const allBetas = [...accountBetas, ...betas];
  const allBetasMerged = allBetas.reduce<Record<string, AccountBeta | Beta>>(
    (acc, beta) => {
      if (acc[beta.id]) {
        acc[beta.id] = Object.assign(beta, acc[beta.id]);
      } else {
        acc[beta.id] = beta;
      }
      return acc;
    },
    {}
  );

  const { active, available, historical } = categorizeBetasByStatus(
    Object.values(allBetasMerged)
  );

  return (
    <>
      <DocumentTitleSegment segment="Betas" />
      <ProductInformationBanner bannerLocation="Betas" />
      <LandingHeader title="Betas" />
      <Stack spacing={2}>
        <BetaDetailsList
          betas={active}
          dataQA="enrolled-beta"
          errors={accountBetasErrors}
          isLoading={areAccountBetasLoading}
          title="Currently Enrolled Betas"
        />
        <BetaDetailsList
          betas={available}
          dataQA="available-beta"
          errors={betasErrors}
          isLoading={areBetasLoading}
          title="Available & Upcoming Betas"
        />
        <BetaDetailsList
          betas={historical}
          dataQA="historical-beta"
          errors={accountBetasErrors}
          isLoading={areAccountBetasLoading}
          title="Beta Participation History"
        />
      </Stack>
    </>
  );
};

export const betasLandingLazyRoute = createLazyRoute('/betas')({
  component: BetasLanding,
});
