import { useAccountAgreements, useRegionsQuery } from '@linode/queries';
import { Notice, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useController, useWatch } from 'react-hook-form';

import { EUAgreementCheckbox } from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { getRegionCountryGroup, isEURegion } from 'src/utilities/formatRegion';

import type { LinodeCreateFormValues } from './utilities';

export const EUAgreement = () => {
  const { field, fieldState } = useController<LinodeCreateFormValues>({
    name: 'hasSignedEUAgreement',
  });

  const { data: regions } = useRegionsQuery();

  const regionId = useWatch<LinodeCreateFormValues>({ name: 'region' });

  const selectedRegion = regions?.find((r) => r.id === regionId);

  const hasSelectedAnEURegion = isEURegion(
    getRegionCountryGroup(selectedRegion)
  );

  const { data: agreements } = useAccountAgreements(hasSelectedAnEURegion);

  if (hasSelectedAnEURegion && agreements?.eu_model === false) {
    return (
      <Paper>
        <Stack spacing={1}>
          <Typography variant="h2">Agreements</Typography>
          {fieldState.error?.message && (
            <Notice text={fieldState.error.message} variant="error" />
          )}
          <EUAgreementCheckbox
            centerCheckbox
            checked={field.value ?? false}
            onChange={(_, checked) => field.onChange(checked)}
          />
        </Stack>
      </Paper>
    );
  }

  return null;
};
