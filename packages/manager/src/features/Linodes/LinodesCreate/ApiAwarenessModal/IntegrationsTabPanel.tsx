import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';
import React, { useMemo, useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Typography } from 'src/components/Typography';
import { generateAnsibleConfig } from 'src/utilities/generate-ansibleConfig';
import { generateTerraformConfig } from 'src/utilities/generate-terraformConfig';

import { CodeBlock } from '../CodeBlock/CodeBlock';
import { AnsibleIntegrationResources } from './AnsibleIntegrationResources';
import { TerraformIntegrationResources } from './TerraformIntegrationResources';

export interface IntegrationsTabPanelProps {
  payLoad: CreateLinodeRequest;
  tabs: { title: string; type: string }[];
}
export interface OptionType {
  label: string;
  value: string;
}

const integrationsOptions: OptionType[] = [
  { label: 'Ansible', value: 'ansible' },
  { label: 'Terraform', value: 'terraform' },
];

export const IntegrationsTabPanel = ({
  payLoad,
  tabs,
}: IntegrationsTabPanelProps) => {
  const [
    selectedIntegration,
    setSelectedIntegration,
  ] = useState<OptionType | null>(null);

  const terraformConfig = useMemo(() => generateTerraformConfig(payLoad), [
    payLoad,
  ]);

  const ansibleConfig = useMemo(() => generateAnsibleConfig(payLoad), [
    payLoad,
  ]);

  const handleIntegrationChange = (option: OptionType) => {
    setSelectedIntegration(option);
  };
  return (
    <SafeTabPanel index={2}>
      <Typography variant="body1">
        Connect infrastructure and development tools to the Linode platform to
        manage your Linode resources.
      </Typography>
      <Autocomplete
        label="Integrations"
        onChange={(_, option) => handleIntegrationChange(option!)}
        options={integrationsOptions}
        placeholder="Select Integration"
        value={selectedIntegration}
      />
      {selectedIntegration && (
        <>
          {selectedIntegration.value === 'ansible' ? (
            <AnsibleIntegrationResources />
          ) : (
            <TerraformIntegrationResources />
          )}
          <CodeBlock
            command={
              selectedIntegration.value === 'ansible'
                ? ansibleConfig
                : terraformConfig
            }
            commandType={tabs[2].title}
            language={'bash'}
          />
        </>
      )}
    </SafeTabPanel>
  );
};
