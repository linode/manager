import {
  Checkbox,
  FormControlLabel,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import React, { useMemo } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { Currency } from 'src/components/Currency';
import { DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY } from 'src/components/Encryption/constants';
import { Link } from 'src/components/Link';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAccountSettings } from 'src/queries/account/settings';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import { getMonthlyBackupsPrice } from 'src/utilities/pricing/backups';

import { getBackupsEnabledValue } from './utilities';

import type { LinodeCreateFormValues } from '../utilities';

export const Backups = () => {
  const { control } = useFormContext<LinodeCreateFormValues>();
  const { field } = useController({
    control,
    name: 'backups_enabled',
  });

  const [regionId, typeId, diskEncryption] = useWatch({
    control,
    name: ['region', 'type', 'disk_encryption'],
  });

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

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

  const isDistributedRegionSelected =
    selectedRegion?.site_type === 'distributed';

  const checked = getBackupsEnabledValue({
    accountBackupsEnabled: isAccountBackupsEnabled,
    isDistributedRegion: isDistributedRegionSelected,
    value: field.value,
  });

  return (
    <FormControlLabel
      disabled={
        isDistributedRegionSelected ||
        isLinodeCreateRestricted ||
        isAccountBackupsEnabled
      }
      label={
        <Stack spacing={1} sx={{ pl: 2 }}>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Typography component="span" variant="h3">
              Backups
            </Typography>
            {backupsMonthlyPrice && (
              <Typography component="span">
                <Currency quantity={backupsMonthlyPrice} /> per month
              </Typography>
            )}
          </Stack>
          {checked && diskEncryption === 'enabled' && (
            <Notice
              typeProps={{
                style: { fontSize: '0.875rem' },
              }}
              spacingBottom={0}
              spacingTop={0}
              text={DISK_ENCRYPTION_BACKUPS_CAVEAT_COPY}
              variant="warning"
            />
          )}
          <Typography component="span" display="block" variant="body1">
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
      checked={checked}
      control={<Checkbox />}
      data-testid="backups"
      onChange={field.onChange}
      sx={{ alignItems: 'start' }}
    />
  );
};
