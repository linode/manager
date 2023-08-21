import Stack from '@mui/material/Stack';
import * as React from 'react';
import _ from 'lodash';

import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { useAccountBetasQuery } from 'src/queries/accountBetas';
import { useBetasQuery } from 'src/queries/betas';
import BetaDetailsList from 'src/features/Betas/BetaDetailsList';
import { categorizeBetasByStatus } from 'src/utilities/betaUtils';

const BetasLanding = () => {
  const {
    data: accountBetasRequest,
    isLoading: isAccountBetasLoading,
    error: accountBetasErrors,
  } = useAccountBetasQuery();
  const {
    data: betasRequest,
    isLoading: isBetasLoading,
    error: betasErrors,
  } = useBetasQuery();

  const accountBetas = accountBetasRequest?.data ?? [];
  const betas = betasRequest?.data ?? [];

  const allBetas = [...accountBetas, ...betas];
  const allBetasMerged = allBetas.reduce((acc, beta) => {
    if (acc[beta.id]) {
      acc[beta.id] = Object.assign(beta, acc[beta.id]);
    } else {
      acc[beta.id] = beta;
    }
    return acc;
  }, {});

  const { active, available, historical } = categorizeBetasByStatus(
    Object.values(allBetasMerged)
  );

  return (
    <>
      <ProductInformationBanner bannerLocation="Betas" />
      <LandingHeader title="Betas" />
      <Stack spacing={2}>
        <BetaDetailsList
          betas={active}
          title="Currently Enrolled Betas"
          isLoading={isAccountBetasLoading}
          errors={accountBetasErrors}
        />
        <BetaDetailsList
          betas={available}
          title="Available Betas"
          isLoading={isBetasLoading}
          errors={betasErrors}
        />
        <BetaDetailsList
          betas={historical}
          title="Beta Participation History"
          isLoading={isAccountBetasLoading}
          errors={accountBetasErrors}
        />
      </Stack>
    </>
  );
};

export default BetasLanding;
