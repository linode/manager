import { Autocomplete, Typography } from '@linode/ui';
import React, { useMemo, useState } from 'react';

import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { generateAnsibleConfig } from 'src/utilities/codesnippets/generate-ansibleConfig';
import { generateTerraformConfig } from 'src/utilities/codesnippets/generate-terraformConfig';

import { AnsibleIntegrationResources } from './AnsibleIntegrationResources';
import { TerraformIntegrationResources } from './TerraformIntegrationResources';

import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

export interface IntegrationsTabPanelProps {
  payLoad: CreateLinodeRequest;
  title: string;
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
}: IntegrationsTabPanelProps) => {
  const [selectedIntegration, setSelectedIntegration] = useState<
    OptionType | undefined
  >();

  const terraformConfig = useMemo(
    () => generateTerraformConfig(payLoad),
    [payLoad]
  );

  const ansibleConfig = useMemo(
    () => generateAnsibleConfig(payLoad),
    [payLoad]
  );

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
        disableClearable
        label="Integrations"
        onChange={(_, option) => handleIntegrationChange(option)}
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
            analyticsLabel={selectedIntegration.value}
            code={
              selectedIntegration.value === 'ansible'
                ? ansibleConfig
                : terraformConfig
            }
            language={
              selectedIntegration.value === 'ansible' ? 'yaml' : 'javascript'
            }
          />
        </>
      )}
    </SafeTabPanel>
  );
};
