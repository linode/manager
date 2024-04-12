import React, { useMemo } from 'react';
import { useController, useWatch } from 'react-hook-form';

import { Checkbox } from 'src/components/Checkbox';
import { Currency } from 'src/components/Currency';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAccountSettings } from 'src/queries/account/settings';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';

import { getBackupsEnabledValue } from './utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Backups = () => {
  const { field } = useController<CreateLinodeRequest, 'backups_enabled'>({
    name: 'backups_enabled',
  });

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const regionId = useWatch<CreateLinodeRequest, 'region'>({ name: 'region' });
  const typeId = useWatch<CreateLinodeRequest, 'type'>({ name: 'type' });

  const { data: type } = useTypeQuery(typeId, Boolean(typeId));
  const { data: regions } = useRegionsQuery();
  const { data: accountSettings } = useAccountSettings();

  const backupsMonthlyPrice = getMonthlyBackupsPrice({
    region: regionId,
    type,
  });

  const selectedRegion = useMemo(
    () => regions?.find((r) => r.id === regionId),
    [regions, regionId]
  );

  const isAccountBackupsEnabled = accountSettings?.backups_enabled ?? false;

  const isEdgeRegionSelected = selectedRegion?.site_type === 'edge';

  return (
    <FormControlLabel
      checked={getBackupsEnabledValue({
        accountBackupsEnabled: isAccountBackupsEnabled,
        isEdgeRegion: isEdgeRegionSelected,
        value: field.value,
      })}
      disabled={
        isEdgeRegionSelected ||
        isLinodeCreateRestricted ||
        isAccountBackupsEnabled
      }
      label={
        <Stack sx={{ pl: 2 }}>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography variant="h3">Backups</Typography>
            {backupsMonthlyPrice && (
              <Typography>
                <Currency quantity={backupsMonthlyPrice} /> per month
              </Typography>
            )}
          </Stack>
          <Typography>
            {isAccountBackupsEnabled ? (
              <React.Fragment>
                You have enabled automatic backups for your account. This Linode
                will automatically have backups enabled. To change this setting,{' '}
                <Link to={'/account/settings'}>click here.</Link>
              </React.Fragment>
            ) : (
              <React.Fragment>
                Three backup slots are executed and rotated automatically: a
                daily backup, a 2-7 day old backup, and an 8-14 day old backup.
                Plans are priced according to the Linode plan selected above.
              </React.Fragment>
            )}
          </Typography>
        </Stack>
      }
      control={<Checkbox />}
      onChange={field.onChange}
    />
  );
};
