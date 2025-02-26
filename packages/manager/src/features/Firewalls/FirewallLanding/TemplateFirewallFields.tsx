import { Select, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useIsAkamaiAccount } from 'src/hooks/useIsAkamaiAccount';
import { useFirewallTemplatesQuery } from 'src/queries/firewalls';

import { PublicTemplateRules } from './PublicTemplateRules';
import { VPCTemplateRules } from './VPCTemplateRules';

import type { CreateFirewallFormValues } from './formUtilities';

interface TemplateFirewallProps {
  userCannotAddFirewall: boolean;
}

const descriptionMap = {
  'akamai-non-prod': null,
  public: <PublicTemplateRules />,
  vpc: <VPCTemplateRules />,
};

const templateLabelMap = {
  'akamai-non-prod': 'Akamai Internal Firewall Template',
  public: 'Public Firewall Template',
  vpc: 'VPC Firewall Template',
};

export const TemplateFirewallFields = (props: TemplateFirewallProps) => {
  const { userCannotAddFirewall } = props;
  const { control, watch } = useFormContext<CreateFirewallFormValues>();

  const selectedTemplate = watch('templateSlug');

  const isAkamaiAccount = useIsAkamaiAccount();

  const { data: templates } = useFirewallTemplatesQuery();

  const firewallTemplateOptions =
    templates
      ?.filter(
        // if account is internal, return all slugs
        // otherwise only return non internal Akamai account slugs
        // (this endpoint shouldn't return internal templates for
        // non-internal accounts, but keeping as an extra failsafe)
        (template) => isAkamaiAccount || template.slug !== 'akamai-non-prod'
      )
      .map((template) => {
        return {
          label: templateLabelMap[template.slug],
          value: template.slug,
        };
      }) ?? [];

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
      {selectedTemplate && descriptionMap[selectedTemplate]}
    </>
  );
};
