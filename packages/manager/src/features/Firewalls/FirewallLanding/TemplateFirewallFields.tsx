import { Select, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { VPCTemplateRules } from './VPCTemplateRules';

import type { CreateFirewallFormValues } from './formUtilities';
import type { FirewallTemplateSlug } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

interface TemplateFirewallProps {
  userCannotAddFirewall: boolean;
}

const firewallTemplateOptions: SelectOption<FirewallTemplateSlug>[] = [
  {
    label: 'Public Firewall Template',
    value: 'public',
  },
  {
    label: 'VPC Firewall Template',
    value: 'vpc',
  },
];

export const TemplateFirewallFields = (props: TemplateFirewallProps) => {
  const { userCannotAddFirewall } = props;
  const { control, watch } = useFormContext<CreateFirewallFormValues>();

  const selectedTemplate = watch('templateSlug');

  return (
    <>
      {!selectedTemplate && (
        <Typography>
          Firewall templates enable you to quickly create firewalls with
          reasonable firewall rules for Public and VPC interfaces that can be
          edited.
        </Typography>
      )}
      <Controller
        render={({ field, fieldState }) => (
          <Select
            onChange={(_, item) => {
              field.onChange(item.value);
            }}
            value={
              firewallTemplateOptions.find(
                (option) => option.value === field.value
              ) ?? null
            }
            disabled={userCannotAddFirewall}
            errorText={fieldState.error?.message}
            label="Firewall Template"
            options={firewallTemplateOptions}
            placeholder="Select a Template"
          />
        )}
        control={control}
        name="templateSlug"
      />
      {selectedTemplate === 'vpc' && <VPCTemplateRules />}
    </>
  );
};
