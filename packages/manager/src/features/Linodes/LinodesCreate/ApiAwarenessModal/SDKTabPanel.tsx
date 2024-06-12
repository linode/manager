import React, { useMemo, useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Typography } from 'src/components/Typography';
import { generateGoLinodeSnippet } from 'src/utilities/codesnippets/generate-goSDKSnippet';
import { generatePythonLinodeSnippet } from 'src/utilities/codesnippets/generate-pythonSDKSnippet';

import { CodeBlock } from '../CodeBlock/CodeBlock';
import { GoSDKResources } from './GoSDKResources';
import { PythonSDKResources } from './PythonSDKResources';

import type { OptionType } from './IntegrationsTabPanel';
import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

export interface SDKTabPanelProps {
  payLoad: CreateLinodeRequest;
  tabs: { title: string; type: string }[];
}

const sdkOptions: OptionType[] = [
  { label: 'Go (linodego)', value: 'go' },
  { label: 'Python (linode_api4-python)', value: 'python' },
];

export const SDKTabPanel = ({ payLoad, tabs }: SDKTabPanelProps) => {
  const [selectedSDK, setSelectedSDK] = useState<OptionType | null>(null);

  const linodegoSnippet = useMemo(() => generateGoLinodeSnippet(payLoad), [
    payLoad,
  ]);

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
        label="Software Developer Kits(SDK)"
        onChange={(_, option) => handleSDKChange(option!)}
        options={sdkOptions}
        placeholder="Select An SDK"
        value={selectedSDK}
      />
      {selectedSDK && (
        <>
          {selectedSDK.value === 'go' ? (
            <GoSDKResources />
          ) : (
            <PythonSDKResources />
          )}
          <CodeBlock
            command={
              selectedSDK.value === 'go' ? linodegoSnippet : pythonLinodeSnippet
            }
            commandType={tabs[3].title}
            language={'bash'}
          />
        </>
      )}
    </SafeTabPanel>
  );
};
