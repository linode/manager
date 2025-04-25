import { Autocomplete, Notice, Typography } from '@linode/ui';
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
  // @TODO - Linode Interfaces
  // DX support (CLI, integrations, sdks) for Linode Interfaces is not yet available. Remove this when it is.
  const showDXCodeSnippets = payLoad.interface_generation !== 'linode';

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
          {!showDXCodeSnippets && (
            <Notice
              spacingTop={16}
              text={`Integration support for ${selectedIntegration.label} to create Linodes using Linode Interfaces is
              coming soon.`}
              variant="info"
            />
          )}
          {selectedIntegration.value === 'ansible' ? (
            <AnsibleIntegrationResources />
          ) : (
            <TerraformIntegrationResources />
          )}
          {showDXCodeSnippets && (
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
          )}
        </>
      )}
    </SafeTabPanel>
  );
};
