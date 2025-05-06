import { yupResolver } from '@hookform/resolvers/yup';
import { accountQueries, regionQueries } from '@linode/queries';
import type { FieldErrors, Resolver } from 'react-hook-form';

import { getRegionCountryGroup, isEURegion } from 'src/utilities/formatRegion';

import { getCleanedLinodeInterfaceValues } from './Networking/utilities';
import {
  CreateLinodeFromBackupSchema,
  CreateLinodeFromMarketplaceAppSchema,
  CreateLinodeFromStackScriptSchema,
  CreateLinodeSchema,
} from './schemas';
import { getInterfacesPayload } from './utilities';

import type {
  LinodeCreateFormContext,
  LinodeCreateFormValues,
} from './utilities';
import type { LinodeCreateType } from '@linode/utilities';
import type { QueryClient } from '@tanstack/react-query';

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
      values.interfaces = [];
      values.linodeInterfaces = values.linodeInterfaces.map(
        getCleanedLinodeInterfaceValues
      );
    } else {
      values.linodeInterfaces = [];
      values.interfaces =
        getInterfacesPayload(values.interfaces, values.private_ip) ?? [];
    }

    if (!values.placement_group?.id) {
      values.placement_group = undefined;
    }

    if (!values.metadata?.user_data) {
      values.metadata = undefined;
    }

    const { errors } = await yupResolver(
      schema,
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

    // If we're dealing with an employee account and the employee did not bypass/override the Firewall warning
    if (context?.secureVMNoticesEnabled && !values.firewallOverride) {
      // Handle Linode Interfaces
      if (values.interface_generation === 'linode') {
        const interfacesThatMayHaveInternetConnectivity =
          values.linodeInterfaces.filter((i) => i.purpose !== 'vlan');

        // If any Linode Interface that may have internet connectivity does not have a firewall, show the authorization banner.
        if (
          interfacesThatMayHaveInternetConnectivity.some((i) => !i.firewall_id)
        ) {
          (errors as FieldErrors<LinodeCreateFormValues>)['firewallOverride'] =
            {
              // This message does not get surfaced, but triggers an error so that FirewallAuthorization.tsx renders
              message:
                'You must select a Firewall or bypass the Firewall policy.',
              type: 'validate',
            };
        }
      }
      // Handle legacy Interfaces
      else if (!values.firewall_id) {
        (errors as FieldErrors<LinodeCreateFormValues>)['firewallOverride'] = {
          // This message does not get surfaced, but triggers an error so that FirewallAuthorization.tsx renders
          message: 'You must select a Firewall or bypass the Firewall policy.',
          type: 'validate',
        };
      }
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
