import Stack from '@mui/material/Stack';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { useAccountBetasQuery } from 'src/queries/accountBetas';
import { useBetasQuery } from 'src/queries/betas';
import BetaDetailsList from 'src/features/Betas/BetaDetailsList';
import { categorizeBetasByStatus } from 'src/utilities/betaUtils';

const BetasLanding = () => {
  const { data: accountBetas } = useAccountBetasQuery();
  const { data: betas } = useBetasQuery();

  let categorized_betas: ReturnType<typeof categorizeBetasByStatus> = {
    active: [],
    available: [],
    historical: [],
    no_status: [],
  };

  if (accountBetas?.data !== undefined && betas?.data !== undefined) {
    const activeBetaIds = accountBetas.data.map((beta) => beta.id);
    const betasWithoutEnrolledBetas = betas.data.filter(
      (beta) => !activeBetaIds.includes(beta.id)
    );
    categorized_betas = categorizeBetasByStatus([
      ...accountBetas.data,
      ...betasWithoutEnrolledBetas,
    ]);
  }

  const { active, historical, available } = categorized_betas;

  return (
    <>
      <ProductInformationBanner bannerLocation="Betas" />
      <LandingHeader title="Betas" />
      <Stack spacing={2}>
        <BetaDetailsList betas={active} title="Currently Enrolled Betas" />
        <BetaDetailsList betas={available} title="Available Betas" />
        <BetaDetailsList
          betas={historical}
          title="Beta Participation History"
        />
      </Stack>
    </>
  );
};

export default BetasLanding;
