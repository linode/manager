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
  withRootPassOptional,
  withRootPassRequired,
} from './schemas';
import {
  getDoesEmployeeNeedToAssignFirewall,
  getInterfacesPayload,
} from './utilities';

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
  return async (rawValues, context, options) => {
    const linodeCreateSchemas = linodeCreateResolvers(
      context?.isPasswordLessLinodesEnabled ?? false
    );
    const schema = linodeCreateSchemas[tab ?? 'OS'];
    const values = structuredClone(rawValues);

    // Because `interfaces` are so complex, we need to perform some transformations before
    // we even try to validate them with our vaidation schema.
    if (context?.isLinodeInterfacesEnabled) {
      values.interfaces = [];
      values.linodeInterfaces = values.linodeInterfaces.map(
        getCleanedLinodeInterfaceValues
      );
      if (
        values.interface_generation === 'legacy_config' ||
        tab === 'Clone Linode'
      ) {
        // firewall_id is required in the form under interfaces object when using linode interfaces, but not when using legacy interfaces.
        // If the user selects legacy interfaces, we set firewall_id to -1 to bypass the firewall requirement in the validation schema.
        values.linodeInterfaces.forEach((linodeInterface) => {
          linodeInterface.firewall_id = -1;
        });
      } else {
        values.firewall_id = -1;
      }
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

    // For the Clone Linode flow, we need not send firewall_id in the payload as API will take care of assigning the firewall_id based on the source Linode's configuration.
    if (tab === 'Clone Linode' && !values.firewall_id) {
      // The Clone Linode flow does not have the firewall_id field under interfaces object, so we set firewall_id to -1 to bypass the firewall requirement in the validation schema.
      values.firewall_id = -1;
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

    // If
    // - we're dealing with an employee account
    // - and the employee did not bypass/override the Firewall warning
    // - and their networking configuration "requires" a firewall
    if (
      context?.secureVMNoticesEnabled &&
      !values.firewallOverride &&
      getDoesEmployeeNeedToAssignFirewall(
        values.firewall_id,
        values.linodeInterfaces,
        values.interface_generation
      )
    ) {
      (errors as FieldErrors<LinodeCreateFormValues>)['firewallOverride'] = {
        // This message does not get surfaced, but triggers an error so that FirewallAuthorization.tsx renders
        message: 'You must select a Firewall or bypass the Firewall policy.',
        type: 'validate',
      };
    }

    if (errors) {
      return { errors, values: rawValues };
    }

    return { errors: {}, values: rawValues };
  };
};

// This function returns the appropriate validation schema based on whether or not passwordLess Linodes are enabled. If passwordLess Linodes are enabled, then the root_pass field is optional. If passwordLess Linodes are not enabled, then the root_pass field is required.
// Creating Linodes from Backups and Cloning Linodes do not require a root password, so they are unaffected by the passwordLess Linodes feature and their schemas remain the same regardless of whether or not passwordLess Linodes are enabled.
export const linodeCreateResolvers = (
  isPasswordLessLinodesEnabled: boolean
) => {
  if (!isPasswordLessLinodesEnabled) {
    return {
      Backups: CreateLinodeFromBackupSchema,
      'Clone Linode': CreateLinodeSchema,
      Images: withRootPassRequired(CreateLinodeSchema),
      OS: withRootPassRequired(CreateLinodeSchema),
      'One-Click': withRootPassRequired(CreateLinodeFromMarketplaceAppSchema),
      StackScripts: withRootPassRequired(CreateLinodeFromStackScriptSchema),
    };
  }

  return {
    Backups: CreateLinodeFromBackupSchema,
    'Clone Linode': CreateLinodeSchema,
    Images: withRootPassOptional(CreateLinodeSchema),
    OS: withRootPassOptional(CreateLinodeSchema),
    'One-Click': withRootPassOptional(CreateLinodeFromMarketplaceAppSchema),
    StackScripts: withRootPassOptional(CreateLinodeFromStackScriptSchema),
  };
};
