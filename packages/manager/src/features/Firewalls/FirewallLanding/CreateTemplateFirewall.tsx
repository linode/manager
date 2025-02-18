import { Select, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { CreateFirewallFormValues } from './formUtilities';
import type { FirewallTemplateSlug } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

export interface TemplateFirewallProps {
  userCannotAddFirewall: boolean;
}

const firewallTemplateOptions: SelectOption<FirewallTemplateSlug>[] = [
  {
    label: 'Public Firewall Template',
    value: 'public',
  },
  {
    label: 'VPC Fireall Template',
    value: 'vpc',
  },
];

export const CreateTemplateFirewall = (props: TemplateFirewallProps) => {
  const { userCannotAddFirewall } = props;
  const { control } = useFormContext<CreateFirewallFormValues>();

  return (
    <>
      <Typography>
        Firewall templates enable you to quickly create firewalls with
        reasonable firewall rules for Public and VPC interfaces that can be
        edited.
      </Typography>
      <Controller
        render={({ field }) => (
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
            label="Firewall Template"
            options={firewallTemplateOptions}
            placeholder="Select a Template"
          />
        )}
        control={control}
        name="templateSlug"
      />
    </>
  );
};
