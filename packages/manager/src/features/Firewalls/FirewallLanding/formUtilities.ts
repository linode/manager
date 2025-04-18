import { yupResolver } from '@hookform/resolvers/yup';
import { omitProps } from '@linode/ui';
import { CreateFirewallSchema } from '@linode/validation';
import type { Resolver } from 'react-hook-form';

import type {
  CreateFirewallPayload,
  FirewallTemplateSlug,
} from '@linode/api-v4';

export type CreateFirewallType = 'custom' | 'template';

export interface CreateFirewallFormValues extends CreateFirewallPayload {
  /**
   * Determines whether a custom firewall or a firewall from a template will be created
   */
  createFirewallFrom?: CreateFirewallType;
  /**
   * The template slug to create a firewall from
   */
  templateSlug?: FirewallTemplateSlug;
}

export const createFirewallResolver =
  (): Resolver<CreateFirewallFormValues> => {
    return async (values, _, options) => {
      // if creating a firewall from a template, we only care if no template has been selected
      if (values.createFirewallFrom === 'template') {
        if (!values.templateSlug) {
          return {
            errors: {
              templateSlug: {
                message: 'Please select a template to create a firewall from.',
                type: 'validate',
              },
            },
            values,
          };
        } else {
          return { errors: {}, values };
        }
      }

      // otherwise, we need to validate the form based on the CreateFirewallSchema
      const firewallPayload: CreateFirewallPayload = omitProps(values, [
        'templateSlug',
        'createFirewallFrom',
      ]);
      const { errors } = await yupResolver(
        CreateFirewallSchema,
        {},
        { mode: 'async', raw: true }
      )(firewallPayload, _, options);

      if (errors) {
        return { errors, values };
      }

      return { errors: {}, values };
    };
  };
