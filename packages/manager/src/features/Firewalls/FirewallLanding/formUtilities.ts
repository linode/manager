import { yupResolver } from '@hookform/resolvers/yup';
import { omitProps } from '@linode/ui';
import { CreateFirewallSchema } from '@linode/validation';

import type {
  CreateFirewallPayload,
  FirewallTemplateSlug,
} from '@linode/api-v4';
import type { Resolver } from 'react-hook-form';

export interface CreateFirewallFormValues extends CreateFirewallPayload {
  templateSlug?: '' | FirewallTemplateSlug;
}

export const createFirewallResolver = (): Resolver<CreateFirewallFormValues> => {
  const schema = CreateFirewallSchema;
  return async (values, _, options) => {
    if (values.templateSlug) {
      return { errors: {}, values };
    }

    const firewallPayload: CreateFirewallPayload = omitProps(values, [
      'templateSlug',
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
