import { yupResolver } from '@hookform/resolvers/yup';
import { CreateLinodeSchema } from '@linode/validation';

import { accountQueries } from 'src/queries/account/queries';
import { regionQueries } from 'src/queries/regions/regions';
import { getRegionCountryGroup, isEURegion } from 'src/utilities/formatRegion';

import {
  CreateLinodeFromBackupSchema,
  CreateLinodeFromMarketplaceAppSchema,
  CreateLinodeFromStackScriptSchema,
} from './schemas';
import { getLinodeCreatePayload } from './utilities';

import type { LinodeCreateType } from '../LinodesCreate/types';
import type { LinodeCreateFormValues } from './utilities';
import type { QueryClient } from '@tanstack/react-query';
import type { Resolver } from 'react-hook-form';

export const getLinodeCreateResolver = (
  tab: LinodeCreateType | undefined,
  queryClient: QueryClient
): Resolver<LinodeCreateFormValues, { secureVMNoticesEnabled: boolean }> => {
  const schema = linodeCreateResolvers[tab ?? 'OS'];

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  return async (values, context, options) => {
    const transformedValues = getLinodeCreatePayload(structuredClone(values));

    const { errors } = await yupResolver(
      schema,
      {},
      { mode: 'async', rawValues: true }
    )(transformedValues, context, options);

    if (tab === 'Clone Linode' && !values.linode) {
      errors['linode'] = {
        message: 'You must select a Linode to clone from.',
        type: 'validate',
      };
    }

    const regions = await queryClient.ensureQueryData(regionQueries.regions);

    const selectedRegion = regions.find((r) => r.id === values.region);

    const hasSelectedAnEURegion = isEURegion(
      getRegionCountryGroup(selectedRegion)
    );

    if (hasSelectedAnEURegion) {
      const agreements = await queryClient.ensureQueryData(
        accountQueries.agreements
      );

      const hasSignedEUAgreement = agreements.eu_model;

      if (!hasSignedEUAgreement && !values.hasSignedEUAgreement) {
        errors['hasSignedEUAgreement'] = {
          message:
            'You must agree to the EU agreement to deploy to this region.',
          type: 'validate',
        };
      }
    }

    const secureVMViolation =
      context?.secureVMNoticesEnabled &&
      !values.firewallOverride &&
      !values.firewall_id;

    if (secureVMViolation) {
      errors['firewallOverride'] = {
        type: 'validate',
      };
    }

    if (errors) {
      return { errors, values };
    }

    return { errors: {}, values };
  };
};

export const linodeCreateResolvers = {
  Backups: CreateLinodeFromBackupSchema,
  'Clone Linode': CreateLinodeSchema,
  Images: CreateLinodeSchema,
  OS: CreateLinodeSchema,
  'One-Click': CreateLinodeFromMarketplaceAppSchema,
  StackScripts: CreateLinodeFromStackScriptSchema,
};
