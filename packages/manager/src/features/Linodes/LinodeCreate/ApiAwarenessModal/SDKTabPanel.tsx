import { Autocomplete, Notice, Typography } from '@linode/ui';
import React, { useMemo, useState } from 'react';

import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { generateGoLinodeSnippet } from 'src/utilities/codesnippets/generate-goSDKSnippet';
import { generatePythonLinodeSnippet } from 'src/utilities/codesnippets/generate-pythonSDKSnippet';

import { GoSDKResources } from './GoSDKResources';
import { PythonSDKResources } from './PythonSDKResources';

import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

export interface SDKTabPanelProps {
  payLoad: CreateLinodeRequest;
  title: string;
}

const sdkOptions = [
  { label: 'Go (linodego)', value: 'go' },
  { label: 'Python (linode_api4-python)', value: 'python' },
] as const;

type OptionType = (typeof sdkOptions)[number];

export const SDKTabPanel = ({ payLoad }: SDKTabPanelProps) => {
  const [selectedSDK, setSelectedSDK] = useState<OptionType | undefined>();

  // @TODO - Linode Interfaces
  // DX support (CLI, integrations, sdks) for Linode Interfaces is not yet available. Remove this when it is.
  const showDXCodeSnippets = payLoad.interface_generation !== 'linode';

  const linodegoSnippet = useMemo(
    () => generateGoLinodeSnippet(payLoad),
    [payLoad]
  );

  const pythonLinodeSnippet = useMemo(
    () => generatePythonLinodeSnippet(payLoad),
    [payLoad]
  );

  const handleSDKChange = (option: OptionType) => {
    setSelectedSDK(option);
  };

  return (
    <SafeTabPanel index={3}>
      <Typography variant="body1">
        Linode developed and supported libraries give you programmatic access to
        the Linode platform, allowing you to automate tasks through a
        fully-documented REST API.
      </Typography>
      <Autocomplete
        disableClearable
        label="Software Developer Kits (SDK)"
        onChange={(_, option) => handleSDKChange(option)}
        options={sdkOptions}
        placeholder="Select An SDK"
        value={selectedSDK}
      />
      {selectedSDK && (
        <>
          {!showDXCodeSnippets && (
            <Notice
              spacingTop={16}
              text={`SDK support for ${selectedSDK.label} to create Linodes using Linode Interfaces is
              coming soon.`}
              variant="info"
            />
          )}
          {selectedSDK.value === 'go' ? (
            <GoSDKResources />
          ) : (
            <PythonSDKResources />
          )}
          {showDXCodeSnippets && (
            <CodeBlock
              analyticsLabel={selectedSDK.value}
              code={
                selectedSDK.value === 'go'
                  ? linodegoSnippet
                  : pythonLinodeSnippet
              }
              language={selectedSDK.value}
            />
          )}
        </>
      )}
    </SafeTabPanel>
  );
};
