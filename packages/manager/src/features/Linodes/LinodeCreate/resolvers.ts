import { yupResolver } from '@hookform/resolvers/yup';
import { accountQueries, regionQueries } from '@linode/queries';
import { isNullOrUndefined } from '@linode/utilities';

import { getRegionCountryGroup, isEURegion } from 'src/utilities/formatRegion';

import { getLegacyInterfaceFromLinodeInterface, getLinodeInterfacePayload } from './Networking/utilities';
import {
  CreateLinodeFromBackupSchema,
  CreateLinodeFromMarketplaceAppSchema,
  CreateLinodeFromStackScriptSchema,
  CreateLinodeSchema,
} from './schemas';
import { getInterfacesPayload } from './utilities';

import type { LinodeCreateType } from './types';
import type {
  LinodeCreateFormContext,
  LinodeCreateFormValues,
} from './utilities';
import type { QueryClient } from '@tanstack/react-query';
import type { FieldErrors, Resolver } from 'react-hook-form';
import type { ObjectSchema } from 'yup';

export const getLinodeCreateResolver = (
  tab: LinodeCreateType | undefined,
  queryClient: QueryClient
): Resolver<LinodeCreateFormValues, LinodeCreateFormContext> => {
  const schema = linodeCreateResolvers[tab ?? 'OS'];
  return async (rawValues, context, options) => {
    const values = structuredClone(rawValues);

    // Because `interfaces` are so complex, we need to perform some transformations before
    // we even try to valiate them with our vaidation schema.
    if (context?.isLinodeInterfacesEnabled) {
      const shouldUseNewInterfaces = values.interface_generation === 'linode';

      if (shouldUseNewInterfaces) {
        values.linodeInterfaces = values.linodeInterfaces.map(
          getLinodeInterfacePayload
        );
        values.interfaces = undefined;
      } else {
        values.interfaces = values.linodeInterfaces.map(
          getLegacyInterfaceFromLinodeInterface
        );
        values.linodeInterfaces = undefined;
      }
    } else {
      values.interfaces = getInterfacesPayload(
        values.interfaces,
        values.private_ip
      );
    }

    console.log("Values", values)

    const { errors } = await yupResolver(
      schema as ObjectSchema<LinodeCreateFormValues>,
      {},
      { mode: 'async', raw: true }
    )(values, context, options);

    if (tab === 'Clone Linode' && !values.linode) {
      (errors as FieldErrors<LinodeCreateFormValues>)['linode'] = {
        message: 'You must select a Linode to clone from.',
        type: 'validate',
      };
    }

    const regions = await queryClient.ensureQueryData(regionQueries.regions);
    const selectedRegion = regions.find((r) => r.id === values.region);

    const hasSelectedAnEURegion = isEURegion(
      getRegionCountryGroup(selectedRegion)
    );

    if (hasSelectedAnEURegion && !context?.profile?.restricted) {
      const agreements = await queryClient.ensureQueryData(
        accountQueries.agreements
      );

      const hasSignedEUAgreement = agreements.eu_model;

      if (!hasSignedEUAgreement && !values.hasSignedEUAgreement) {
        (errors as FieldErrors<LinodeCreateFormValues>)[
          'hasSignedEUAgreement'
        ] = {
          message:
            'You must agree to the EU agreement to deploy to this region.',
          type: 'validate',
        };
      }
    }

    const secureVMViolation =
      context?.secureVMNoticesEnabled &&
      !values.firewallOverride &&
      isNullOrUndefined(values.firewall_id);

    if (secureVMViolation) {
      (errors as FieldErrors<LinodeCreateFormValues>)['firewallOverride'] = {
        type: 'validate',
      };
    }

    if (errors) {
      return { errors, values: rawValues };
    }

    return { errors: {}, values: rawValues };
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
