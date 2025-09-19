import { useAccountBetasQuery, useBetasQuery } from '@linode/queries';
import { Stack, Typography } from '@linode/ui';
import { categorizeBetasByStatus } from '@linode/utilities';
import * as React from 'react';

import { BetaDetailsList } from './BetaDetailsList';

import type { AccountBeta, Beta } from '@linode/api-v4';

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
      <Typography variant="h2">Betas</Typography>
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
