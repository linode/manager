import { yupResolver } from '@hookform/resolvers/yup';
import { omitProps } from '@linode/ui';
import { CreateFirewallSchema } from '@linode/validation';

import type {
  CreateFirewallPayload,
  FirewallTemplateSlug,
} from '@linode/api-v4';
import type { Resolver } from 'react-hook-form';

export type CreateFirewallType = 'custom' | 'template';

export interface CreateFirewallFormValues extends CreateFirewallPayload {
  createFirewallFrom?: CreateFirewallType;
  templateSlug?: FirewallTemplateSlug;
}

export const createFirewallResolver = (): Resolver<CreateFirewallFormValues> => {
  const schema = CreateFirewallSchema;
  return async (values, _, options) => {
    // resolver for creating a firewall from a template
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

    // resolver for creating a custom firewall
    const firewallPayload: CreateFirewallPayload = omitProps(values, [
      'templateSlug',
      'createFirewallFrom',
    ]);
    const { errors } = await yupResolver(
      schema,
      {},
      { mode: 'async', raw: true }
    )(firewallPayload, _, options);

    if (errors) {
      return { errors, values };
    }

    return { errors: {}, values };
  };
};
