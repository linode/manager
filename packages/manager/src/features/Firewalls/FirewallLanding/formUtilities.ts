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

interface FirewallTemplateFieldError {
  message: string;
  type: 'validate';
}

interface FirewallTemplateErrors {
  label?: FirewallTemplateFieldError;
  templateSlug?: FirewallTemplateFieldError;
}

export const createFirewallResolver =
  (): Resolver<CreateFirewallFormValues> => {
    return async (values, _, options) => {
      // if using firewall templates, we need to ensure a label is specified and a template is selected
      if (values.createFirewallFrom === 'template') {
        const errors: FirewallTemplateErrors = {};
        if (!values.templateSlug) {
          errors.templateSlug = {
            message: 'Please select a template to create a firewall from.',
            type: 'validate',
          };
        }
        if (!values.label) {
          errors.label = {
            message: 'Label is required.',
            type: 'validate',
          };
        }
        return { errors, values };
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
